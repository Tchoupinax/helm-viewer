import { describe, expect, it } from "vitest";

import { computeChart } from "./compute-chart";

describe("compute chart", () => {
  it("should compute chart correctly", async () => {
    const chart = await computeChart(
      "~/Downloads/traefik-helm-chart/traefik",
      "release-name",
    );

    expect(chart.name).toBe("traefik");
    expect(chart.version).toBe("9.18.1");
  });
});
