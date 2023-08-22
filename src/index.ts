import { isChartFolder } from './functions/is-chart-folder';
import { $ } from 'execa'
import { saveSourcesYamlToFiles, saveTemplatedYamlToFiles } from './functions/save-yaml';
import { mkdirSync, readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { serverFileTemporary } from './functions/serve-file-temporary';
import open from 'open'

async function run() {
  const currentPath = process.argv?.at(2) ?? process.cwd();
  const values = process.argv?.at(3) ?? undefined;

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
  
  const id = randomUUID()
  if (process.env.NODE_ENV === "development") {
    open(`http://localhost:3000?id=${id}`)
  } else {
    open(`https://helm-viewer.vercel.app?id=${id}`)
  }

  await serverFileTemporary(JSON_DATA, 12094);

  process.exit(0)
};

run();
