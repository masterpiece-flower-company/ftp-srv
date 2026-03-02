import { describe, test, expect } from "bun:test";
import { getNextPortFactory } from "../../src/helpers/find-port";

describe("helpers // find-port", () => {
  test("getNextPortFactory returns a function", () => {
    const getPort = getNextPortFactory("127.0.0.1", 20000, 20010);
    expect(typeof getPort).toBe("function");
  });

  test("getNextPort resolves to a port", () => {
    const getPort = getNextPortFactory("127.0.0.1", 20100, 20110);
    return getPort().then((port) => {
      expect(port).toBeGreaterThanOrEqual(20100);
      expect(port).toBeLessThanOrEqual(20110);
    });
  });
});
