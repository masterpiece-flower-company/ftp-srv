import fs from 'fs';

export const stat = fs.promises.stat;
export const readdir = fs.promises.readdir;
export const access = fs.promises.access;
export const unlink = fs.promises.unlink;
export const rmdir = fs.promises.rmdir;
export const mkdir = fs.promises.mkdir;
export const rename = fs.promises.rename;
export const chmod = fs.promises.chmod;
