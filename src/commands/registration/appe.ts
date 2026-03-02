import stor from './stor';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'APPE',
  handler: stor.handler,
  syntax: '{{cmd}} <path>',
  description: 'Append to file',
} as CommandDescriptor;
