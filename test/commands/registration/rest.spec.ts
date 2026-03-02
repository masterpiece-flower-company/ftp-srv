import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import rest from "../../../src/commands/registration/rest";

const CMD = "REST";

describe(CMD, () => {
  const mockClient = {
    reply: () => Promise.resolve(),
    restByteCount: 0,
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    mockClient.restByteCount = 0;
  });
  afterEach(() => replySpy.mockRestore());

  test("// unsuccessful", () => {
    return rest.handler.call(mockClient, { command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(501);
    });
  });

  test("-1 // unsuccessful", () => {
    return rest.handler.call(mockClient, { command: { arg: "-1", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(501);
    });
  });

  test("bad // unsuccessful", () => {
    return rest.handler.call(mockClient, { command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(501);
    });
  });

  test("1 // successful", () => {
    return rest.handler.call(mockClient, { command: { arg: "1", directive: CMD } }).then(() => {
      expect(mockClient.restByteCount).toBe(1);
      expect(replySpy.mock.calls[0][0]).toBe(350);
    });
  });

  test("0 // successful", () => {
    return rest.handler.call(mockClient, { command: { arg: "0", directive: CMD } }).then(() => {
      expect(mockClient.restByteCount).toBe(0);
      expect(replySpy.mock.calls[0][0]).toBe(350);
    });
  });
});
