import { describe, test, expect } from "bun:test";
import escapePath from "../../src/helpers/escape-path";

describe("helpers // escape-path", () => {
  test("escapes quotes", () => {
    const string = '"test"';
    const escapedString = escapePath(string);
    expect(escapedString).toBe('""test""');
  });
});
