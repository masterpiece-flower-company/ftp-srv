import _ from 'lodash';
import tls from 'tls';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'AUTH',
  handler: function (this: any) {
    if (this.secure) return this.reply(234, 'Already in secure mode');
    if (!_.get(this.server, 'options.tls')) return this.reply(502);

    this.reply(234, 'TLS supported');
    const secureContext = tls.createSecureContext(this.server.options.tls);
    const secureSocket = new tls.TLSSocket(this.commandSocket, {
      isServer: true,
      secureContext,
    });
    this.commandSocket = secureSocket;
    this._secure = true;
  },
  syntax: '{{cmd}} <type>',
  description: 'Authentication mechanism',
  flags: { no_auth: true },
} as CommandDescriptor;
