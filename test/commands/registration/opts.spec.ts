import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import opts from "../../../src/commands/registration/opts";

const CMD = "OPTS";

describe(CMD, () => {
  const mockClient = {
    reply: () => Promise.resolve(),
    encoding: "utf8",
  };
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    mockClient.encoding = "utf8";
  });
  afterEach(() => replySpy.mockRestore());

  test("// unsuccessful", () => {
    return opts.handler.call(mockClient, { command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(502);
    });
  });

  test("BAD // unsuccessful", () => {
    return opts.handler.call(mockClient, { command: { arg: "BAD", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(502);
    });
  });

  test("UTF8 BAD // unsuccessful", () => {
    return opts.handler.call(mockClient, { command: { arg: "UTF8 BAD", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(502);
    });
  });

  test("UTF8 OFF // not supported", () => {
    return opts.handler.call(mockClient, { command: { arg: "UTF8 OFF", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(502);
    });
  });

  test("UTF8 ON // successful", () => {
    return opts.handler.call(mockClient, { command: { arg: "UTF8 ON", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(200);
    });
  });
});
