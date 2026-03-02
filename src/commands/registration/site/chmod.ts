

export default function (this: any, { log, command }: any = {}) {
  if (!this.fs) return this.reply(550, 'File system not instantiated');
  if (!this.fs.chmod) return this.reply(402, 'Not supported by file system');

  const [mode, ...fileNameParts] = command.arg.split(' ');
  const fileName = fileNameParts.join(' ');
  return Promise.try(() =>
    this.fs.chmod(fileName, parseInt(mode, 8))
  )
    .then(() => this.reply(200))
    .catch((err: Error) => {
      log.error(err);
      return this.reply(500);
    });
}
