import { isChartFolder } from './functions/is-chart-folder';
import { mkdirSync } from 'fs';
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
import { computeChart } from './functions/compute-chart';
import { nanoid } from 'nanoid'
import { checkNodeVersion } from './functions/check-node-version';
import { computeUrls } from './functions/compute-urls';

type BrowserName = "firefox" | "chrome" | "default";

const { remoteReadURL, remoteURL } = computeUrls();

async function run() {
  checkNodeVersion()

  const args = getArguments();

  // Display options
  if (args.values.help) {
    console.log(`\nhelm-viewer v0.15.1

  -b/--browser:       allow to open with a specific browser (firefox, chromium)
  -h/--help:          displays this menu
  -k/--encryptionKey: specify the encryption key
  -n/--name:          provide a release name to Helm
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
      : chalk.yellowBright(`⚠️  No value detected, computing with default values in the Chart`)
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
    payload = await computeChart(currentPath, args.values.name, valuesPathArray)
  } catch (err) {
    console.log("\n")
    console.log(chalk.bgRedBright("The computation of the chart failed. (message below)"));
    console.log((err as Error).message);
    console.log("\n")
    process.exit(1)
  }

  if (args.values.push) {
    await pushOnlineFunction(payload, args.values.encryptionKey)
  } else {
    await serveLocally(
      payload,
      currentPath,
      args.values.watch,
      args.values.browser as BrowserName ?? null,
      args.values.name
    )
  }

  process.exit(0)
};

async function pushOnlineFunction(
  payload: { name: string, version: string, templated: {}, sources: {} },
  encryptionKey: string
) {
  const id = nanoid();
  const { version, name } = yaml.load(payload.sources['Chart.yaml']) as { version: string, name: string };
  const content = {
    chartVersion: version,
    chartName: name,
    content: encrypt(JSON.stringify(payload), encryptionKey)
  }

  await fetch(`${remoteURL}/api/chart-upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: JSON.stringify(content),
      chartId: id,
    })
  })

  console.log("")
  console.log(`${remoteReadURL}?id=${id}&k=${encryptionKey}&o=t`)
  console.log("")

  fs.writeFileSync('.helm-viewer-url', `${remoteReadURL}?id=${id}&k=${encryptionKey}&o=t`)
}

async function serveLocally(
  payload: { name: string, version: string, templated: {}, sources: {} },
  currentPath: string,
  watchingMode: boolean,
  browserName: BrowserName,
  releaseName: string
) {
  const id = nanoid()
  if (process.env.NODE_ENV === "development") {
    open(`${remoteURL}?id=${id}`, { app: { name: "firefox" } })
  } else {
    if (browserName !== "default") {
      open(`${remoteURL}?id=${id}`, { app: { name: browserName } })
    } else {
      open(`${remoteURL}?id=${id}`)
    }
  }

  const { version, name } = yaml.load(payload.sources['Chart.yaml']) as { version: string, name: string };

  await Promise.all([
    serverFileTemporary(JSON.stringify(payload), 12094),
    serverFileTemporary({ chartName: name, chartVersion: version }, 12095)
  ]);

  if (watchingMode) {
    startWebsocketServer(currentPath, releaseName)
    watchHelmChartFilesModifications(currentPath)
    await new Promise(resolve => setTimeout(resolve, 1e8))
  }
}

run();
