import { isChartFolder } from './functions/is-chart-folder';
import { $ } from 'execa'
import { saveSourcesYamlToFiles, saveTemplatedYamlToFiles } from './functions/save-yaml';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import open from 'open';
import { randomUUID } from 'crypto';
import chalk from 'chalk';

async function run() {
  const currentPath = process.argv?.at(2) ?? process.cwd();
  console.log(chalk.bgCyanBright(`path detected ${currentPath}`));

  rmSync('tmp', { recursive: true, force: true });
  mkdirSync('tmp/templated', { recursive: true });
  mkdirSync('tmp/sources', { recursive: true });

  if(!isChartFolder(currentPath)) {
    console.log('Not a chart folder');
    process.exit(1);
  }

  // Template files and save them
  let stdout;
  try {
    ({ stdout } = await $`helm template ${currentPath}`);
  } catch (err) {
    console.log("\n")
    console.log(chalk.bgRedBright("The computation of the chart failed. (message below)"));
    console.log((err as Error).message);
    console.log("\n")
    process.exit(1)
  }
  
  saveTemplatedYamlToFiles(stdout)

  // Save sources files
  saveSourcesYamlToFiles(currentPath);

  // Create the script
  const JSON = readFileSync('tmp/global-data.json', 'utf-8');
  if (process.env.NODE_ENV === "development") {
    mkdirSync('src/assets', { recursive: true });
    writeFileSync('src/assets/global-data.js', `const DATA = ${JSON}`)
  }

  // Generate Production HTML
  let file = readFileSync(__dirname+'/index.html', 'utf-8');
  file = file
    .replace(
      '<script src="assets/global-data.js"></script>',
      `<script>const DATA = ${JSON};</script>`
    )

  const id = randomUUID();
  writeFileSync(
    `tmp/index-${id}.html`,
    file,
  )
  open(`tmp/index-${id}.html`);
};

run();
