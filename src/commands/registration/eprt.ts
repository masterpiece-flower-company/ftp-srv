import _ from 'lodash';
import ActiveConnector from '../../connector/active';
import type { CommandDescriptor } from '../registry';

const FAMILY: Record<string, number> = {
  1: 4,
  2: 6,
};

export default {
  directive: 'EPRT',
  handler: function (this: any, { log, command }: any = {}) {
    const parts = _.chain(command).get('arg', '').split('|').value();
    const protocol = parts[1];
    const ip = parts[2];
    const port = parseInt(parts[3], 10);
    const family = FAMILY[protocol];
    if (!family) return this.reply(504, 'Unknown network protocol');

    this.connector = new ActiveConnector(this);
    return this.connector
      .setupConnection(ip, port, family)
      .then(() => this.reply(200))
      .catch((err: any) => {
        log.error(err);
        return this.reply(err.code || 425, err.message);
      });
  },
  syntax: '{{cmd}} |<protocol>|<address>|<port>|',
  description:
    'Specifies an address and port to which the server should connect',
} as CommandDescriptor;
