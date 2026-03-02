import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import stor from "../../../src/commands/registration/stor";

const CMD = "STOR";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    restByteCount: 0,
    connector: { waitForConnection: () => Promise.resolve(), socket: { pipe: () => {}, once: () => {}, resume: () => {} }, end: () => {} },
    commandSocket: { pause: () => {}, resume: () => {} },
    fs: { write: () => ({ stream: { once: () => {}, end: () => {}, destroy: () => {}, listenerCount: () => 0 }, clientPath: "x" }) },
    emit: () => {},
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.connector, "waitForConnection").mockResolvedValue({});
    const writeResult = {
      stream: {
        once: () => {},
        end: () => {},
        destroy: () => {},
        listenerCount: () => 0,
        path: "x",
      },
      clientPath: "x",
    };
    spyOn(mockClient.fs, "write").mockReturnValue(writeResult);
  });
  afterEach(() => replySpy.mockRestore());

  test("// no fs returns 550", () => {
    const noFsClient = { reply: () => {}, connector: {}, commandSocket: {}, emit: () => {} };
    const spy = spyOn(noFsClient, "reply").mockResolvedValue(undefined as any);
    return stor.handler.call(noFsClient, { log, command: { arg: "file", directive: CMD } }).then(() => {
      expect(spy.mock.calls[0][0]).toBe(550);
    });
  });
});
