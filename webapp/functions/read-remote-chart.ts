import { History } from '../storage/history';

const remoteURL = "http://localhost:8000";

export async function readRemoteChart(id: string, encryptionKey: string): Promise<any> {
  const key = `helm-viewer-${id}`

  const chart = await $fetch(`${remoteURL}/charts/${id}`);

  History.append({
    date: new Date(),
    id: id ?? "",
    chartName: "toFix",
    chartVersion: "toFix"
  })

  localStorage.setItem(key, chart)

  return chart
}
