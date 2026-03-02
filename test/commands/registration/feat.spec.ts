import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import feat from "../../../src/commands/registration/feat";

const CMD = "FEAT";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return feat.handler.call(mockClient, { command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(211);
      expect(replySpy.mock.calls[0].length).toBeGreaterThan(1);
    });
  });
});
