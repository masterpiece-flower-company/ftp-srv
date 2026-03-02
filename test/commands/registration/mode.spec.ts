import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import mode from "../../../src/commands/registration/mode";

const CMD = "MODE";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("S // successful", () => {
    return mode.handler.call(mockClient, { command: { arg: "S", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });

  test("B // unsuccessful", () => {
    return mode.handler.call(mockClient, { command: { arg: "B", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(504);
    });
  });
});
