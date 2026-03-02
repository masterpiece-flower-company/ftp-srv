import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../../src/logger";
import chmod from "../../../../src/commands/registration/site/chmod";

const log = createLogger({ name: "chmod-test" });

describe("SITE CHMOD", () => {
  const mockClient = {
    reply: () => {},
    fs: { chmod: () => {} },
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    spyOn(mockClient.fs, "chmod").mockResolvedValue(undefined);
  });
  afterEach(() => replySpy.mockRestore());

  test("755 file // successful", () => {
    return chmod.call(mockClient, { log, command: { arg: "755 file" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });
});
