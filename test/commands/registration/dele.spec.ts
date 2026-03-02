import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import dele from "../../../src/commands/registration/dele";

const CMD = "DELE";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { delete: () => {} },
  };
  const cmdFn = dele.handler.bind(mockClient);
  let replySpy: ReturnType<typeof spyOn>;
  let deleteSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    deleteSpy = spyOn(mockClient.fs, "delete").mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
    deleteSpy.mockRestore();
  });

  describe("// check", () => {
    test("fails on no fs", () => {
      const badMockClient = { reply: () => {} };
      const badReplySpy = spyOn(badMockClient, "reply").mockResolvedValue(undefined as any);
      const badCmdFn = dele.handler.bind(badMockClient);
      return badCmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
        expect(badReplySpy.mock.calls[0][0]).toBe(550);
        badReplySpy.mockRestore();
      });
    });

    test("fails on no fs delete command", () => {
      const badMockClient = { reply: () => {}, fs: {} };
      const badReplySpy = spyOn(badMockClient, "reply").mockResolvedValue(undefined as any);
      const badCmdFn = dele.handler.bind(badMockClient);
      return badCmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
        expect(badReplySpy.mock.calls[0][0]).toBe(402);
        badReplySpy.mockRestore();
      });
    });
  });

  test("test // successful", () => {
    return cmdFn({ log, command: { arg: "test", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(250);
      expect(deleteSpy.mock.calls[0][0]).toBe("test");
    });
  });

  test("bad // unsuccessful", () => {
    deleteSpy.mockRestore();
    const badDeleteSpy = spyOn(mockClient.fs, "delete").mockRejectedValue(new Error("Bad"));
    return cmdFn({ log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(550);
      expect(badDeleteSpy.mock.calls[0][0]).toBe("bad");
    });
  });
});
