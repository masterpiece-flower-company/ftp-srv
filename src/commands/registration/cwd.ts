
import escapePath from '../../helpers/escape-path';
import type { CommandDescriptor } from '../registry';

export default {
  directive: ['CWD', 'XCWD'],
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.chdir) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.chdir(command.arg))
      .then((cwd: string) => {
        const path = cwd ? `"${escapePath(cwd)}"` : undefined;
        return this.reply(250, path);
      })
      .catch((err: Error) => {
        log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Change working directory',
} as CommandDescriptor;
