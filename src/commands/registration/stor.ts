import Promise from 'bluebird';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'STOR',
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.write) return this.reply(402, 'Not supported by file system');

    const append = command.directive === 'APPE';
    const fileName = command.arg;

    return this.connector
      .waitForConnection()
      .then(() => { this.commandSocket.pause(); })
      .then(() =>
        Promise.try(() =>
          this.fs!.write(fileName, {
            append,
            start: this.restByteCount,
          })
        )
      )
      .then((fsResponse: any) => {
        let { stream, clientPath } = fsResponse;
        if (!stream && !clientPath) {
          stream = fsResponse;
          clientPath = fileName;
        }
        const serverPath = stream.path || fileName;

        const destroyConnection = (connection: any, reject: (e: Error) => void) => (err: Error) => {
          try {
            if (connection) {
              if (connection.writable) connection.end();
              connection.destroy(err);
            }
          } finally {
            reject(err);
          }
        };

        const streamPromise = new Promise((resolve, reject) => {
          stream.once('error', destroyConnection(this.connector.socket, reject));
          stream.once('finish', () => resolve(undefined));
        });

        const socketPromise = new Promise((resolve, reject) => {
          this.connector.socket.pipe(stream, { end: false });
          this.connector.socket.once('end', () => {
            if (stream.listenerCount('close')) stream.emit('close');
            else stream.end();
            resolve(undefined);
          });
          this.connector.socket.once('error', destroyConnection(stream, reject));
        });

        this.restByteCount = 0;

        return this.reply(150)
          .then(() => this.connector.socket && this.connector.socket.resume())
          .then(() => Promise.all([streamPromise, socketPromise]))
          .then(() => { this.emit('STOR', null, serverPath); })
          .then(() => this.reply(226, clientPath))
          .then(() => stream.destroy && stream.destroy());
      })
      .catch((err: any) => {
        if (err.name === 'TimeoutError' || err.code === 'ETIMEDOUT') {
          log.error(err);
          return this.reply(425, 'No connection established');
        }
        throw err;
      })
      .catch((err: Error) => {
        log.error(err);
        this.emit('STOR', err);
        return this.reply(550, err.message);
      })
      .then(() => {
        this.connector.end();
        this.commandSocket.resume();
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Store data as a file at the server site',
} as CommandDescriptor;
