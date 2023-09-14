import chalk from 'chalk';
import { WebSocketServer } from 'ws';
import { helmChartModifiedEvent } from '../events/helm-chart-modified';
import { computeChart } from './compute-chart';

export function startWebsocketServer(currentPath: string, releaseName: string) {
  const wss = new WebSocketServer({ port: 12096 });

  console.log(chalk.cyanBright(`⚡️ Web socket started on 12096`));
  console.log(chalk.cyanBright(`Don't touch this terminal anymore and see your chart change directly in the browser`));

  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    helmChartModifiedEvent.addListener('changed', async (filePath: string) => {
      try {
        const payload = await computeChart(currentPath, releaseName)
        ws.send(JSON.stringify({
          filePath,
          chartContentUpdated: payload,
          error: null,
        }));
      } catch (err) {
        ws.send(JSON.stringify({
          filePath: null,
          chartContentUpdated: null,
          error: (err as any).stderr
        }));
      }
    })
  });
}
