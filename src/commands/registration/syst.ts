import type { CommandDescriptor } from '../registry';

export default {
  directive: 'SYST',
  handler: function (this: any) {
    return this.reply(215);
  },
  syntax: '{{cmd}}',
  description: 'Return system type',
  flags: { no_auth: true },
} as CommandDescriptor;
