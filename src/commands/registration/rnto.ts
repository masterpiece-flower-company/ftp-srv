
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'RNTO',
  handler: function (this: any, { log, command }: any = {}) {
    if (!(this as any).renameFrom) return this.reply(503);

    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.rename)
      return this.reply(402, 'Not supported by file system');

    const from = (this as any).renameFrom;
    const to = command.arg;

    return Promise.try(() => this.fs.rename(from, to))
      .then(() => this.reply(250))
      .tap(() => this.emit('RNTO', null, to))
      .catch((err: Error) => {
        log.error(err);
        this.emit('RNTO', err);
        return this.reply(550, err.message);
      })
      .then(() => {
        delete (this as any).renameFrom;
      });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename to',
} as CommandDescriptor;
