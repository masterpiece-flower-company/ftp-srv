import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import allo from "../../../src/commands/registration/allo";

const CMD = "ALLO";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return allo.handler.call(mockClient, {}).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(202);
    });
  });
});
