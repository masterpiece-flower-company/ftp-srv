import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import help from "../../../src/commands/registration/help";

const CMD = "HELP";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return help.handler.call(mockClient, { command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(211);
    });
  });

  test("help // successful", () => {
    return help.handler.call(mockClient, { command: { arg: "help", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(214);
    });
  });

  test("allo // successful", () => {
    return help.handler.call(mockClient, { command: { arg: "allo", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(214);
    });
  });

  test("bad // unsuccessful", () => {
    return help.handler.call(mockClient, { command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(502);
    });
  });
});
