import _ from 'lodash';
import Promise from 'bluebird';
import type FtpConnection from '../connection';
import type { Logger } from '../logger';
import REGISTRY from './registry';

const CMD_FLAG_REGEX = /^-(\w{1})$/;

export interface ParsedCommand {
  directive: string;
  arg: string | null;
  flags: string[];
  raw: string;
}

export default class FtpCommands {
  connection: FtpConnection;
  previousCommand: ParsedCommand | Record<string, any>;
  blacklist: string[];
  whitelist: string[];

  constructor(connection: FtpConnection) {
    this.connection = connection;
    this.previousCommand = {};
    this.blacklist = _.get(this.connection, 'server.options.blacklist', []).map(
      (cmd: string) => _.upperCase(cmd)
    );
    this.whitelist = _.get(this.connection, 'server.options.whitelist', []).map(
      (cmd: string) => _.upperCase(cmd)
    );
  }

  parse(message: string): ParsedCommand {
    const strippedMessage = message.replace(/"/g, '');
    let [directive, ...args] = strippedMessage.split(' ');
    directive = _.chain(directive).trim().toUpper().value();

    const parseCommandFlags = !['RETR', 'SIZE', 'STOR'].includes(directive);
    const params = args.reduce(
      ({ arg, flags }, param) => {
        if (parseCommandFlags && CMD_FLAG_REGEX.test(param)) flags.push(param);
        else arg.push(param);
        return { arg, flags };
      },
      { arg: [] as string[], flags: [] as string[] }
    );

    return {
      directive,
      arg: params.arg.length ? params.arg.join(' ') : null,
      flags: params.flags,
      raw: message,
    };
  }

  handle(command: string | ParsedCommand): Promise<any> {
    const parsed =
      typeof command === 'string' ? this.parse(command) : command;

    const logCommand = _.clone(parsed);
    if (logCommand.directive === 'PASS') (logCommand as any).arg = '********';

    const log = this.connection.log.child({ directive: parsed.directive });
    log.trace({ command: logCommand }, 'Handle command');

    if (!Object.prototype.hasOwnProperty.call(REGISTRY, parsed.directive)) {
      return this.connection.reply(
        502,
        `Command not allowed: ${parsed.directive}`
      );
    }

    if (_.includes(this.blacklist, parsed.directive)) {
      return this.connection.reply(
        502,
        `Command blacklisted: ${parsed.directive}`
      );
    }

    if (
      this.whitelist.length > 0 &&
      !_.includes(this.whitelist, parsed.directive)
    ) {
      return this.connection.reply(
        502,
        `Command not whitelisted: ${parsed.directive}`
      );
    }

    const commandRegister = REGISTRY[parsed.directive];
    const commandFlags = _.get(commandRegister, 'flags', {});
    if (
      !commandFlags.no_auth &&
      !this.connection.authenticated
    ) {
      return this.connection.reply(
        530,
        `Command requires authentication: ${parsed.directive}`
      );
    }

    if (!commandRegister.handler) {
      return this.connection.reply(
        502,
        `Handler not set on command: ${parsed.directive}`
      );
    }

    const handler = commandRegister.handler.bind(this.connection);
    return Promise.resolve(
      handler({
        log,
        command: parsed,
        previous_command: this.previousCommand,
      })
    ).then(() => {
      this.previousCommand = _.clone(parsed);
    });
  }
}
