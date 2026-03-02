
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'RETR',
  handler: function (this: any, { log, command }: any = {}) {
    if (!this.fs) return this.reply(550, 'File system not instantiated');
    if (!this.fs.read) return this.reply(402, 'Not supported by file system');

    const filePath = command.arg;

    return this.connector
      .waitForConnection()
      .then(() => { this.commandSocket.pause(); })
      .then(() =>
        Promise.try(() =>
          this.fs!.read(filePath, { start: this.restByteCount })
        )
      )
      .then((fsResponse: any) => {
        let { stream, clientPath } = fsResponse;
        if (!stream && !clientPath) {
          stream = fsResponse;
          clientPath = filePath;
        }
        const serverPath = stream.path || filePath;

        const destroyConnection = (connection: any, reject: (e: Error) => void) => (err: Error) => {
          if (connection) connection.destroy(err);
          reject(err);
        };

        const eventsPromise = new Promise((resolve, reject) => {
          stream.on('data', (data: Buffer) => {
            if (stream) stream.pause();
            if (this.connector.socket) {
              this.connector.socket.write(data, () => stream && stream.resume());
            }
          });
          stream.once('end', () => resolve(undefined));
          stream.once('error', destroyConnection(this.connector.socket, reject));
          this.connector.socket.once('error', destroyConnection(stream, reject));
        });

        this.restByteCount = 0;

        return this.reply(150)
          .then(() => stream.resume() && this.connector.socket.resume())
          .then(() => eventsPromise)
          .then(() => { this.emit('RETR', null, serverPath); })
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
        this.emit('RETR', err);
        return this.reply(551, err.message);
      })
      .then(() => {
        this.connector.end();
        this.commandSocket.resume();
      });
  },
  syntax: '{{cmd}} <path>',
  description: 'Retrieve a copy of the file',
} as CommandDescriptor;
