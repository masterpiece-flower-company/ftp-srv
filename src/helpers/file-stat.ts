import _ from 'lodash';
import moment from 'moment';
import * as errors from '../errors';

export type FileStatLike = {
  mode?: number;
  mtime?: Date | string | number;
  uid?: number;
  gid?: number;
  size?: number;
  name: string;
  dev?: number;
  ino?: number;
  isDirectory(): boolean;
};

function ls(fileStat: FileStatLike): string {
  const now = moment.utc();
  const mtime = moment.utc(new Date(fileStat.mtime as any));
  const timeDiff = now.diff(mtime, 'months');
  const dateFormat = timeDiff < 6 ? 'MMM DD HH:mm' : 'MMM DD  YYYY';

  return [
    fileStat.mode
      ? [
          fileStat.isDirectory() ? 'd' : '-',
          fileStat.mode & 256 ? 'r' : '-',
          fileStat.mode & 128 ? 'w' : '-',
          fileStat.mode & 64 ? 'x' : '-',
          fileStat.mode & 32 ? 'r' : '-',
          fileStat.mode & 16 ? 'w' : '-',
          fileStat.mode & 8 ? 'x' : '-',
          fileStat.mode & 4 ? 'r' : '-',
          fileStat.mode & 2 ? 'w' : '-',
          fileStat.mode & 1 ? 'x' : '-',
        ].join('')
      : fileStat.isDirectory()
      ? 'drwxr-xr-x'
      : '-rwxr-xr-x',
    '1',
    fileStat.uid || 1,
    fileStat.gid || 1,
    _.padStart(String(fileStat.size ?? 0), 12),
    _.padStart(mtime.format(dateFormat), 12),
    fileStat.name,
  ].join(' ');
}

function ep(fileStat: FileStatLike): string {
  const facts = _.compact([
    fileStat.dev && fileStat.ino
      ? `i${fileStat.dev.toString(16)}.${fileStat.ino.toString(16)}`
      : null,
    fileStat.size ? `s${fileStat.size}` : null,
    fileStat.mtime
      ? `m${moment.utc(new Date(fileStat.mtime as any)).format('X')}`
      : null,
    fileStat.mode ? `up${(fileStat.mode & 4095).toString(8)}` : null,
    fileStat.isDirectory() ? '/' : 'r',
  ]).join(',');
  return `+${facts}\t${fileStat.name}`;
}

const FORMATS: Record<string, (fileStat: FileStatLike) => string> = {
  ls,
  ep,
};

export type FileStatFormat = 'ls' | 'ep' | ((fileStat: FileStatLike) => string);

export default function getFileStat(
  fileStat: FileStatLike,
  format: FileStatFormat = 'ls'
): string {
  if (typeof format === 'function') return format(fileStat);
  if (!FORMATS.hasOwnProperty(format as string)) {
    throw new errors.FileSystemError('Bad file stat formatter');
  }
  return FORMATS[format as string](fileStat);
}
