import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import stru from "../../../src/commands/registration/stru";

const CMD = "STRU";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("F // successful", () => {
    return stru.handler.call(mockClient, { command: { arg: "F", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });

  test("R // unsuccessful", () => {
    return stru.handler.call(mockClient, { command: { arg: "R", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(504);
    });
  });
});
