import { History } from '../storage/history';
import { decrypt } from './encryption';

const remoteURL = "http://localhost:3000";

export async function readRemoteChart(id: string, encryptionKey: string): Promise<any> {
  const key = `helm-viewer-${id}`

  const { chartVersion, chartName, content: encryptedContent } = await $fetch(`${remoteURL}/api/chart-download?chartId=${id}`);


  History.append({
    date: new Date(),
    id: id ?? "",
    chartName,
    chartVersion,
  })

  const data = decrypt(encryptedContent, encryptionKey)
  localStorage.setItem(key, data)

  return data
}
