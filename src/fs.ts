import _ from 'lodash';
import nodePath from 'path';
import uuid from 'uuid';
import Promise from 'bluebird';
import {
  createReadStream,
  createWriteStream,
  constants,
} from 'fs';
import fsAsync from './helpers/fs-async';
import * as errors from './errors';

const UNIX_SEP_REGEX = /\//g;
const WIN_SEP_REGEX = /\\/g;

export default class FileSystem {
  connection: any;
  cwd: string;
  _root: string;

  constructor(
    connection: any,
    { root, cwd }: { root?: string; cwd?: string } = {}
  ) {
    this.connection = connection;
    this.cwd = nodePath.normalize((cwd || '/').replace(WIN_SEP_REGEX, '/'));
    this._root = nodePath.resolve(root || process.cwd());
  }

  get root(): string {
    return this._root;
  }

  _resolvePath(path = '.'): { clientPath: string; fsPath: string } {
    const resolvedPath = path.replace(WIN_SEP_REGEX, '/');

    const joinedPath = nodePath.isAbsolute(resolvedPath)
      ? nodePath.normalize(resolvedPath)
      : nodePath.join('/', this.cwd, resolvedPath);

    const fsPath = nodePath.resolve(
      nodePath
        .join(this.root, joinedPath)
        .replace(UNIX_SEP_REGEX, nodePath.sep)
        .replace(WIN_SEP_REGEX, nodePath.sep)
    );

    const clientPath = joinedPath.replace(WIN_SEP_REGEX, '/');

    return { clientPath, fsPath };
  }

  currentDirectory(): string {
    return this.cwd;
  }

  get(fileName: string): Promise<any> {
    const { fsPath } = this._resolvePath(fileName);
    return fsAsync
      .stat(fsPath)
      .then((stat: any) => _.set(stat, 'name', fileName));
  }

  list(path = '.'): Promise<any[]> {
    const { fsPath } = this._resolvePath(path);
    return fsAsync.readdir(fsPath).then((fileNames: string[]) => {
      return Promise.map(fileNames, (fileName: string) => {
        const filePath = nodePath.join(fsPath, fileName);
        return fsAsync
          .access(filePath, constants.F_OK)
          .then(() => {
            return fsAsync
              .stat(filePath)
              .then((stat: any) => _.set(stat, 'name', fileName));
          })
          .catch(() => null);
      });
    }).then(_.compact);
  }

  chdir(path = '.'): Promise<string> {
    const { fsPath, clientPath } = this._resolvePath(path);
    return fsAsync
      .stat(fsPath)
      .tap((stat: any) => {
        if (!stat.isDirectory())
          throw new errors.FileSystemError('Not a valid directory');
      })
      .then(() => {
        this.cwd = clientPath;
        return this.currentDirectory();
      });
  }

  write(
    fileName: string,
    { append = false, start }: { append?: boolean; start?: number } = {}
  ): { stream: NodeJS.WritableStream; clientPath: string } {
    const { fsPath, clientPath } = this._resolvePath(fileName);
    const stream = createWriteStream(fsPath, {
      flags: !append ? 'w+' : 'a+',
      start,
    });
    stream.once('error', () => fsAsync.unlink(fsPath));
    stream.once('close', () => stream.end());
    return { stream, clientPath };
  }

  read(
    fileName: string,
    { start }: { start?: number } = {}
  ): Promise<{ stream: NodeJS.ReadableStream; clientPath: string }> {
    const { fsPath, clientPath } = this._resolvePath(fileName);
    return fsAsync
      .stat(fsPath)
      .tap((stat: any) => {
        if (stat.isDirectory())
          throw new errors.FileSystemError('Cannot read a directory');
      })
      .then(() => {
        const stream = createReadStream(fsPath, { flags: 'r', start });
        return { stream, clientPath };
      });
  }

  delete(path: string): Promise<void> {
    const { fsPath } = this._resolvePath(path);
    return fsAsync.stat(fsPath).then((stat: any) => {
      if (stat.isDirectory()) return fsAsync.rmdir(fsPath);
      else return fsAsync.unlink(fsPath);
    });
  }

  mkdir(path: string): Promise<string> {
    const { fsPath } = this._resolvePath(path);
    return fsAsync.mkdir(fsPath, { recursive: true }).then(() => fsPath);
  }

  rename(from: string, to: string): Promise<void> {
    const { fsPath: fromPath } = this._resolvePath(from);
    const { fsPath: toPath } = this._resolvePath(to);
    return fsAsync.rename(fromPath, toPath);
  }

  chmod(path: string, mode: string | number): Promise<void> {
    const { fsPath } = this._resolvePath(path);
    return fsAsync.chmod(fsPath, mode);
  }

  getUniqueName(): string {
    return uuid.v4().replace(/\W/g, '');
  }
}
