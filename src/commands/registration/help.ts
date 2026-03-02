import _ from 'lodash';
import registry from '../registry';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'HELP',
  handler: function (this: any, { command }: any = {}) {
    const directive = _.upperCase(command.arg);
    if (directive) {
      if (!Object.prototype.hasOwnProperty.call(registry, directive))
        return this.reply(502, `Unknown command ${directive}.`);

      const cmd = registry[directive];
      const syntax = (cmd.syntax || '').replace('{{cmd}}', directive);
      const description = cmd.description || '';
      return this.reply(214, syntax, description);
    } else {
      const supportedCommands = _.chunk(Object.keys(registry), 5).map(
        (chunk: string[]) => chunk.join('\t')
      );
      return this.reply(
        211,
        'Supported commands:',
        ...supportedCommands,
        'Use "HELP [command]" for syntax help.'
      );
    }
  },
  syntax: '{{cmd}} [<command>]',
  description:
    'Returns usage documentation on a command if specified, else a general help document is returned',
  flags: { no_auth: true },
} as CommandDescriptor;
