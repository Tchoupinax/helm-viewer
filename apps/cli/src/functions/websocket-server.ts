import chalk from "chalk";
import { WebSocketServer } from "ws";

import { helmChartModifiedEvent } from "../events/helm-chart-modified";
import { computeChart } from "./compute-chart";

export function startWebsocketServer(currentPath: string, releaseName: string) {
  const wss = new WebSocketServer({ port: 12096 });

  console.log(chalk.cyanBright("⚡️ Web socket started on 12096"));
  console.log(
    chalk.cyanBright(
      "Don't touch this terminal anymore and see your chart change directly in the browser",
    ),
  );

  wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    helmChartModifiedEvent.addListener("changed", (filePath: string) => {
      void computeChart(currentPath, releaseName)
        .then(payload => {
          ws.send(
            JSON.stringify({
              filePath,
              chartContentUpdated: payload,
              error: null,
            }),
          );
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error && "stderr" in err
              ? String((err as { stderr?: string }).stderr)
              : err instanceof Error
                ? err.message
                : "Unknown helm error";

          ws.send(
            JSON.stringify({
              filePath: null,
              chartContentUpdated: null,
              error: message,
            }),
          );
        });
    });
  });
}
