import chalk from "chalk";
import { randomUUID } from "crypto";
import { $, execaCommandSync } from "execa";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import yaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";

export async function computeChart(
  currentPath: string,
  releaseName: string,
  valuesPathArray: Array<string> = [],
) {
  // eslint-disable-next-line prefer-const
  let { stdout, error } = await computeCommands(
    releaseName,
    valuesPathArray,
    currentPath,
  );
  if (error) {
    if (error.includes("You may need to run `helm dependency build`")) {
      console.log(
        chalk.greenBright(
          `⬇️ Trying to refresh helm dependencies. Might be long...`,
        ),
      );
      const $$ = $({ cwd: currentPath });
      await $$`helm dependency build`;
      ({ stdout } = await computeCommands(
        releaseName,
        valuesPathArray,
        currentPath,
      ));
    }

    throw new Error(error);
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
): Promise<{ templated: any }> {
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
type Result = {
  stdout?: string;
  error?: string;
};
async function computeCommands(
  releaseName: string,
  valuesPathArray: Array<string> = [],
  currentPath: string,
): Promise<Result> {
  // https://github.com/helm/helm/issues/3553
  const namespace = "--namespace fake-namespace-ded";

  let stdout;
  if (valuesPathArray.length === 0) {
    try {
      ({ stdout } = execaCommandSync(
        `helm template ${namespace} --name-template ${releaseName} ${currentPath}`,
      ));
    } catch (err) {
      return { error: (err as any).stderr as string };
    }
  } else if (valuesPathArray.length === 1) {
    try {
      ({ stdout } = execaCommandSync(
        `helm template ${namespace} --name-template ${releaseName} ${currentPath}`,
      ));
    } catch (err) {
      return { error: (err as any).stderr as string };
    }
  } else if (valuesPathArray.length === 2) {
    try {
      ({ stdout } = execaCommandSync(
        `helm template ${namespace} --name-template ${releaseName} ${currentPath} --values ${valuesPathArray[0]} --values ${valuesPathArray[1]}`,
      ));
    } catch (err) {
      return { error: (err as any).stderr as string };
    }
  }
  return { stdout };
}

export async function computeSources(
  chartInYaml: string,
  currentPath: string,
): Promise<{ sources: any }> {
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
