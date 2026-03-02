import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import pwd from "../../../src/commands/registration/pwd";

const CMD = "PWD";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { currentDirectory: () => {} },
  };
  const cmdFn = pwd.handler.bind(mockClient);
  let replySpy: ReturnType<typeof spyOn>;
  let currentDirectorySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    currentDirectorySpy = spyOn(mockClient.fs, "currentDirectory").mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
    currentDirectorySpy.mockRestore();
  });

  describe("// check", () => {
    test("fails on no fs", () => {
      const badMockClient = { reply: () => {} };
      const badReplySpy = spyOn(badMockClient, "reply").mockResolvedValue(undefined as any);
      const badCmdFn = pwd.handler.bind(badMockClient);
      return badCmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
        expect(badReplySpy.mock.calls[0][0]).toBe(550);
        badReplySpy.mockRestore();
      });
    });

    test("fails on no fs currentDirectory command", () => {
      const badMockClient = { reply: () => {}, fs: {} };
      const badReplySpy = spyOn(badMockClient, "reply").mockResolvedValue(undefined as any);
      const badCmdFn = pwd.handler.bind(badMockClient);
      return badCmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
        expect(badReplySpy.mock.calls[0][0]).toBe(402);
        badReplySpy.mockRestore();
      });
    });
  });

  test("// successful", () => {
    return cmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(257);
    });
  });

  test("// successful with path", () => {
    currentDirectorySpy.mockRestore();
    spyOn(mockClient.fs, "currentDirectory").mockResolvedValue("/test");
    return cmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(257);
    });
  });

  test("// unsuccessful", () => {
    currentDirectorySpy.mockRestore();
    spyOn(mockClient.fs, "currentDirectory").mockRejectedValue(new Error("Bad"));
    return cmdFn({ log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(550);
    });
  });
});
