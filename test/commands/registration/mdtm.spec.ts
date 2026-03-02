import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import mdtm from "../../../src/commands/registration/mdtm";

const CMD = "MDTM";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { get: () => {} },
  };
  let replySpy: ReturnType<typeof spyOn>;
  let getSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    getSpy = spyOn(mockClient.fs, "get").mockResolvedValue({ mtime: new Date() });
  });
  afterEach(() => {
    replySpy.mockRestore();
    getSpy.mockRestore();
  });

  test("// successful", () => {
    return mdtm.handler.call(mockClient, { log, command: { arg: "file", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(213);
    });
  });
});
