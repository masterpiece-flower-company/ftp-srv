/**
 * Minimal console-based logger with a bunyan-like API (child, trace, debug, info, warn, error).
 * Use this instead of bunyan so the server has no bunyan dependency.
 */

function createConsoleLogger(name, childFields = {}) {
  const prefix = name ? `[${name}]` : '';
  const fieldsStr = Object.keys(childFields).length
    ? ' ' + JSON.stringify(childFields)
    : '';
  const prefixStr = prefix + fieldsStr;

  const log = (consoleMethod, ...args) => {
    consoleMethod(prefixStr, ...args);
  };

  return {
    child(fields) {
      return createConsoleLogger(name, { ...childFields, ...fields });
    },
    trace(...args) {
      log(console.log, ...args);
    },
    debug(...args) {
      log(console.debug, ...args);
    },
    info(...args) {
      log(console.info, ...args);
    },
    warn(...args) {
      log(console.warn, ...args);
    },
    error(...args) {
      log(console.error, ...args);
    },
  };
}

function createLogger(options = {}) {
  const name = options.name || 'ftp-srv';
  return createConsoleLogger(name);
}

module.exports = { createLogger };
