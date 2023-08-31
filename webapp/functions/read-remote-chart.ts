import { History } from '../storage/history';

const remoteURL = "http://localhost:3000";

export async function readRemoteChart(id: string, encryptionKey: string): Promise<any> {
  const key = `helm-viewer-${id}`

  const chart = await $fetch(`${remoteURL}/api/chart-download?chartId=${id}`);

  History.append({
    date: new Date(),
    id: id ?? "",
    chartName: "toFix",
    chartVersion: "toFix"
  })

  localStorage.setItem(key, JSON.stringify(chart))

  return chart
}
