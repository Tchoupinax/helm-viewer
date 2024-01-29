import { nanoid } from "nanoid";
import { watchHelmChartFilesModifications } from "./file-watcher";
import { serverFileTemporary } from "./serve-file-temporary";
import { startWebsocketServer } from "./websocket-server";
import yaml from 'js-yaml'
import { BrowserName } from "..";
import open from 'open'

const remoteURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.BACKEND_ENDPOINT ?? "https://helm-viewer.vercel.app"

export async function serveLocally(
  payload: { name: string, version: string, templated: {}, sources: {} },
  currentPath: string,
  watchingMode: boolean,
  browserName: BrowserName,
  releaseName: string
) {
  const id = nanoid()
  if (process.env.NODE_ENV === "development") {
    open(`${remoteURL}?id=${id}`, { app: { name: "firefox" } })
  } else {
    if (browserName !== "default") {
      open(`${remoteURL}?id=${id}`, { app: { name: browserName } })
    } else {
      open(`${remoteURL}?id=${id}`)
    }
  }

  const { version, name } = yaml.load(payload.sources['Chart.yaml']) as { version: string, name: string };

  await Promise.all([
    serverFileTemporary(JSON.stringify(payload), 12094),
    serverFileTemporary({ chartName: name, chartVersion: version }, 12095)
  ]);

  if (watchingMode) {
    startWebsocketServer(currentPath, releaseName)
    watchHelmChartFilesModifications(currentPath)
    await new Promise(resolve => setTimeout(resolve, 1e8))
  }
}
