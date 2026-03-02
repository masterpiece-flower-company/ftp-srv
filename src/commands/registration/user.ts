import type { CommandDescriptor } from '../registry';

export default {
  directive: 'USER',
  handler: function (this: any, { log, command }: any = {}) {
    if ((this as any).username) return this.reply(530, 'Username already set');
    if (this.authenticated) return this.reply(230);

    (this as any).username = command.arg;
    if (!(this as any).username) return this.reply(501, 'Must provide username');

    if (
      (this.server.options.anonymous === true &&
        (this as any).username === 'anonymous') ||
      (this as any).username === this.server.options.anonymous
    ) {
      return this.login((this as any).username, '@anonymous')
        .then(() => this.reply(230))
        .catch((err: Error) => {
          log.error(err);
          return this.reply(530, err.message || 'Authentication failed');
        });
    }
    return this.reply(331);
  },
  syntax: '{{cmd}} <username>',
  description: 'Authentication username',
  flags: { no_auth: true },
} as CommandDescriptor;
