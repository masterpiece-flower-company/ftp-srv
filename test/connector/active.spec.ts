import { describe, test, expect } from "bun:test";
import { createLogger } from "../../src/logger";
import ActiveConnector from "../../src/connector/active";

describe("Connector - Active", () => {
  const mockConnection = {
    reply: () => Promise.resolve(),
    close: () => Promise.resolve(),
    log: createLogger({ name: "active-test" }),
    commandSocket: { remoteAddress: "127.0.0.1" },
    secure: false,
    server: { options: { tls: {} } },
  };

  test("setupConnection rejects for wrong address", () => {
    const active = new ActiveConnector(mockConnection as any);
    return active.setupConnection("192.168.1.1", 21).catch((err: Error) => {
      expect(err.message).toMatch(/not yours/);
    });
  });
});
