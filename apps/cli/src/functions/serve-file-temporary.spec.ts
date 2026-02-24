import { beforeEach, describe, expect, it } from "vitest";

import { serverFileTemporary } from "./serve-file-temporary";

describe("serve file temporary", () => {
  beforeEach(() => {
    serverFileTemporary({ data: 1, date: "2023-08-20T08:39:53.882Z" }, 8888);
  });

  it("should return the payload via HTTP", async () => {
    const data = await fetch("http://localhost:8888").then((res) => res.json());
    expect(data).toEqual({ data: 1, date: "2023-08-20T08:39:53.882Z" });
    // The server should be cut after delivering the payload
    expect(() => fetch("http://localhost:8888")).rejects.toThrow();
  });
});
