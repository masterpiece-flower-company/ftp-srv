import Promise from 'bluebird';
import moment from 'moment';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'MDTM',
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');

    return Promise.try(() => this.fs.get(command.arg))
      .then((fileStat: any) => {
        const modificationTime = moment
          .utc(fileStat.mtime)
          .format('YYYYMMDDHHmmss.SSS');
        return this.reply(213, modificationTime);
      })
      .catch((err: Error) => {
        log.error(err);
        return this.reply(550, err.message);
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Return the last-modified time of a specified file',
  flags: { feat: 'MDTM' },
} as CommandDescriptor;
