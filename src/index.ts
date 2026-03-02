import _ from 'lodash';

import nodeUrl from 'url';
import net from 'net';
import tls from 'tls';
import { EventEmitter } from 'events';

import { createLogger, type Logger } from './logger';
import Connection from './connection';
import { getNextPortFactory } from './helpers/find-port';

export interface FtpServerOptions {
  log?: Logger;
  url?: string;
  pasv_min?: number;
  pasv_max?: number;
  pasv_url?: string | null | ((ip: string) => string | Promise<string>);
  anonymous?: boolean | string;
  file_format?: string | ((stat: any) => string | Promise<string>);
  blacklist?: string[];
  whitelist?: string[];
  greeting?: string | string[] | null;
  tls?: tls.TlsOptions | false;
  timeout?: number;
  endOnProcessSignal?: boolean;
}

export default class FtpServer extends EventEmitter {
  options: FtpServerOptions & {
    log: Logger;
    url: string;
    pasv_min: number;
    pasv_max: number;
    pasv_url: string | null;
    timeout: number;
  };
  _greeting: string[];
  _features: string;
  connections: Record<string, Connection>;
  log: Logger;
  url: nodeUrl.UrlWithStringQuery;
  getNextPasvPort: () => Promise<number>;
  server: net.Server | tls.Server;

  constructor(options: FtpServerOptions = {}) {
    super();
    this.options = Object.assign(
      {
        log: createLogger({ name: 'ftp-srv' }),
        url: 'ftp://127.0.0.1:21',
        pasv_min: 1024,
        pasv_max: 65535,
        pasv_url: null,
        anonymous: false,
        file_format: 'ls',
        blacklist: [],
        whitelist: [],
        greeting: null,
        tls: false,
        timeout: 0,
        endOnProcessSignal: true,
      },
      options
    );

    this._greeting = this.setupGreeting(this.options.greeting);
    this._features = this.setupFeaturesMessage();

    delete (this.options as any).greeting;

    this.connections = {};
    this.log = this.options.log;
    this.url = nodeUrl.parse(this.options.url);
    this.getNextPasvPort = getNextPortFactory(
      _.get(this, 'url.hostname'),
      _.get(this, 'options.pasv_min'),
      _.get(this, 'options.pasv_max')
    );

    const timeout = Number(this.options.timeout);
    this.options.timeout = isNaN(timeout) ? 0 : timeout;

    const serverConnectionHandler = (socket: any) => {
      if (this.options.timeout > 0) socket.setTimeout(this.options.timeout);
      const connection = new Connection(this, { log: this.log, socket });
      this.connections[connection.id] = connection;

      socket.on('close', () => this.disconnectClient(connection.id));
      socket.once('close', () => {
        this.emit('disconnect', {
          connection,
          id: connection.id,
          newConnectionCount: Object.keys(this.connections).length,
        });
      });

      this.emit('connect', {
        connection,
        id: connection.id,
        newConnectionCount: Object.keys(this.connections).length,
      });

      const greeting = this._greeting || [];
      const features = this._features || 'Ready';
      return connection
        .reply(220, ...greeting, features)
        .then(() => socket.resume());
    };
    const serverOptions = Object.assign(
      {},
      this.isTLS ? this.options.tls : {},
      { pauseOnConnect: true }
    );

    this.server = (this.isTLS ? tls : net).createServer(
      serverOptions,
      serverConnectionHandler
    );
    this.server.on('error', (err: Error) => {
      this.log.error(err, '[Event] error');
      this.emit('server-error', { error: err });
    });

    const quit = _.debounce(this.quit.bind(this), 100);

    if (this.options.endOnProcessSignal) {
      process.on('SIGTERM', quit);
      process.on('SIGINT', quit);
      process.on('SIGQUIT', quit);
    }
  }

  get isTLS(): boolean {
    return this.url.protocol === 'ftps:' && !!this.options.tls;
  }

  listen(): Promise<string> {
    if (!this.options.pasv_url) {
      this.log.warn(
        'Passive URL not set. Passive connections not available.'
      );
    }

    return new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.url.port, this.url.hostname, (err?: Error) => {
        this.server.removeListener('error', reject);
        if (err) return reject(err);
        this.log.info(
          {
            protocol: (this.url.protocol || '').replace(/\W/g, ''),
            ip: this.url.hostname,
            port: this.url.port,
          },
          'Listening'
        );
        resolve('Listening');
      });
    });
  }

  emitPromise(action: string, ...data: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = _.concat(data, [resolve, reject]);
      this.emit.apply(this, [action, ...params]);
    });
  }

  setupGreeting(greet: string | string[] | null | undefined): string[] {
    if (!greet) return [];
    return Array.isArray(greet) ? greet : greet.split('\n');
  }

  setupFeaturesMessage(): string {
    const features: string[] = [];
    if (this.options.anonymous) features.push('a');

    if (features.length) {
      features.unshift('Features:');
      features.push('.');
    }
    return features.length ? features.join(' ') : 'Ready';
  }

  disconnectClient(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = this.connections[id];
      if (!client) return resolve('Disconnected');
      delete this.connections[id];

      setTimeout(() => {
        reject(new Error('Timed out disconnecting the client'));
      }, this.options.timeout || 1000);

      try {
        client.close(0);
      } catch (err) {
        this.log.error(err, 'Error closing connection', { id });
      }

      resolve('Disconnected');
    });
  }

  quit(): Promise<void> {
    return this.close().then(() => process.exit(0));
  }

  close(): Promise<void> {
    this.server.maxConnections = 0;
    this.emit('closing');
    this.log.info('Closing connections:', Object.keys(this.connections).length);

    return Promise.all(
      Object.keys(this.connections).map((id) => this.disconnectClient(id))
    )
      .then(
        () =>
          new Promise<void>((resolve) => {
            this.server.close((err?: Error) => {
              this.log.info('Server closing...');
              if (err) this.log.error(err, 'Error closing server');
              resolve();
            });
          })
      )
      .then(() => {
        this.log.debug('Removing event listeners...');
        this.emit('closed', {});
        this.removeAllListeners();
      });
  }
}

export { default as FileSystem } from './fs';
export * from './errors';
