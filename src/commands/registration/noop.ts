import type { CommandDescriptor } from '../registry';

export default {
  directive: 'NOOP',
  handler: function (this: any) {
    return this.reply(200);
  },
  syntax: '{{cmd}}',
  description: 'No operation',
  flags: { no_auth: true },
} as CommandDescriptor;
