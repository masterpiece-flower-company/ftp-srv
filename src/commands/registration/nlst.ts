import list from './list';
import type { CommandDescriptor } from '../registry';

export default {
  directive: 'NLST',
  handler: list.handler,
  syntax: '{{cmd}} [<path>]',
  description: 'Returns a list of file names in a specified directory',
} as CommandDescriptor;
