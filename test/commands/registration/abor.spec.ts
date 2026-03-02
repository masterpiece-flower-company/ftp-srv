import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import abor from "../../../src/commands/registration/abor";

const CMD = "ABOR";

describe(CMD, () => {
  const mockClient = {
    reply: () => Promise.resolve(),
    connector: { waitForConnection: () => Promise.reject(), end: () => {} },
  };
  let replySpy: ReturnType<typeof spyOn>;
  let endSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    mockClient.connector.waitForConnection = () => Promise.reject();
    endSpy = spyOn(mockClient.connector, "end");
  });
  afterEach(() => {
    replySpy.mockRestore();
    endSpy.mockRestore();
  });

  test("// calls connector.end", () => {
    return abor.handler.call(mockClient, {}).then(() => {
      expect(endSpy.mock.calls.length).toBe(1);
    });
  });
});
