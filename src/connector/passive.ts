import net from 'net';
import tls from 'tls';
import ip from 'neoip';

import Connector from './base';
import * as errors from '../errors';

const CONNECT_TIMEOUT = 30 * 1000;

export default class Passive extends Connector {
  declare dataServer: net.Server | tls.Server | null;
  declare dataSocket: any;

  constructor(connection: any) {
    super(connection);
    this.type = 'passive';
  }

  waitForConnection({
    timeout = 5000,
    delay = 50,
  }: { timeout?: number; delay?: number } = {}): Promise<any> {
    if (!this.dataServer)
      return Promise.reject(
        new errors.ConnectorError('Passive server not setup')
      );

    const checkSocket = (): Promise<any> => {
      if (
        this.dataServer &&
        (this.dataServer as net.Server).listening &&
        this.dataSocket &&
        (this.dataSocket as any).connected
      ) {
        return Promise.resolve(this.dataSocket);
      }
      return Promise.resolve()
        .delay(delay)
        .then(() => checkSocket());
    };

    return (checkSocket() as Promise<any>).timeout(timeout);
  }

  setupServer(): Promise<any> {
    this.closeServer();
    const getNextPort = this.server.getNextPasvPort;
    if (!getNextPort) return Promise.reject(new errors.ConnectorError("No getNextPasvPort"));
    return getNextPort().then((port: number) => {
      this.dataSocket = null;
      let idleServerTimeout: NodeJS.Timeout;

      const connectionHandler = (socket: any) => {
        if (
          !ip.isEqual(
            this.connection.commandSocket.remoteAddress,
            socket.remoteAddress
          )
        ) {
          this.log.error(
            {
              pasv_connection: socket.remoteAddress,
              cmd_connection: this.connection.commandSocket.remoteAddress,
            },
            'Connecting addresses do not match'
          );

          socket.destroy();
          return this.connection
            .reply(550, 'Remote addresses do not match')
            .then(() => this.connection.close());
        }
        clearTimeout(idleServerTimeout);

        this.log.trace(
          { port, remoteAddress: socket.remoteAddress },
          'Passive connection fulfilled.'
        );

        this.dataSocket = socket;
        this.dataSocket.on('error', (err: Error) =>
          this.server &&
          this.server.emit('client-error', {
            connection: this.connection,
            context: 'dataSocket',
            error: err,
          })
        );
        this.dataSocket.once('close', () => this.closeServer());

        if (!this.connection.secure) {
          this.dataSocket.connected = true;
        }
      };

      const serverOptions = Object.assign(
        {},
        this.connection.secure ? this.server.options.tls : {},
        { pauseOnConnect: true }
      );
      this.dataServer = (this.connection.secure ? tls : net).createServer(
        serverOptions,
        connectionHandler
      );
      this.dataServer.maxConnections = 1;

      this.dataServer.on('error', (err: Error) =>
        this.server &&
        this.server.emit('client-error', {
          connection: this.connection,
          context: 'dataServer',
          error: err,
        })
      );
      this.dataServer.once('close', () => {
        this.log.trace('Passive server closed');
        this.end();
      });

      if (this.connection.secure) {
        this.dataServer.on('secureConnection', (socket: any) => {
          socket.connected = true;
        });
      }

      return new Promise((resolve, reject) => {
        this.dataServer!.listen(
          port,
          this.server.url.hostname,
          (err?: Error) => {
            if (err) reject(err);
            else {
              idleServerTimeout = setTimeout(
                () => this.closeServer(),
                CONNECT_TIMEOUT
              );

              this.log.debug({ port }, 'Passive connection listening');
              resolve(this.dataServer);
            }
          }
        );
      });
    }).catch((error: Error) => {
      this.log.trace(error.message);
      throw error;
    });
  }
}
