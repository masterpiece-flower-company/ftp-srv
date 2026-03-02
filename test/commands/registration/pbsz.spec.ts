import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import pbsz from "../../../src/commands/registration/pbsz";

const CMD = "PBSZ";

describe(CMD, () => {
  const mockClient = { reply: () => Promise.resolve(), secure: true, bufferSize: false };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  test("0 // successful", () => {
    return pbsz.handler.call(mockClient, { command: { arg: "0", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });
});
