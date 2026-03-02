import { Socket } from 'net';
import tls from 'tls';
import ip from 'neoip';
import Promise from 'bluebird';
import Connector from './base';
import { SocketError } from '../errors';

export default class Active extends Connector {
  declare dataSocket: any;

  constructor(connection: any) {
    super(connection);
    this.type = 'active';
  }

  waitForConnection({
    timeout = 5000,
    delay = 250,
  }: { timeout?: number; delay?: number } = {}): Promise<any> {
    const checkSocket = (): Promise<any> => {
      if (this.dataSocket && this.dataSocket.connected) {
        return Promise.resolve(this.dataSocket);
      }
      return Promise.resolve()
        .delay(delay)
        .then(() => checkSocket());
    };

    return (checkSocket() as Promise<any>).timeout(timeout);
  }

  setupConnection(host: string, port: number, family: number = 4): Promise<void> {
    const closeExistingServer = () =>
      Promise.resolve(
        this.dataSocket ? this.dataSocket.destroy() : undefined
      );

    return closeExistingServer().then(() => {
      if (
        !ip.isEqual(this.connection.commandSocket.remoteAddress, host)
      ) {
        throw new SocketError('The given address is not yours', 500);
      }

      this.dataSocket = new Socket();
      this.dataSocket.on('error', (err: Error) =>
        this.server &&
        this.server.emit('client-error', {
          connection: this.connection,
          context: 'dataSocket',
          error: err,
        })
      );
      this.dataSocket.connect({ host, port, family }, () => {
        this.dataSocket.pause();

        if (this.connection.secure) {
          const secureContext = tls.createSecureContext(
            this.server.options.tls
          );
          const secureSocket = new tls.TLSSocket(this.dataSocket, {
            isServer: true,
            secureContext,
          });
          this.dataSocket = secureSocket;
        }
        this.dataSocket.connected = true;
      });
    }) as Promise<void>;
  }
}
