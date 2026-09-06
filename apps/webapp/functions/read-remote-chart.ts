import { History } from "../storage/history";
import { decrypt } from "./encryption";

type RemoteChartResponse = {
  chartName: string;
  chartVersion: string;
  content: string;
};

export async function readRemoteChart(
  id: string,
  encryptionKey: string,
  remoteURL: string,
): Promise<unknown> {
  const key = `helm-viewer-${id}`;

  const {
    chartVersion,
    chartName,
    content: encryptedContent,
  } = await $fetch<RemoteChartResponse>(
    `${remoteURL}/api/chart-download?chartId=${id}`,
  );

  History.append({
    date: new Date(),
    id: id ?? "",
    chartName,
    chartVersion,
  });

  const data = decrypt(encryptedContent, encryptionKey);
  localStorage.setItem(key, data);

  return JSON.parse(data) as unknown;
}
