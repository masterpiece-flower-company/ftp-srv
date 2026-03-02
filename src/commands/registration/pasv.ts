
import PassiveConnector from '../../connector/passive';
import { isLocalIP } from '../../helpers/is-local';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'PASV',
  handler: function (this: any, { log }: any = {}) {
    if (!this.server.options.pasv_url) {
      return this.reply(502);
    }

    this.connector = new PassiveConnector(this);
    return this.connector
      .setupServer()
      .then((server: any) => {
        const { port } = server.address();
        let pasvAddress = this.server.options.pasv_url;
        if (typeof pasvAddress === 'function') {
          return Promise.try(() => pasvAddress(this.ip)).then((address: string) => ({
            address,
            port,
          }));
        }
        if (isLocalIP(this.ip || '')) pasvAddress = this.ip;
        return { address: pasvAddress, port };
      })
      .then(({ address, port }: { address: string; port: number }) => {
        const host = address.replace(/\./g, ',');
        const portByte1 = (port / 256) | 0;
        const portByte2 = port % 256;
        return this.reply(227, `PASV OK (${host},${portByte1},${portByte2})`);
      })
      .catch((err: any) => {
        log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}}',
  description: 'Initiate passive mode',
} as CommandDescriptor;
