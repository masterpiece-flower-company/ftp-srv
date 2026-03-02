import Promise from 'bluebird';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'DELE',
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.delete) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.delete(command.arg))
      .then(() => this.reply(250))
      .catch((err: Error) => {
        log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Delete file',
} as CommandDescriptor;
