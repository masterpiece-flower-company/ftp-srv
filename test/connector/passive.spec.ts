import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../src/logger";
import PassiveConnector from "../../src/connector/passive";
import { getNextPortFactory } from "../../src/helpers/find-port";

describe("Connector - Passive", () => {
  const host = "127.0.0.1";
  const mockConnection = {
    reply: () => Promise.resolve(),
    close: () => Promise.resolve(),
    encoding: "utf8",
    log: createLogger({ name: "passive-test" }),
    commandSocket: { remoteAddress: "::ffff:127.0.0.1" },
    server: {
      url: { hostname: host },
      getNextPasvPort: getNextPortFactory(host, 1024),
    },
  };

  test("setupServer returns a server", () => {
    const passive = new PassiveConnector(mockConnection as any);
    return passive.setupServer().then((server) => {
      expect(server).toBeDefined();
      expect(server.listen).toBeDefined();
      passive.closeServer();
    });
  });
});
