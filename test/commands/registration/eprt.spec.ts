import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import eprt from "../../../src/commands/registration/eprt";

const CMD = "EPRT";
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

  test("|2|127.0.0.1|12345| // successful", () => {
    return eprt.handler
      .call(mockClient, { log, command: { arg: "|2|127.0.0.1|12345|", directive: CMD } })
      .then(() => {
        expect(replySpy.mock.calls[0][0]).toBe(200);
      });
  });
});
