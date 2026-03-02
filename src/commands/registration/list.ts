import _ from 'lodash';

import getFileStat from '../../helpers/file-stat';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'LIST',
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.get) return this.reply(402, 'Not supported by file system');
    if (!this.fs.list) return this.reply(402, 'Not supported by file system');

    const simple = command.directive === 'NLST';
    const path = command.arg || '.';

    return this.connector
      .waitForConnection()
      .then(() => { this.commandSocket.pause(); })
      .then(() => Promise.try(() => this.fs!.get(path)))
      .then((stat: any) =>
        stat.isDirectory()
          ? Promise.try(() => this.fs!.list(path))
          : [stat]
      )
      .then((files: any[]) => {
        const getFileMessage = (file: any) => {
          if (simple) return file.name;
          return getFileStat(
            file,
            _.get(this, 'server.options.file_format', 'ls')
          );
        };
        return Promise.try(() =>
          files.map((file: any) => ({
            raw: true,
            message: getFileMessage(file),
            socket: this.connector.socket,
          }))
        );
      })
      .then((fileList: any[]) => this.reply(150).then(() => fileList))
      .then((fileList: any[]) => {
        if (fileList.length) return this.reply({}, ...fileList);
        return this.reply({
          socket: this.connector.socket,
          useEmptyMessage: true,
        });
      })
      .then(() => this.reply(226) as Promise<any>)
      .catch((err: any) => {
        if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
          log.error(err);
          return this.reply(425, 'No connection established');
        }
        throw err;
      })
      .catch((err: Error) => {
        log.error(err);
        return this.reply(451, err.message || 'No directory');
      })
      .then(() => {
        this.connector.end();
        this.commandSocket.resume();
      });
  },
  syntax: '{{cmd}} [<path>]',
  description:
    'Returns information of a file or directory if specified, else information of the current working directory is returned',
} as CommandDescriptor;
