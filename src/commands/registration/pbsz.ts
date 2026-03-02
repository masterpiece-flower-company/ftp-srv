import type { CommandDescriptor } from '../registry';

export default {
  directive: 'PBSZ',
  handler: function (this: any, { command }: any = {}) {
    if (!this.secure) return this.reply(202, 'Not supported');
    this.bufferSize = parseInt(command.arg, 10) as any;
    return this.reply(
      200,
      this.bufferSize === 0 ? 'OK' : 'Buffer too large: PBSZ=0'
    );
  },
  syntax: '{{cmd}}',
  description: 'Protection Buffer Size',
  flags: { no_auth: true, feat: 'PBSZ' },
} as CommandDescriptor;
