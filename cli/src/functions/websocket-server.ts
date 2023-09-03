import chalk from 'chalk';
import { WebSocketServer } from 'ws';
import { helmChartModifiedEvent } from '../events/helm-chart-modified';
import { computeChart } from './compute-chart';

export function startWebsocketServer(currentPath: string) {
  const wss = new WebSocketServer({ port: 12096 });

  console.log(chalk.cyanBright(`⚡️ Web socket started on 12096`));

  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    helmChartModifiedEvent.addListener('changed', async (filePath: string) => {
      try {
        const payload = await computeChart(currentPath)
        ws.send(JSON.stringify({
          filePath,
          chartContentUpdated: payload
        }));
      } catch (err) {
        console.log(err)
      }
    })
  });
}
