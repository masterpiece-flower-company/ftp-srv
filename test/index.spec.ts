import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import _ from "lodash";
import fs from "fs";
import path from "path";
import FtpServer from "../src";
import FtpClient from "@icetee/ftp";
import { createLogger } from "../src/logger";

describe("Integration", () => {
  const log = createLogger({ name: "test-runner" });
  const clientDirectory = path.join(process.cwd(), "test_tmp");
  let server: FtpServer;

  beforeAll(() => {
    if (!fs.existsSync(clientDirectory)) {
      fs.mkdirSync(clientDirectory, { recursive: true });
    }
  });

  test("server listens", async () => {
    server = new FtpServer({
      log,
      url: "ftp://127.0.0.1:8880",
      pasv_url: "127.0.0.1",
      pasv_min: 8881,
      anonymous: true,
    });
    server.on("login", (_data: any, resolve: any) => {
      resolve({ root: clientDirectory });
    });
    await server.listen();
    expect(server.url.port).toBe("8880");
    expect(server.url.hostname).toBe("127.0.0.1");
  }, 5000);

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });
});
