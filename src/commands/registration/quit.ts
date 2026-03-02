import type { CommandDescriptor } from '../registry';

export default {
  directive: 'QUIT',
  handler: function (this: any) {
    return this.close(221, 'Client called QUIT');
  },
  syntax: '{{cmd}}',
  description: 'Disconnect',
  flags: { no_auth: true },
} as CommandDescriptor;
