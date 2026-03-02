/**
 * Minimal console-based logger with a bunyan-like API (child, trace, debug, info, warn, error).
 * Use this instead of bunyan so the server has no bunyan dependency.
 */

export interface Logger {
  child(fields: Record<string, unknown>): Logger;
  trace(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

function createConsoleLogger(
  name: string | undefined,
  childFields: Record<string, unknown> = {}
): Logger {
  const prefix = name ? `[${name}]` : '';
  const fieldsStr =
    Object.keys(childFields).length > 0
      ? ' ' + JSON.stringify(childFields)
      : '';
  const prefixStr = prefix + fieldsStr;

  const log = (consoleMethod: (...a: unknown[]) => void, ...args: unknown[]) => {
    consoleMethod(prefixStr, ...args);
  };

  return {
    child(fields: Record<string, unknown>) {
      return createConsoleLogger(name, { ...childFields, ...fields });
    },
    trace(...args: unknown[]) {
      log(console.log, ...args);
    },
    debug(...args: unknown[]) {
      log(console.debug, ...args);
    },
    info(...args: unknown[]) {
      log(console.info, ...args);
    },
    warn(...args: unknown[]) {
      log(console.warn, ...args);
    },
    error(...args: unknown[]) {
      log(console.error, ...args);
    },
  };
}

export interface CreateLoggerOptions {
  name?: string;
  level?: string;
}

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const name = options.name || 'ftp-srv';
  return createConsoleLogger(name);
}
