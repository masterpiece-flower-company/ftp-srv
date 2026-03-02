import Promise from 'bluebird';
import * as errors from '../errors';
import type { Logger } from '../logger';

export interface FtpConnectionLike {
  log: Logger;
  commandSocket: { remoteAddress?: string; destroyed?: boolean };
  server: { options: { tls?: any }; url: { hostname: string }; emit: (e: string, d: any) => void; getNextPasvPort?: () => Promise<number> };
  secure?: boolean;
  reply: (code: number, msg: string) => Promise<any>;
  close: () => Promise<any>;
  connector: Connector | any;
}

export default class Connector {
  connection: FtpConnectionLike;
  dataSocket: any;
  dataServer: any;
  type: string | false;

  constructor(connection: FtpConnectionLike) {
    this.connection = connection;
    this.dataSocket = null;
    this.dataServer = null;
    this.type = false;
  }

  get log(): Logger {
    return this.connection.log;
  }

  get socket(): any {
    return this.dataSocket;
  }

  get server(): any {
    return this.connection.server;
  }

  waitForConnection(): Promise<any> {
    return Promise.reject(
      new errors.ConnectorError('No connector setup, send PASV or PORT')
    );
  }

  closeSocket(): void {
    if (this.dataSocket) {
      const socket = this.dataSocket;
      this.dataSocket.end(() => socket && socket.destroy());
      this.dataSocket = null;
    }
  }

  closeServer(): void {
    if (this.dataServer) {
      this.dataServer.close();
      this.dataServer = null;
    }
  }

  end(): void {
    this.closeSocket();
    this.closeServer();
    this.type = false;
    this.connection.connector = new Connector(this.connection);
  }
}
