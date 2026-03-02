import type { CommandDescriptor } from '../registry';

export default {
  directive: 'PASS',
  handler: function (this: any, { log, command }: any = {}) {
    if (!(this as any).username) return this.reply(503);
    if (this.authenticated) return this.reply(202);

    const password = command.arg;
    if (!password) return this.reply(501, 'Must provide password');
    return this.login((this as any).username, password)
      .then(() => this.reply(230))
      .catch((err: Error) => {
        log.error(err);
        return this.reply(530, err.message || 'Authentication failed');
      });
  },
  syntax: '{{cmd}} <password>',
  description: 'Authentication password',
  flags: { no_auth: true },
} as CommandDescriptor;
