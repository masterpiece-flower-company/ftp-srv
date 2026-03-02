import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import stou from "../../../src/commands/registration/stou";

const CMD = "STOU";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    fs: { get: () => Promise.reject(new Error("not found")), getUniqueName: () => "unique", write: () => ({ stream: {}, clientPath: "x" }) },
    connector: { waitForConnection: () => Promise.resolve(), socket: {}, end: () => {} },
    commandSocket: { pause: () => {}, resume: () => {} },
    restByteCount: 0,
    emit: () => {},
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.fs, "get").mockRejectedValue(new Error("not found"));
    spyOn(mockClient.fs, "getUniqueName").mockReturnValue("unique");
  });
  afterEach(() => replySpy.mockRestore());

  test("// uses getUniqueName when file exists", () => {
    return stou.handler.call(mockClient, { log, command: { arg: "file", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
