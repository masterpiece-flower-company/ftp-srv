import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import port from "../../../src/commands/registration/port";

const CMD = "PORT";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    connector: {} as any,
    commandSocket: { remoteAddress: "127.0.0.1" },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("wrong address // returns 500", () => {
    return port.handler
      .call(mockClient, { log, command: { arg: "192,168,1,1,0,21", directive: CMD } })
      .then(() => {
        expect(replySpy.mock.calls[0][0]).toBe(500);
      });
  });
});
