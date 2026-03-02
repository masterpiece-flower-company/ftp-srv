import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import mkd from "../../../src/commands/registration/mkd";

const CMD = "MKD";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { mkdir: () => {} },
  };
  let replySpy: ReturnType<typeof spyOn>;
  let mkdirSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    mkdirSpy = spyOn(mockClient.fs, "mkdir").mockResolvedValue("/test");
  });
  afterEach(() => {
    replySpy.mockRestore();
    mkdirSpy.mockRestore();
  });

  test("// successful", () => {
    return mkd.handler.call(mockClient, { log, command: { arg: "dir", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(257);
    });
  });
});
