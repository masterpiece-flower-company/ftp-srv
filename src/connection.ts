import _ from 'lodash';
import * as uuid from 'uuid';

import { EventEmitter } from 'events';

import Connector from './connector/base';
import FileSystem from './fs';
import Commands from './commands';
import * as errors from './errors';
import DEFAULT_MESSAGE from './messages';
import type { Logger } from './logger';

export interface ReplyOptions {
  code?: number;
  socket?: any;
  useEmptyMessage?: boolean;
  eol?: boolean;
  hasOwnProperty?(key: string): boolean;
}

export interface ReplyLetter {
  socket?: any;
  message?: string;
  encoding?: string;
  code?: number;
  raw?: boolean;
}

export default class FtpConnection extends EventEmitter {
  server: any;
  id: string;
  commandSocket: any;
  log: Logger;
  commands: Commands;
  transferType: string;
  encoding: string;
  bufferSize: boolean;
  _restByteCount: number;
  _secure: boolean;
  connector: Connector;
  authenticated?: boolean;
  fs?: FileSystem;

  constructor(server: any, options: { log: Logger; socket: any }) {
    super();
    this.server = server;
    this.id = uuid.v4();
    this.commandSocket = options.socket;
    this.log = options.log.child({ id: this.id, ip: this.ip });
    this.commands = new Commands(this);
    this.transferType = 'binary';
    this.encoding = 'utf8';
    this.bufferSize = false;
    this._restByteCount = 0;
    this._secure = false;

    this.connector = new Connector(this);

    this.commandSocket.on('error', (err: Error) => {
      this.log.error(err, 'Client error');
      this.server.emit('client-error', {
        connection: this,
        context: 'commandSocket',
        error: err,
      });
    });
    this.commandSocket.on('data', this._handleData.bind(this));
    this.commandSocket.on('timeout', () => {
      this.log.trace('Client timeout');
      this.close();
    });
    this.commandSocket.on('close', () => {
      if (this.connector) this.connector.end();
      if (this.commandSocket && !this.commandSocket.destroyed)
        this.commandSocket.destroy();
      this.removeAllListeners();
    });
  }

  _handleData(data: Buffer): Promise<any> {
    const messages = _.compact(
      data.toString(this.encoding).split('\r\n')
    );
    this.log.trace(messages);
    return Promise.mapSeries(messages, (message: string) =>
      this.commands.handle(message)
    );
  }

  get ip(): string | undefined | null {
    try {
      return this.commandSocket
        ? this.commandSocket.remoteAddress
        : undefined;
    } catch {
      return null;
    }
  }

  get restByteCount(): number | undefined {
    return this._restByteCount > 0 ? this._restByteCount : undefined;
  }
  set restByteCount(rbc: number) {
    this._restByteCount = rbc;
  }

  get secure(): boolean {
    return this.server.isTLS || this._secure;
  }
  set secure(sec: boolean) {
    this._secure = sec;
  }

  close(code: number = 421, message: string = 'Closing connection'): Promise<any> {
    return Promise.resolve(code)
      .then((_code) => _code && this.reply(_code, message))
      .then(() => this.commandSocket && this.commandSocket.destroy());
  }

  login(username: string, password: string): Promise<any> {
    return Promise.try(() => {
      const loginListeners = this.server.listeners('login');
      if (!loginListeners || !loginListeners.length) {
        if (!this.server.options.anonymous)
          throw new errors.GeneralError('No "login" listener setup', 500);
      } else {
        return this.server.emitPromise('login', {
          connection: this,
          username,
          password,
        });
      }
    }).then(
      ({
        root,
        cwd,
        fs,
        blacklist = [],
        whitelist = [],
      }: {
        root?: string;
        cwd?: string;
        fs?: FileSystem;
        blacklist?: string[];
        whitelist?: string[];
      } = {}) => {
        this.authenticated = true;
        this.commands.blacklist = _.concat(
          this.commands.blacklist,
          blacklist
        );
        this.commands.whitelist = _.concat(
          this.commands.whitelist,
          whitelist
        );
        this.fs = fs || new FileSystem(this, { root, cwd });
      }
    );
  }

  reply(
    options: ReplyOptions | number = {},
    ...letters: any[]
  ): Promise<any> {
    const satisfyParameters = (): Promise<ReplyLetter[]> => {
      let opts: ReplyOptions =
        typeof options === 'number' ? { code: options } : options;
      let lets = !Array.isArray(letters) ? [letters] : letters;
      if (!lets.length) lets = [{}];
      return Promise.map(lets, (promise: any, index: number) => {
        return Promise.resolve(promise).then((letter: ReplyLetter) => {
          let l: ReplyLetter = letter;
          if (!l) l = {};
          else if (typeof letter === 'string') l = { message: letter };

          if (!l.socket)
            l.socket = opts.socket ? opts.socket : this.commandSocket;
          if (!opts.useEmptyMessage) {
            if (!l.message)
              l.message =
                DEFAULT_MESSAGE[opts.code as number] || 'No information';
            if (!l.encoding) l.encoding = this.encoding;
          }
          return Promise.resolve(l.message).then((message: string) => {
            if (!opts.useEmptyMessage) {
              const seperator =
                !Object.prototype.hasOwnProperty.call(opts, 'eol')
                  ? lets.length - 1 === index
                    ? ' '
                    : '-'
                  : opts.eol
                  ? ' '
                  : '-';
              message = !l.raw
                ? _.compact([l.code || opts.code, message]).join(seperator)
                : message;
              l.message = message;
            } else {
              l.message = '';
            }
            return l;
          });
        });
      });
    };

    const processLetter = (letter: ReplyLetter): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (letter.socket && letter.socket.writable) {
          this.log.trace(
            {
              port: letter.socket.address().port,
              encoding: letter.encoding,
              message: letter.message,
            },
            'Reply'
          );
          letter.socket.write(
            letter.message + '\r\n',
            letter.encoding,
            (error?: Error) => {
              if (error) {
                this.log.error('[Process Letter] Socket Write Error', {
                  error: error.message,
                });
                return reject(error);
              }
              resolve();
            }
          );
        } else {
          this.log.trace(
            { message: letter.message },
            'Could not write message'
          );
          reject(new errors.SocketError('Socket not writable'));
        }
      });
    };

    return satisfyParameters()
      .then((satisfiedLetters) =>
        Promise.mapSeries(satisfiedLetters, (letter, index) =>
          processLetter(letter)
        )
      )
      .catch((error: Error) => {
        this.log.error('Satisfy Parameters Error', {
          error: error.message,
        });
      }) as Promise<any>;
  }
}
