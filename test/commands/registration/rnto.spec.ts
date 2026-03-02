import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import rnto from "../../../src/commands/registration/rnto";

const CMD = "RNTO";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    renameFrom: "old",
    fs: { rename: () => {} },
    emit: () => {},
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    (mockClient as any).renameFrom = "old";
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.fs, "rename").mockResolvedValue(undefined);
  });
  afterEach(() => replySpy.mockRestore());

  test("// successful", () => {
    return rnto.handler.call(mockClient, { log, command: { arg: "new", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(250);
    });
  });
});
