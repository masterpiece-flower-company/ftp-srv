
import _ from 'lodash';
import registry from './registry';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'SITE',
  handler: function (this: any, { log, command }: any = {}) {
    const rawSubCommand = _.get(command, 'arg', '');
    const subCommand = this.commands.parse(rawSubCommand);
    const subLog = log.child({ subverb: subCommand.directive });

    if (!Object.prototype.hasOwnProperty.call(registry, subCommand.directive))
      return this.reply(502);

    const handler = registry[subCommand.directive].handler.bind(this);
    return Promise.resolve(handler({ log: subLog, command: subCommand }));
  },
  syntax: '{{cmd}} <subVerb> [...<subParams>]',
  description: 'Sends site specific commands to remote server',
} as CommandDescriptor;
