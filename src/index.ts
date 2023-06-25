import { isChartFolder } from './functions/is-chart-folder';
import { $ } from 'execa'
import { saveSourcesYamlToFiles, saveTemplatedYamlToFiles } from './functions/save-yaml';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import open from 'open';
import { randomUUID } from 'crypto';
import chalk from 'chalk';
import { tmpdir } from 'os';

async function run() {
  const currentPath = process.argv?.at(2) ?? process.cwd();
  const values = process.argv?.at(3) ?? undefined;

  console.log(chalk.cyanBright(`⚡️ Path detected ${currentPath}`));
  console.log(
    values
      ? chalk.greenBright(`🔑 Values detected ${values}`)
      : chalk.redBright(`❌ No value detected, computing with default values in the Chart`)
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
  const JSON = readFileSync(`${tmpDir}/global-data.json`, 'utf-8');
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
    `${tmpDir}/index-${id}.html`,
    file,
  );

  open(`${tmpDir}/index-${id}.html`);
};

run();
