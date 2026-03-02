import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import rnfr from "../../../src/commands/registration/rnfr";

const CMD = "RNFR";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { get: () => {} },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.fs, "get").mockResolvedValue({});
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return rnfr.handler.call(mockClient, { log, command: { arg: "file", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(350);
    });
  });
});
