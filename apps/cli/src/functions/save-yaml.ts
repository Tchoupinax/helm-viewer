import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import yaml from "js-yaml";
import { join } from "path";

import { type ChartSources, type ChartTemplated } from "./compute-chart";

type K8sResource = {
  kind?: string;
  metadata?: {
    name?: string;
  };
};

type GlobalData = {
  sources?: Record<string, string | Record<string, string>>;
  templated: ChartTemplated;
};

export function saveTemplatedYamlToFiles(
  tmpDir: string,
  helmTemplate: string,
): void {
  const dataFileJSON: GlobalData = { templated: {} };
  const files = helmTemplate.split("---");

  for (const file of files) {
    const jsonFile = yaml.load(file) as K8sResource | undefined;
    if (jsonFile?.kind && jsonFile.metadata?.name) {
      const key = `${jsonFile.kind}-${jsonFile.metadata.name}`;
      writeFileSync(`${tmpDir}/templated/${key}.yaml`, file);

      if (!dataFileJSON.templated[jsonFile.kind]) {
        dataFileJSON.templated[jsonFile.kind] = {};
      }
      dataFileJSON.templated[jsonFile.kind][jsonFile.metadata.name] = file;
    }
  }

  writeFileSync(
    `${tmpDir}/global-data.json`,
    JSON.stringify(dataFileJSON, null, 2),
  );
}

export function saveSourcesYamlToFiles(
  path: string,
  tmpDir: string,
  prefix = false,
): void {
  const dataFileJSON = JSON.parse(
    readFileSync(`${tmpDir}/global-data.json`, "utf-8"),
  ) as GlobalData;
  if (!dataFileJSON.sources) {
    dataFileJSON.sources = {};
  }

  const sources: ChartSources | Record<string, string | Record<string, string>> =
    dataFileJSON.sources;
  const files = readdirSync(path);

  for (const file of files.filter(name => !name.includes("tgz"))) {
    const fileFullPath = join(path, file);

    if (!statSync(fileFullPath).isDirectory()) {
      const fileContent = readFileSync(fileFullPath);
      let destinationPath = `${tmpDir}/sources/${file}`;

      const lastParts = path.split("/");
      const lastPart = lastParts[lastParts.length - 1] ?? "";

      if (prefix) {
        mkdirSync(`${tmpDir}/sources/${lastPart}`, {
          recursive: true,
        });
        destinationPath = `${tmpDir}/sources/${lastPart}/${file}`;
      }
      writeFileSync(destinationPath, fileContent);

      if (!prefix) {
        sources[file] = String(fileContent);
      } else {
        const folder = sources[lastPart];
        if (!folder || typeof folder === "string") {
          sources[lastPart] = {};
        }

        const nested = sources[lastPart];
        if (nested && typeof nested !== "string") {
          nested[file] = String(fileContent);
        }
        writeFileSync(
          `${tmpDir}/global-data.json`,
          JSON.stringify(dataFileJSON, null, 2),
        );
      }
    } else {
      writeFileSync(
        `${tmpDir}/global-data.json`,
        JSON.stringify(dataFileJSON, null, 2),
      );
      saveSourcesYamlToFiles(fileFullPath, tmpDir, true);
    }
  }
}
