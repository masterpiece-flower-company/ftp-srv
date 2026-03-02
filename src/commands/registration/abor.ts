import type { CommandDescriptor } from '../registry';

export default {
  directive: 'ABOR',
  handler: function (this: any) {
    return this.connector
      .waitForConnection()
      .then((socket: any) => {
        return this.reply(426, { socket }).then(() => this.reply(226));
      })
      .catch(() => this.reply(225))
      .then(() => this.connector.end());
  },
  syntax: '{{cmd}}',
  description: 'Abort an active file transfer',
} as CommandDescriptor;
