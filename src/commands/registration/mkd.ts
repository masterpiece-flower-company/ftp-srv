import Promise from 'bluebird';
import escapePath from '../../helpers/escape-path';
import type { CommandDescriptor } from '../registry';

export default {
  directive: ['MKD', 'XMKD'],
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.mkdir) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.mkdir(command.arg))
      .then((dir: string) => {
        const path = dir ? `"${escapePath(dir)}"` : undefined;
        return this.reply(257, path);
      })
      .catch((err: Error) => {
        log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Make directory',
} as CommandDescriptor;
