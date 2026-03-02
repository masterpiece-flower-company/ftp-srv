import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import retr from "../../../src/commands/registration/retr";

const CMD = "RETR";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    restByteCount: 0,
    connector: { waitForConnection: () => Promise.resolve(), socket: { write: () => {}, once: () => {} }, end: () => {} },
    commandSocket: { pause: () => {}, resume: () => {} },
    fs: { read: () => Promise.resolve({ stream: { on: () => {}, once: () => {}, pause: () => {}, resume: () => {}, destroy: () => {} }, clientPath: "x" }) },
    emit: () => {},
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.connector, "waitForConnection").mockResolvedValue({});
    spyOn(mockClient.fs, "read").mockResolvedValue({
      stream: { on: () => {}, once: () => {}, pause: () => {}, resume: () => {}, destroy: () => {} },
      clientPath: "x",
    });
  });
  afterEach(() => replySpy.mockRestore());

  test("// no fs returns 550", () => {
    const noFsClient = { reply: () => {}, connector: {}, commandSocket: {}, emit: () => {} };
    const spy = spyOn(noFsClient, "reply").mockResolvedValue(undefined as any);
    return retr.handler.call(noFsClient, { log, command: { arg: "file", directive: CMD } }).then(() => {
      expect(spy.mock.calls[0][0]).toBe(550);
    });
  });
});
