import Promise from 'bluebird';
import escapePath from '../../helpers/escape-path';
import type { CommandDescriptor } from '../registry';

export default {
  directive: ['PWD', 'XPWD'],
  handler: function (this: any, { log }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.currentDirectory)
      return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.currentDirectory())
      .then((cwd: string) => {
        const path = cwd ? `"${escapePath(cwd)}"` : undefined;
        return this.reply(257, path);
      })
      .catch((err: Error) => {
        log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}}',
  description: 'Print current working directory',
} as CommandDescriptor;
