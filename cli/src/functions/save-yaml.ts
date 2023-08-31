import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import yaml from 'js-yaml'
import { join } from "path";

export function saveTemplatedYamlToFiles(tmpDir: string, helmTemplate: string): void {
  const dataFileJSON = { templated: {} };
  const files = helmTemplate.split('---');

  for(const file of files) {
    const jsonFile = yaml.load(file) as any;
    if (jsonFile) {
      const key = jsonFile.kind + "_" + jsonFile?.metadata?.name.replaceAll('-', "_");
      writeFileSync(`${tmpDir}/templated/${key}.yaml`, file);

      if(!dataFileJSON["templated"][jsonFile.kind]) {
        dataFileJSON["templated"][jsonFile.kind] = {}
      }
      dataFileJSON["templated"][jsonFile.kind][jsonFile?.metadata?.name.replaceAll('-', "_")] = file;
    }
  }

  writeFileSync(`${tmpDir}/global-data.json`, JSON.stringify(dataFileJSON, null, 2))
}

export function saveSourcesYamlToFiles(path: string, tmpDir: string, prefix = false): void {
  const dataFileJSON = JSON.parse(readFileSync(`${tmpDir}/global-data.json`, 'utf-8'));
  if (!dataFileJSON["sources"]) {
    dataFileJSON["sources"] = {}
  }

  const files = readdirSync(path);

  for(const file of files.filter(name => !name.includes("tgz"))) {
    const fileFullPath = join(path, file);

    if (!statSync(fileFullPath).isDirectory()) {
      const fileContent = readFileSync(fileFullPath);
      let destinationPath = `${tmpDir}/sources/${file}`
      if (prefix) {
        mkdirSync(`${tmpDir}/sources/${path.split('/').at(-1)}`, { recursive: true });
        destinationPath = `${tmpDir}/sources/${path.split('/').at(-1)}/${file}` 
      }
      writeFileSync(destinationPath, fileContent);

      if (!prefix) {
        dataFileJSON["sources"][file] = String(fileContent);
      } else {
        if (!dataFileJSON["sources"][path.split('/').at(-1)]) {
          dataFileJSON["sources"][path.split('/').at(-1)] = {};
        }

        dataFileJSON["sources"][path.split('/').at(-1)][file] = String(fileContent);
        writeFileSync(`${tmpDir}/global-data.json`, JSON.stringify(dataFileJSON, null, 2))
      }
    } else {
      writeFileSync(`${tmpDir}/global-data.json`, JSON.stringify(dataFileJSON, null, 2))
      saveSourcesYamlToFiles(fileFullPath, tmpDir, true);
    }
  }
}
