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

async function run() {
  const currentPath = process.argv?.at(2) ?? process.cwd();
  const values = process.argv?.at(3) !== "--push" ? process.argv?.at(3): undefined;
  const pushOnline = process.argv.includes('--push')

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
  
  if (pushOnline) {
    await pushOnlineFunction(JSON_DATA)
  } else {
    await serveLocally(JSON_DATA)
  }

  process.exit(0)
};

async function pushOnlineFunction(JSON_DATA) {
  const id = randomUUID();

  await fetch("http://localhost:8000/charts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: JSON_DATA,
      chartId: id,
    })
  })

  console.log('Uploaded with id=', id)
}

async function serveLocally(JSON_DATA) {
  const id = randomUUID()
  if (process.env.NODE_ENV === "development") {
    open(`http://localhost:3000?id=${id}`, { app: { name: "firefox" } })
  } else {
    open(`https://helm-viewer.vercel.app?id=${id}`)
  }

  const { version, name } = yaml.load(JSON.parse(JSON_DATA).sources['Chart.yaml']) as { version: string, name: string };

  await Promise.all([
    serverFileTemporary(JSON_DATA, 12094),
    serverFileTemporary({ chartName: name, chartVersion: version }, 12095)
  ]);
}

run();
