import Promise from 'bluebird';
import stor from './stor';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'STOU',
  handler: function (this: any, args: any) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get || !this.fs.getUniqueName)
      return this.reply(402, 'Not supported by file system');

    const fileName = args.command.arg;
    return Promise.try(() => this.fs.get(fileName))
      .then(() => this.fs!.getUniqueName())
      .catch(() => fileName)
      .then((name: string) => {
        args.command.arg = name;
        return stor.handler.call(this, args);
      });
  },
  syntax: '{{cmd}}',
  description: 'Store file uniquely',
} as CommandDescriptor;
