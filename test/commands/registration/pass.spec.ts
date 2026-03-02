import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { createLogger } from "../../../src/logger";
import pass from "../../../src/commands/registration/pass";

const CMD = "PASS";
const log = createLogger({ name: CMD });

describe(CMD, () => {
  const mockClient = {
    reply: () => {},
    login: () => {},
    server: { options: { anonymous: false } },
    username: "anonymous",
    authenticated: false,
  };
  const cmdFn = pass.handler.bind(mockClient);
  let replySpy: ReturnType<typeof spyOn>;
  let loginSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    loginSpy = spyOn(mockClient, "login").mockResolvedValue(undefined as any);
    mockClient.authenticated = false;
    mockClient.username = "anonymous";
    mockClient.server.options.anonymous = false;
  });
  afterEach(() => {
    replySpy.mockRestore();
    loginSpy.mockRestore();
  });

  test("pass // successful", () => {
    return cmdFn({ log, command: { arg: "pass", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(230);
      expect(loginSpy.mock.calls[0]).toEqual(["anonymous", "pass"]);
    });
  });

  test("// successful (already authenticated)", () => {
    mockClient.server.options.anonymous = true;
    mockClient.authenticated = true;
    return cmdFn({ log, command: { directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(202);
      expect(loginSpy.mock.calls.length).toBe(0);
      mockClient.server.options.anonymous = false;
      mockClient.authenticated = false;
    });
  });

  test("bad // unsuccessful", () => {
    loginSpy.mockRestore();
    spyOn(mockClient, "login").mockRejectedValue("bad");
    return cmdFn({ log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(530);
    });
  });

  test("bad // unsuccessful (object error)", () => {
    loginSpy.mockRestore();
    spyOn(mockClient, "login").mockRejectedValue({});
    return cmdFn({ log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(530);
    });
  });

  test("bad // unsuccessful (no username)", () => {
    delete (mockClient as any).username;
    return cmdFn({ log, command: { arg: "bad", directive: CMD } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(503);
    });
  });
});
