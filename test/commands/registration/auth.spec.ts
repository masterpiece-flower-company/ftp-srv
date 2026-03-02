import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import tls from "tls";
import auth from "../../../src/commands/registration/auth";

const CMD = "AUTH";

describe(CMD, () => {
  const mockClient = {
    reply: () => Promise.resolve(),
    secure: false,
    _secure: false,
    commandSocket: {},
    server: { options: { tls: {} } },
  };
  let replySpy: ReturnType<typeof spyOn>;
  let tlsSocketSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    replySpy = spyOn(mockClient, "reply").mockResolvedValue(undefined as any);
    mockClient._secure = false;
    tlsSocketSpy = spyOn(tls, "TLSSocket").mockImplementation(function (this: any) {
      return {};
    } as any);
  });
  afterEach(() => {
    replySpy.mockRestore();
    tlsSocketSpy.mockRestore();
  });

  test("TLS // supported", () => {
    auth.handler.call(mockClient, { command: { arg: "TLS", directive: CMD } });
    expect(replySpy.mock.calls[0][0]).toBe(234);
    expect(mockClient._secure).toBe(true);
  });

  test("SSL // same as TLS (handler does not distinguish)", () => {
    auth.handler.call(mockClient, { command: { arg: "SSL", directive: CMD } });
    expect(replySpy.mock.calls[0][0]).toBe(234);
  });

  test("bad // same as TLS (handler does not validate type)", () => {
    auth.handler.call(mockClient, { command: { arg: "bad", directive: CMD } });
    expect(replySpy.mock.calls[0][0]).toBe(234);
  });
});
