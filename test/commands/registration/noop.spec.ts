import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import noop from "../../../src/commands/registration/noop";

const CMD = "NOOP";
const cmdFn = noop.handler.bind(null);

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve() };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
  });

  test("// successful", () => {
    return noop.handler.call(mockClient, {}).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });
});
