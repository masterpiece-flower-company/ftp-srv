import net from 'net';
import * as errors from '../errors';

const MAX_PORT = 65535;
const MAX_PORT_CHECK_ATTEMPT = 5;

function* portNumberGenerator(
  min: number,
  max: number = MAX_PORT
): Generator<number> {
  let current = min;
  while (true) {
    if (current > MAX_PORT || current > max) {
      current = min;
    }
    yield current++;
  }
}

export function getNextPortFactory(
  host: string,
  portMin: number,
  portMax?: number,
  maxAttempts: number = MAX_PORT_CHECK_ATTEMPT
): () => Promise<number> {
  const nextPortNumber = portNumberGenerator(portMin, portMax ?? MAX_PORT);

  return () =>
    new Promise((resolve, reject) => {
      const portCheckServer = net.createServer();
      portCheckServer.maxConnections = 0;

      let attemptCount = 0;
      const tryGetPort = () => {
        attemptCount++;
        if (attemptCount > maxAttempts) {
          reject(new errors.ConnectorError('Unable to find valid port'));
          return;
        }

        const { value: port } = nextPortNumber.next();

        portCheckServer.removeAllListeners();
        portCheckServer.once('error', (err: NodeJS.ErrnoException) => {
          if (err.code && ['EADDRINUSE'].includes(err.code)) {
            tryGetPort();
          } else {
            reject(err);
          }
        });
        portCheckServer.once('listening', () => {
          portCheckServer.removeAllListeners();
          portCheckServer.close(() => resolve(port));
        });

        try {
          portCheckServer.listen(port, host);
        } catch (err) {
          reject(err);
        }
      };

      tryGetPort();
    });
}

export { portNumberGenerator };
