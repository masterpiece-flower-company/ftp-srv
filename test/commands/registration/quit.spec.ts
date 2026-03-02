import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import quit from "../../../src/commands/registration/quit";

const CMD = "QUIT";

describe(CMD, () => {
  const mockClient = { close: () => {} };
  let closeSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    closeSpy = spyOn(mockClient, "close").mockResolvedValue(undefined as any);
  });
  afterEach(() => closeSpy.mockRestore());

  test("// successful", () => {
    return quit.handler.call(mockClient, {}).then(() => {
      expect(closeSpy.mock.calls.length).toBe(1);
    });
  });
});
