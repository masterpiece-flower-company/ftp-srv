import dele from './dele';
import type { CommandDescriptor } from '../registry';

export default {
  directive: ['RMD', 'XRMD'],
  handler: function (this: any, args: any) {
    return dele.handler.call(this, args);
  },
  syntax: '{{cmd}} <path>',
  description: 'Remove a directory',
} as CommandDescriptor;
