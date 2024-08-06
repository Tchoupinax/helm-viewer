import { randomUUID } from "crypto";
import { $ } from "execa";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import yaml from "js-yaml";
import { join } from "path";
import { tmpdir } from "os";
import chalk from "chalk";

export async function computeChart(
  currentPath: string,
  releaseName: string,
  valuesPathArray: Array<string> = [],
) {
  let stdout;
  try {
    stdout = await computeCommands(releaseName, valuesPathArray, currentPath);
  } catch (err: any) {
    if (err?.stderr.includes("You may need to run `helm dependency build`")) {
      console.log(
        chalk.greenBright(
          `⬇️ Trying to refresh helm dependencies. Might be long...`,
        ),
      );
      const $$ = $({ cwd: currentPath });
      await $$`helm dependency build`;
      stdout = await computeCommands(releaseName, valuesPathArray, currentPath);
    }
  }

  const { templated } = await computeTemplated(stdout);
  const { sources } = await computeSources(stdout, currentPath);

  const { version, name } = yaml.load(sources["Chart.yaml"]) as {
    version: string;
    name: string;
  };

  return {
    name,
    version,
    templated,
    sources,
  };
}

export async function computeTemplated(
  chartInYaml: string,
): Promise<{ templated: {} }> {
  const dataFileJSON = { templated: {} };
  const files = chartInYaml.split("---");

  for (const file of files) {
    const jsonFile = yaml.load(file) as any;
    if (jsonFile) {
      if (!dataFileJSON["templated"][jsonFile.kind]) {
        dataFileJSON["templated"][jsonFile.kind] = {};
      }
      dataFileJSON["templated"][jsonFile.kind][jsonFile?.metadata?.name] = file;
    }
  }

  return dataFileJSON;
}

async function computeCommands(
  releaseName: string,
  valuesPathArray: Array<string> = [],
  currentPath: string,
) {
  let stdout;
  if (valuesPathArray.length === 0) {
    ({ stdout } =
      await $`helm template --name-template ${releaseName} ${currentPath}`);
  } else if (valuesPathArray.length === 1) {
    ({ stdout } =
      await $`helm template --name-template ${releaseName} ${currentPath} --values ${valuesPathArray.at(0)}`);
  } else if (valuesPathArray.length === 2) {
    ({ stdout } =
      await $`helm template --name-template ${releaseName} ${currentPath} --values ${valuesPathArray.at(0)} --values ${valuesPathArray.at(1)}`);
  }

  return stdout;
}

export async function computeSources(
  chartInYaml: string,
  currentPath: string,
): Promise<{ sources: {} }> {
  const tmpDir = `${tmpdir()}/${randomUUID()}`;
  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(`${tmpDir}/sources`, { recursive: true });
  mkdirSync(`${tmpDir}/templated`, { recursive: true });

  const dataFileJSON = { sources: {} };
  const yamlFiles = chartInYaml.split("---");

  for (const file of yamlFiles) {
    const jsonFile = yaml.load(file) as any;
    if (jsonFile) {
      const key = jsonFile.kind + "-" + jsonFile?.metadata?.name;
      writeFileSync(`${tmpDir}/templated/${key}.yaml`, file);
    }
  }

  const files = readdirSync(currentPath);

  for (const file of files.filter((name) => !name.includes("tgz"))) {
    const fileFullPath = join(currentPath, file);

    if (!statSync(fileFullPath).isDirectory()) {
      const fileContent = readFileSync(fileFullPath);
      dataFileJSON["sources"][file] = String(fileContent);
    }
  }

  return dataFileJSON;
}
