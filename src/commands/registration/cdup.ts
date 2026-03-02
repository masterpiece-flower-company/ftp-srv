import cwd from './cwd';
import type { CommandDescriptor } from '../registry';

export default {
  directive: ['CDUP', 'XCUP'],
  handler: function (this: any, args: any) {
    args.command.arg = '..';
    return cwd.handler.call(this, args);
  },
  syntax: '{{cmd}}',
  description: 'Change to Parent Directory',
} as CommandDescriptor;
