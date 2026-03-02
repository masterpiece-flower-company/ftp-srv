import _ from 'lodash';
import ActiveConnector from '../../connector/active';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'PORT',
  handler: function (this: any, { log, command }: any = {}) {
    this.connector = new ActiveConnector(this);

    const rawConnection = _.get(command, 'arg', '').split(',');
    if (rawConnection.length !== 6) return this.reply(425);

    const ip = rawConnection
      .slice(0, 4)
      .map((b: string) => parseInt(b, 10))
      .join('.');
    const portBytes = rawConnection
      .slice(4)
      .map((p: string) => parseInt(p, 10));
    const port = portBytes[0] * 256 + portBytes[1];

    return this.connector
      .setupConnection(ip, port)
      .then(() => this.reply(200))
      .catch((err: any) => {
        log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}} <x>,<x>,<x>,<x>,<y>,<y>',
  description:
    'Specifies an address and port to which the server should connect',
} as CommandDescriptor;
