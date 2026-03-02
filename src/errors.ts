export class GeneralError extends Error {
  code: number;
  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'GeneralError';
  }
}

export class SocketError extends Error {
  code: number;
  constructor(message: string, code = 500) {
    super(message);
    this.code = code;
    this.name = 'SocketError';
  }
}

export class FileSystemError extends Error {
  code: number;
  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'FileSystemError';
  }
}

export class ConnectorError extends Error {
  code: number;
  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'ConnectorError';
  }
}
