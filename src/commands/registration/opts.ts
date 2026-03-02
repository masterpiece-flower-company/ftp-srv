import _ from 'lodash';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'OPTS',
  handler: function (this: any, { command }: any = {}) {
    const [arg, value] = _.split(command.arg, ' ');
    if (arg === 'UTF8' && (value === 'ON' || !value))
      return this.reply(200, 'UTF8 mode enabled');
    return this.reply(502, `Option ${command.arg} not supported`);
  },
  syntax: '{{cmd}} <option> [value]',
  description: 'Select options for a feature',
  flags: { no_auth: true, feat: 'OPTS' },
} as CommandDescriptor;
