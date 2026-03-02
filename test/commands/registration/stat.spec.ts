import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import stat from "../../../src/commands/registration/stat";

const CMD = "STAT";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { get: () => Promise.resolve({ isDirectory: () => false }), list: () => {} },
    server: { options: { file_format: "ls" } },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.fs, "get").mockResolvedValue({ isDirectory: () => false });
  });
  afterEach(() => replySpy.mockRestore());

  test("no path // successful", () => {
    return stat.handler.call(mockClient, { log, command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(211);
    });
  });
});
