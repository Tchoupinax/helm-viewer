import { nanoid } from "nanoid";
import { encrypt } from "./encryption";
import yaml from 'js-yaml'
import fs from 'fs';

const remoteURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.BACKEND_ENDPOINT ?? "https://helm-viewer.vercel.app"
const remoteReadURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.BACKEND_READ_ENDPOINT ?? process.env.BACKEND_ENDPOINT ?? "https://helm-viewer.vercel.app"

export async function pushOnlineFunction(
  payload: { name: string, version: string, templated: {}, sources: {} },
  encryptionKey: string
) {
  const id = nanoid();
  const { version, name } = yaml.load(payload.sources['Chart.yaml']) as { version: string, name: string };
  const content = {
    chartVersion: version,
    chartName: name,
    content: encrypt(JSON.stringify(payload), encryptionKey)
  }

  await fetch(`${remoteURL}/api/chart-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: JSON.stringify(content),
      chartId: id,
    })
  })

  console.log("")
  console.log(`${remoteReadURL}?id=${id}&k=${encryptionKey}&o=t`)
  console.log("")

  fs.writeFileSync('.helm-viewer-url', `${remoteReadURL}?id=${id}&k=${encryptionKey}&o=t`)
}
