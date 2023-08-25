import { History } from '../storage/history';

export async function readSharedChart(id: string, encryptionKey: string): Promise<any> {
  const key = `helm-viewer-${id}`

  const payload = await $fetch(
    `/api/shared/read?id=${id}`,
  {
    method: "POST",
    body: {
      encryptionKey
    }
  })

  History.append({
    date: new Date(),
    id: id ?? "",
    chartName: payload.chartName,
    chartVersion: payload.chartVersion
  })

  localStorage.setItem(key, JSON.stringify(payload.content))

  return payload.content
}