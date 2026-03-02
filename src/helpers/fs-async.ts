import fs from 'fs';


const methods = [
  'stat',
  'readdir',
  'access',
  'unlink',
  'rmdir',
  'mkdir',
  'rename',
  'chmod',
] as const;

type FsAsync = {
  [K in (typeof methods)[number]]: typeof fs[K] extends (...args: infer A) => any
    ? (...args: A) => Promise<any>
    : never;
};

const fsAsync = methods.reduce((obj, method) => {
  (obj as any)[method] = Promise.promisify(fs[method]);
  return obj;
}, {} as FsAsync);

export default fsAsync;
