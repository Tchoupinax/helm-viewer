import chokidar from "chokidar";

import { helmChartModifiedEvent } from "../events/helm-chart-modified";

export async function watchHelmChartFilesModifications(currentPath: string) {
  chokidar.watch(currentPath).on("all", (_, path) => {
    helmChartModifiedEvent.emit("changed", path);
  });
}
