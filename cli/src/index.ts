import { isChartFolder } from './functions/is-chart-folder';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { getArguments } from './functions/parse-cli';
import { type Chart, computeChart } from './functions/compute-chart';
import { checkNodeVersion } from './functions/check-node-version';
import { pushOnlineFunction } from './functions/push-online';
import { serveLocally } from './functions/serve-locally';
import { featureDetectUnusedValues } from './features/detect-unused-values';

export type BrowserName = "firefox" | "chrome" | "default";

async function run() {
  checkNodeVersion()

  const args = getArguments();

  // Display options
  if (args.values.help) {
    console.log(`\nhelm-viewer v0.9.0

  -b/--browser:       allow to open with a specific browser (firefox, chromium)
  -h/--help:          displays this menu
  -k/--encryptionKey: specify the encryption key
  -n/--name:          provide a release name to Helm
  -p/--push:          push the result of the build online and returns an URL
  -v/--values:        provide values files for the chart, can be provided several times
  -w/--watch:         activate the watch mode
     --noserve:       prevent to open the browser locally

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
  let payload: Chart;
  try {
    payload = await computeChart(currentPath, args.values.name, valuesPathArray)
  } catch (err) {
    console.log("\n")
    console.log(chalk.bgRedBright("The computation of the chart failed. (message below)"));
    console.log((err as Error).message);
    console.log("\n")
    process.exit(1)
  }

  await featureDetectUnusedValues(
    valuesPathArray,
    payload.templated
  );

  if (args.values.push) {
    await pushOnlineFunction(payload, args.values.encryptionKey)
  } else {
    if (!args.values.noserve) {
      await serveLocally(
        payload,
        currentPath,
        args.values.watch,
        args.values.browser as BrowserName ?? null,
        args.values.name
      )
    }
  }

  process.exit(0)
};

run();
