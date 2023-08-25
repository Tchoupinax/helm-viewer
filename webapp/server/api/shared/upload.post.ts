import { defineEventHandler, getQuery, readBody } from "h3";
import { ChartRepository } from "../../infrastructure/chart.repository";

export default defineEventHandler(async (event) => {
  const { id: chartId } = getQuery(event)
  const body = await readBody(event);
  const encryptionKey = ChartRepository.upload(chartId, body.content)

  return {
    encryptionKey,
    chartId,
  }
});

