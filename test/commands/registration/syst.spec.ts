import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import syst from "../../../src/commands/registration/syst";

const CMD = "SYST";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return syst.handler.call(mockClient, {}).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(215);
    });
  });
});
