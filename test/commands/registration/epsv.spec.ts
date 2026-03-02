import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import epsv from "../../../src/commands/registration/epsv";

const CMD = "EPSV";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    connector: null as any,
    server: { options: {}, url: { hostname: "127.0.0.1" }, getNextPasvPort: () => Promise.resolve(12345) },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test.skip("// sets up passive connector (listens on port)", async () => {
    await epsv.handler.call(mockClient, { log });
    expect(replySpy.mock.calls[0][0]).toBe(229);
  }, 5000);
});
