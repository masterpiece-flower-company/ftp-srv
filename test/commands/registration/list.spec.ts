import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import list from "../../../src/commands/registration/list";

const CMD = "LIST";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    connector: { waitForConnection: () => Promise.resolve(), socket: {}, end: () => {} },
    fs: { get: () => Promise.resolve({ isDirectory: () => true }), list: () => Promise.resolve([]) },
    commandSocket: { pause: () => {}, resume: () => {} },
    server: { options: { file_format: "ls" } },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.connector, "waitForConnection").mockResolvedValue({});
    spyOn(mockClient.fs, "get").mockResolvedValue({ isDirectory: () => true });
    spyOn(mockClient.fs, "list").mockResolvedValue([]);
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return list.handler.call(mockClient, { log, command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
