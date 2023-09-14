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
import { stdout } from 'process';
import { computeChart } from './functions/compute-chart';

type BrowserName = "firefox" | "chrome" | null;

const remoteURL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://helm-viewer.vercel.app"

async function run() {
  const args = getArguments();

  // Display options
  if (args.values.help) {
    console.log(`\nhelm-viewer

  -b/--browser:       allow to open with a specific browser (firefox, chromium)
  -h/--help:          displays this menu
  -k/--encryptionKey: specify the encryption key
  -p/--push:          push the result of the build online and returns an URL
  -v/--values:        provide values files for the chart, can be provided several times
  -w/--watch:         activate the watch mode

  # When you are in a chart helm folder
  helm-viewer
  
  # To target a specific path
  helm-viewer path/of/the/chart
  
  # To compute the chart with an external values file
  helm-viewer path/of/the/chart --values path/of/the/values/file1 --values path/of/the/values/file2
  
  # To get a public link (with encrypted data)
  helm-viewer path/of/the/chart --push
    `)
    process.exit(0);
  }

  const currentPath = args.positionals.at(0) ?? process.cwd();
  const valuesPathArray = args.values.values;

  console.log(chalk.cyanBright(`⚡️ Path detected ${currentPath}`));
  console.log(
    valuesPathArray.length > 0
      ? chalk.greenBright(`🔑 Values detected : ${valuesPathArray.join(",")}`)
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
  let payload;
  try {
    payload = await computeChart(currentPath, valuesPathArray)
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
    await serveLocally(
      JSON_DATA,
      currentPath,
      args.values.watch,
      args.values.browser as BrowserName ?? null
    )
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
  watchingMode: boolean,
  browserName: BrowserName,
) {
  const id = randomUUID()
  if (process.env.NODE_ENV === "development") {
    open(`${remoteURL}?id=${id}`, { app: { name: "firefox" } })
  } else {
    if (browserName) {
      open(`${remoteURL}?id=${id}`, { app: { name: browserName } })
    } else {
      open(`${remoteURL}?id=${id}`)
    }
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
