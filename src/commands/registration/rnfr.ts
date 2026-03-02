import Promise from 'bluebird';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'RNFR',
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    const fileName = command.arg;
    return Promise.try(() => this.fs.get(fileName))
      .then(() => {
        (this as any).renameFrom = fileName;
        return this.reply(350);
      })
      .catch((err: Error) => {
        log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <name>',
  description: 'Rename from',
} as CommandDescriptor;
