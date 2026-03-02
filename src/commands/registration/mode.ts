import type { CommandDescriptor } from '../registry';

export default {
  directive: 'MODE',
  handler: function (this: any, { command }: any = {}) {
    return this.reply(/^S$/i.test(command.arg) ? 200 : 504);
  },
  syntax: '{{cmd}} <mode>',
  description:
    'Sets the transfer mode (Stream, Block, or Compressed)',
  flags: { obsolete: true },
} as CommandDescriptor;
