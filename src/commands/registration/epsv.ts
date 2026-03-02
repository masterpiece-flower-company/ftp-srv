import PassiveConnector from '../../connector/passive';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'EPSV',
  handler: function (this: any, { log }: any = {}) {
    this.connector = new PassiveConnector(this);
    return this.connector
      .setupServer()
      .then((server: any) => {
        const { port } = server.address();
        return this.reply(229, `EPSV OK (|||${port}|)`);
      })
      .catch((err: any) => {
        log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}} [<protocol>]',
  description: 'Initiate passive mode',
} as CommandDescriptor;
