import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../../src/logger";
import site from "../../../../src/commands/registration/site";

const CMD = "SITE";
const log = createLogger({ name: "site-test" });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    commands: { parse: (s: string) => ({ directive: s.toUpperCase(), arg: s }) },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("CHMOD // delegates", () => {
    return site.handler.call(mockClient, { log, command: { arg: "CHMOD 755 file", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  test("BAD // unsuccessful", () => {
    return site.handler.call(mockClient, { log, command: { arg: "BAD", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(502);
    });
  });
});
