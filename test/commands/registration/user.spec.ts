import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import user from "../../../src/commands/registration/user";

const CMD = "USER";

describe(CMD, () => {
  const mockLog = { error: () => {} };
  const mockClient = {
    reply: () => Promise.resolve(),
    server: { options: {} as any },
    login: () => Promise.resolve(),
    username: undefined as string | undefined,
    authenticated: false,
  };
  let replySpy: ReturnType<typeof spyOn>;
  let loginSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    delete (mockClient as any).username;
    mockClient.server.options = {};
    mockClient.authenticated = false;
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    loginSpy = spyOn(mockClient, "login").mockResolvedValue(undefined as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
    loginSpy.mockRestore();
  });

  test("test // successful | prompt for password", () => {
    return user.handler.call(mockClient, { command: { arg: "test" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(331);
    });
  });

  test("test // successful | anonymous login", () => {
    mockClient.server.options = { anonymous: true };
    return user.handler.call(mockClient, { command: { arg: "anonymous" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(230);
      expect(loginSpy.mock.calls.length).toBe(1);
    });
  });

  test("test // unsuccessful | no username provided", () => {
    return user.handler.call(mockClient, { command: {} }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(501);
      expect(loginSpy.mock.calls.length).toBe(0);
    });
  });

  test("test // unsuccessful | already set username", () => {
    (mockClient as any).username = "test";
    return user.handler.call(mockClient, { command: { arg: "test" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(530);
      expect(loginSpy.mock.calls.length).toBe(0);
    });
  });

  test("test // successful | regular login if anonymous is true", () => {
    mockClient.server.options = { anonymous: true };
    return user.handler.call(mockClient, { log: mockLog, command: { arg: "test" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(331);
      expect(loginSpy.mock.calls.length).toBe(0);
    });
  });

  test("test // successful | anonymous login with set username", () => {
    mockClient.server.options = { anonymous: "sillyrabbit" };
    return user.handler.call(mockClient, { log: mockLog, command: { arg: "sillyrabbit" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(230);
      expect(loginSpy.mock.calls.length).toBe(1);
    });
  });

  test("test // unsuccessful | anonymous login fails", () => {
    mockClient.server.options = { anonymous: true };
    loginSpy.mockRestore();
    spyOn(mockClient, "login").mockRejectedValue(new Error("test"));
    return user.handler.call(mockClient, { log: mockLog, command: { arg: "anonymous" } }).then(() => {
      expect(replySpy.mock.calls[0][0]).toBe(530);
      expect((mockClient.login as any).mock.calls.length).toBe(1);
    });
  });

  test("test // does not login if already authenticated", () => {
    const isolatedClient = {
      reply: () => Promise.resolve(),
      server: { options: {} },
      login: () => Promise.resolve(),
      username: undefined as string | undefined,
      authenticated: true,
    };
    const replySpy2 = spyOn(isolatedClient, "reply").mockResolvedValue(undefined as any);
    const loginSpy2 = spyOn(isolatedClient, "login").mockResolvedValue(undefined as any);
    return user.handler.call(isolatedClient, { log: mockLog, command: { arg: "sillyrabbit" } }).then(() => {
      expect(replySpy2.mock.calls[0][0]).toBe(230);
      expect(loginSpy2.mock.calls.length).toBe(0);
    });
  });
});
