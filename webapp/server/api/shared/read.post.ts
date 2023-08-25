import { defineEventHandler, getQuery, readBody } from "h3";
import { ChartRepository } from "../../infrastructure/chart.repository";
import yaml from 'js-yaml'

export default defineEventHandler(async (event) => {
  const { id: chartId } = getQuery(event)
  const body = await readBody(event);
  const content = ChartRepository.read(chartId, body.content)

  const { version, name } = yaml.load(content.sources['Chart.yaml']) as { version: string, name: string };

  return {
    chartVersion: version,
    chartName: name,
    content
  }
});

