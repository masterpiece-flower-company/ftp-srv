import type { CommandDescriptor } from '../registry';

export default {
  directive: 'STRU',
  handler: function (this: any, { command }: any = {}) {
    return this.reply(/^F$/i.test(command.arg) ? 200 : 504);
  },
  syntax: '{{cmd}} <structure>',
  description: 'Set file transfer structure',
  flags: { obsolete: true },
} as CommandDescriptor;
