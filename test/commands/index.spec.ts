import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import FtpCommands from "../../src/commands";
import { createLogger } from "../../src/logger";

describe("FtpCommands", () => {
  const mockConnection = {
    authenticated: false,
    log: createLogger({ name: "FtpCommands" }),
    reply: () => Promise.resolve({}),
    server: { options: { blacklist: ["allo"] } },
  };
  let commands: FtpCommands;
  let replySpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    commands = new FtpCommands(mockConnection as any);
    replySpy = spyOn(mockConnection, "reply").mockResolvedValue(undefined as any);
  });
  afterEach(() => replySpy.mockRestore());

  describe("parse", () => {
    test("no args: test", () => {
      const cmd = commands.parse("test");
      expect(cmd.directive).toBe("TEST");
      expect(cmd.arg).toBe(null);
      expect(cmd.raw).toBe("test");
    });

    test("one arg: test arg", () => {
      const cmd = commands.parse("test arg");
      expect(cmd.directive).toBe("TEST");
      expect(cmd.arg).toBe("arg");
      expect(cmd.raw).toBe("test arg");
    });

    test("two args: test arg1 arg2", () => {
      const cmd = commands.parse("test arg1 arg2");
      expect(cmd.directive).toBe("TEST");
      expect(cmd.arg).toBe("arg1 arg2");
      expect(cmd.raw).toBe("test arg1 arg2");
    });

    test("two args with quotes: test \"hello world\"", () => {
      const cmd = commands.parse('test "hello world"');
      expect(cmd.directive).toBe("TEST");
      expect(cmd.arg).toBe("hello world");
      expect(cmd.raw).toBe('test "hello world"');
    });

    test("two args, with flags: test -l arg1 -A arg2 --zz88A", () => {
      const cmd = commands.parse("test -l arg1 -A arg2 --zz88A");
      expect(cmd.directive).toBe("TEST");
      expect(cmd.arg).toBe("arg1 arg2 --zz88A");
      expect(cmd.flags).toEqual(["-l", "-A"]);
      expect(cmd.raw).toBe("test -l arg1 -A arg2 --zz88A");
    });

    test("one arg, with flags: list -l", () => {
      const cmd = commands.parse("list -l");
      expect(cmd.directive).toBe("LIST");
      expect(cmd.arg).toBe(null);
      expect(cmd.flags).toEqual(["-l"]);
      expect(cmd.raw).toBe("list -l");
    });

    test("does not check for option flags", () => {
      const cmd = commands.parse("retr -test");
      expect(cmd.directive).toBe("RETR");
      expect(cmd.arg).toBe("-test");
      expect(cmd.flags).toEqual([]);
    });
  });

  describe("handle", () => {
    test("fails with unsupported command", () => {
      return commands.handle("bad").then(() => {
        expect(replySpy.mock.calls.length).toBe(1);
        expect(replySpy.mock.calls[0][0]).toBe(502);
      });
    });

    test("fails with blacklisted command", () => {
      return commands.handle("allo").then(() => {
        expect(replySpy.mock.calls.length).toBe(1);
        expect(replySpy.mock.calls[0][0]).toBe(502);
        expect(String(replySpy.mock.calls[0][1])).toMatch(/blacklisted/);
      });
    });

    test("fails with non whitelisted command", () => {
      commands.whitelist.push("USER");
      return commands.handle("auth").then(() => {
        expect(replySpy.mock.calls.length).toBe(1);
        expect(replySpy.mock.calls[0][0]).toBe(502);
        expect(String(replySpy.mock.calls[0][1])).toMatch(/whitelisted/);
      });
    });

    test("fails due to being unauthenticated", () => {
      return commands.handle("stor").then(() => {
        expect(replySpy.mock.calls.length).toBe(1);
        expect(replySpy.mock.calls[0][0]).toBe(530);
        expect(String(replySpy.mock.calls[0][1])).toMatch(/authentication/);
      });
    });
  });
});
