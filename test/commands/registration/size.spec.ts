import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import size from "../../../src/commands/registration/size";

const CMD = "SIZE";
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
    getSpy = spyOn(mockClient.fs, "get").mockResolvedValue({ size: 123 });
  });
  afterEach(() => {
    replySpy.mockRestore();
    getSpy.mockRestore();
  });

  test("// successful", () => {
    return size.handler.call(mockClient, { log, command: { arg: "file", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(213);
    });
  });

  test("// unsuccessful", () => {
    getSpy.mockRestore();
    spyOn(mockClient.fs, "get").mockRejectedValue(new Error("Not found"));
    return size.handler.call(mockClient, { log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(550);
    });
  });
});
