import _ from 'lodash';

import getFileStat from '../../helpers/file-stat';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'STAT',
  handler: function (this: any, args: any = {}) {
    const { log, command } = args;
    const path = _.get(command, 'arg');
    if (path) {
      if (!this.fs) return this.reply(550, 'File system not instantiated');
      if (!this.fs.get) return this.reply(402, 'Not supported by file system');

      return Promise.try(() => this.fs.get(path))
        .then((stat: any) => {
          if (stat.isDirectory()) {
            if (!this.fs!.list)
              return this.reply(402, 'Not supported by file system');
            return Promise.try(() => this.fs!.list(path)).then((stats: any[]) => [
              213,
              stats,
            ]);
          }
          return [212, [stat]];
        })
        .then(([code, fileStats]: [number, any[]]) => {
          return Promise.map(fileStats, (file: any) => {
            const message = getFileStat(
              file,
              _.get(this, 'server.options.file_format', 'ls')
            );
            return { raw: true, message };
          }).then((messages) => [code, messages]);
        })
        .then(([code, messages]: [number, any[]]) =>
          this.reply(code, 'Status begin', ...messages, 'Status end')
        )
        .catch((err: Error) => {
          log.error(err);
          return this.reply(450, err.message);
        });
    } else {
      return this.reply(211, 'Status OK');
    }
  },
  syntax: '{{cmd}} [<path>]',
  description: 'Returns the current status',
} as CommandDescriptor;
