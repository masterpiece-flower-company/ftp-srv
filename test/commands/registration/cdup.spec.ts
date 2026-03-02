import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import cdup from "../../../src/commands/registration/cdup";

const CMD = "CDUP";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => Promise.resolve(),
    fs: { chdir: () => Promise.resolve() },
  };
  const cmdFn = cdup.handler.bind(mockClient);
  let replySpy: ReturnType<typeof spyOn>;
  let chdirSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    chdirSpy = spyOn(mockClient.fs, "chdir").mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
    chdirSpy.mockRestore();
  });

  test(".. // successful", () => {
    return cmdFn({ log, command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(250);
      expect(chdirSpy.mock.calls[0][0]).toBe("..");
    });
  });
});
