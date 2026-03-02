import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import prot from "../../../src/commands/registration/prot";

const CMD = "PROT";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve(), secure: true, bufferSize: 0 };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("P // successful", () => {
    return prot.handler.call(mockClient, { command: { arg: "P", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });
});
