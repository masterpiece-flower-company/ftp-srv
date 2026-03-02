import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import cwd from "../../../src/commands/registration/cwd";

const CMD = "CWD";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { chdir: () => {} },
  };
  const cmdFn = cwd.handler.bind(mockClient);
  let replySpy: ReturnType<typeof spyOn>;
  let chdirSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    chdirSpy = spyOn(mockClient.fs, "chdir").mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
    chdirSpy.mockRestore();
  });

  describe("// check", () => {
    test("fails on no fs", () => {
      const badMockClient = { reply: () => {} };
      const badReplySpy = spyOn(badMockClient, "reply").mockResolvedValue(undefined as any);
      return cwd.handler.bind(badMockClient)({ log, command: { arg: "test", directive: CMD } }).then(() => {
        expect(badReplySpy.mock.calls[0][0]).toBe(550);
        badReplySpy.mockRestore();
      });
    });

    test("fails on no fs chdir command", () => {
      const badMockClient = { reply: () => {}, fs: {} };
      const badReplySpy = spyOn(badMockClient, "reply").mockResolvedValue(undefined as any);
      return cwd.handler.bind(badMockClient)({ log, command: { arg: "test", directive: CMD } }).then(() => {
        expect(badReplySpy.mock.calls[0][0]).toBe(402);
        badReplySpy.mockRestore();
      });
    });
  });

  test("test // successful", () => {
    return cmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(250);
      expect(chdirSpy.mock.calls[0][0]).toBe("test");
    });
  });

  test("test // successful with path", () => {
    chdirSpy.mockRestore();
    const chdirSpy2 = spyOn(mockClient.fs, "chdir").mockResolvedValue("/test");
    return cmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(250);
      expect(chdirSpy2.mock.calls[0][0]).toBe("test");
    });
  });

  test("bad // unsuccessful", () => {
    chdirSpy.mockRestore();
    const badChdirSpy = spyOn(mockClient.fs, "chdir").mockRejectedValue(new Error("Bad"));
    return cmdFn({ log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(550);
      expect(badChdirSpy.mock.calls[0][0]).toBe("bad");
    });
  });
});
