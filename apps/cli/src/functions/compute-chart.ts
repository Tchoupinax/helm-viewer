import chalk from "chalk";
import { randomUUID } from "crypto";
import { $, execaCommandSync, ExecaError } from "execa";
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

export type ChartSources = Record<string, string>;
export type ChartTemplated = Record<string, Record<string, string>>;
export type ChartPayload = {
  name: string;
  sources: ChartSources;
  templated: ChartTemplated;
  version: string;
};

type K8sResource = {
  kind?: string;
  metadata?: {
    name?: string;
  };
};

function helmErrorMessage(err: unknown): string {
  if (err instanceof ExecaError && typeof err.stderr === "string") {
    return err.stderr;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Unknown helm error";
}

export async function computeChart(
  currentPath: string,
  releaseName: string,
  valuesPathArray: Array<string> = [],
): Promise<ChartPayload> {
  // eslint-disable-next-line prefer-const
  let { stdout, error } = computeCommands(
    releaseName,
    valuesPathArray,
    currentPath,
  );
  if (error) {
    if (error.includes("You may need to run `helm dependency build`")) {
      console.log(
        chalk.greenBright(
          "⬇️ Trying to refresh helm dependencies. Might be long...",
        ),
      );
      const $$ = $({ cwd: currentPath });
      await $$`helm dependency build`;
      ({ stdout } = computeCommands(
        releaseName,
        valuesPathArray,
        currentPath,
      ));
    }

    throw new Error(error);
  }

  const { templated } = computeTemplated(stdout ?? "");
  const { sources } = computeSources(stdout ?? "", currentPath);

  const { version, name } = yaml.load(sources["Chart.yaml"] ?? "") as {
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

export function computeTemplated(
  chartInYaml: string,
): { templated: ChartTemplated } {
  const dataFileJSON: { templated: ChartTemplated } = { templated: {} };
  const files = chartInYaml.split("---");

  for (const file of files) {
    const jsonFile = yaml.load(file) as K8sResource | undefined;
    if (jsonFile?.kind && jsonFile.metadata?.name) {
      if (!dataFileJSON.templated[jsonFile.kind]) {
        dataFileJSON.templated[jsonFile.kind] = {};
      }
      dataFileJSON.templated[jsonFile.kind][jsonFile.metadata.name] = file;
    }
  }

  return dataFileJSON;
}
type Result = {
  stdout?: string;
  error?: string;
};
function computeCommands(
  releaseName: string,
  valuesPathArray: Array<string> = [],
  currentPath: string,
): Result {
  // https://github.com/helm/helm/issues/3553
  const namespace = "--namespace fake-namespace-ded";

  let stdout: string | undefined;
  if (valuesPathArray.length === 0) {
    try {
      ({ stdout } = execaCommandSync(
        `helm template ${namespace} --name-template ${releaseName} ${currentPath}`,
      ));
    } catch (err) {
      return { error: helmErrorMessage(err) };
    }
  } else if (valuesPathArray.length === 1) {
    try {
      ({ stdout } = execaCommandSync(
        `helm template ${namespace} --name-template ${releaseName} ${currentPath}`,
      ));
    } catch (err) {
      return { error: helmErrorMessage(err) };
    }
  } else if (valuesPathArray.length === 2) {
    try {
      ({ stdout } = execaCommandSync(
        `helm template ${namespace} --name-template ${releaseName} ${currentPath} --values ${valuesPathArray[0]} --values ${valuesPathArray[1]}`,
      ));
    } catch (err) {
      return { error: helmErrorMessage(err) };
    }
  }
  return { stdout };
}

export function computeSources(
  chartInYaml: string,
  currentPath: string,
): { sources: ChartSources } {
  const tmpDir = `${tmpdir()}/${randomUUID()}`;
  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(`${tmpDir}/sources`, { recursive: true });
  mkdirSync(`${tmpDir}/templated`, { recursive: true });

  const dataFileJSON: { sources: ChartSources } = { sources: {} };
  const yamlFiles = chartInYaml.split("---");

  for (const file of yamlFiles) {
    const jsonFile = yaml.load(file) as K8sResource | undefined;
    if (jsonFile?.kind && jsonFile.metadata?.name) {
      const key = `${jsonFile.kind}-${jsonFile.metadata.name}`;
      writeFileSync(`${tmpDir}/templated/${key}.yaml`, file);
    }
  }

  const files = readdirSync(currentPath);

  for (const file of files.filter(name => !name.includes("tgz"))) {
    const fileFullPath = join(currentPath, file);

    if (!statSync(fileFullPath).isDirectory()) {
      const fileContent = readFileSync(fileFullPath);
      dataFileJSON.sources[file] = String(fileContent);
    }
  }

  return dataFileJSON;
}
