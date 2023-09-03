import { isChartFolder } from './functions/is-chart-folder';
import { $ } from 'execa'
import { saveSourcesYamlToFiles, saveTemplatedYamlToFiles } from './functions/save-yaml';
import { mkdirSync, readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { serverFileTemporary } from './functions/serve-file-temporary';
import open from 'open'
import yaml from 'js-yaml'
import { encrypt } from './functions/encryption';
import fs from 'fs';
import { startWebsocketServer } from './functions/websocket-server';
import { watchHelmChartFilesModifications } from './functions/file-watcher'
import { getArguments } from './functions/parse-cli';

const remoteURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://helm-viewer.vercel.app"

async function run() {
  const args = getArguments();
  const currentPath = args.positionals.at(0) ?? process.cwd();
  const values = args.positionals.at(1)
  
  console.log(chalk.cyanBright(`⚡️ Path detected ${currentPath}`));
  console.log(
    values
      ? chalk.greenBright(`🔑 Values detected ${values}`)
      : chalk.yellowBright(`⚠️ No value detected, computing with default values in the Chart`)
  );

  const tmpDir = `${tmpdir()}/${randomUUID()}`;

  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(`${tmpDir}/sources`, { recursive: true });
  mkdirSync(`${tmpDir}/templated`, { recursive: true });

  if(!isChartFolder(currentPath)) {
    console.log('Not a chart folder');
    process.exit(1);
  }

  // Template files and save them
  let stdout;

  try {
    if (!values) {
      ({ stdout } = await $`helm template ${currentPath}`);
    } else {
      ({ stdout } = await $`helm template ${currentPath} --values ${values}`);
    }
  } catch (err) {
    console.log("\n")
    console.log(chalk.bgRedBright("The computation of the chart failed. (message below)"));
    console.log((err as Error).message);
    console.log("\n")
    process.exit(1)
  }
  
  saveTemplatedYamlToFiles(tmpDir, stdout)

  // Save sources files
  saveSourcesYamlToFiles(currentPath, tmpDir);

  // Create the script
  const JSON_DATA = readFileSync(`${tmpDir}/global-data.json`, 'utf-8');
  
  if (args.values.push) {
    await pushOnlineFunction(JSON_DATA, args.values.encryptionKey)
  } else {
    await serveLocally(JSON_DATA, currentPath, args.values.watch)
  }

  process.exit(0)
};

async function pushOnlineFunction(JSON_DATA, encryptionKey: string) {
  const id = randomUUID();

  const { version, name } = yaml.load(JSON.parse(JSON_DATA).sources['Chart.yaml']) as { version: string, name: string };
  const payload = {
    chartVersion: version,
    chartName: name,
    content: encrypt(JSON_DATA,encryptionKey)
  }

  await fetch(`${remoteURL}/api/chart-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: JSON.stringify(payload),
      chartId: id,
    })
  })

  console.log("")
  console.log(`${remoteURL}?id=${id}&encryptionKey=${encryptionKey}&online=true`)
  console.log("")

  fs.writeFileSync('.helm-viewer-url', `${remoteURL}?id=${id}&encryptionKey=${encryptionKey}&online=true`)
}

async function serveLocally(
  JSON_DATA: string,
  currentPath: string,
  watchingMode: boolean
) {
  const id = randomUUID()
  if (process.env.NODE_ENV === "development") {
    open(`${remoteURL}?id=${id}`, { app: { name: "firefox" } })
  } else {
    open(`${remoteURL}?id=${id}`)
  }

  const { version, name } = yaml.load(JSON.parse(JSON_DATA).sources['Chart.yaml']) as { version: string, name: string };

  await Promise.all([
    serverFileTemporary(JSON_DATA, 12094),
    serverFileTemporary({ chartName: name, chartVersion: version }, 12095)
  ]);

  if (watchingMode) {
    startWebsocketServer(currentPath)
    watchHelmChartFilesModifications(currentPath)
    await new Promise(resolve => setTimeout(resolve, 1e8))
  }
}

run();
