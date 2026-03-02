import { describe, test, expect } from "bun:test";
import FileSystem from "../src/fs";
import path from "path";
import fs from "fs";

describe("FileSystem", () => {
  const testDir = path.join(process.cwd(), "test_tmp_fs");
  const connection = {} as any;

  test("currentDirectory returns cwd", () => {
    const fsInstance = new FileSystem(connection, { root: testDir, cwd: "/" });
    expect(fsInstance.currentDirectory()).toBe("/");
  });

  test("root returns resolved root", () => {
    const fsInstance = new FileSystem(connection, { root: testDir, cwd: "/" });
    expect(fsInstance.root).toContain("test_tmp_fs");
  });

  test("getUniqueName returns string", () => {
    const fsInstance = new FileSystem(connection, { root: testDir });
    const name = fsInstance.getUniqueName();
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });
});
