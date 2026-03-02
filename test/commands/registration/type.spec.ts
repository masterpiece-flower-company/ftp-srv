import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import typeCmd from "../../../src/commands/registration/type";

const CMD = "TYPE";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve(), transferType: "binary" };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("I // successful", () => {
    return typeCmd.handler.call(mockClient, { command: { arg: "I", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });

  test("A // successful", () => {
    return typeCmd.handler.call(mockClient, { command: { arg: "A", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });

  test("bad // unsuccessful", () => {
    return typeCmd.handler.call(mockClient, { command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(501);
    });
  });
});
