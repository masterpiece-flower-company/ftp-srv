import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import getFileStat from "../../src/helpers/file-stat";
import * as errors from "../../src/errors";

describe("helpers // file-stat", () => {
  test("ls format returns string", () => {
    const fileStat = {
      mode: 0o755,
      mtime: new Date("2017-10-10T23:24:00Z"),
      uid: 85,
      gid: 100,
      size: 527,
      name: "test1",
      isDirectory: () => false,
    };
    const format = getFileStat(fileStat as any, "ls");
    expect(format).toMatch(/test1/);
  });

  test("ep format returns string", () => {
    const fileStat = {
      dev: 0x842,
      ino: 0x2dd69c9,
      size: 527,
      mtime: new Date("2017-10-10T23:24:00Z"),
      mode: 0o777,
      name: "test1",
      isDirectory: () => false,
    };
    const format = getFileStat(fileStat as any, "ep");
    expect(format).toMatch(/test1/);
  });

  test("bad format throws", () => {
    const fileStat = { name: "x", isDirectory: () => false };
    expect(() => getFileStat(fileStat as any, "bad")).toThrow(errors.FileSystemError);
  });
});
