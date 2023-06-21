import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import yaml from 'js-yaml'
import { join } from 'path';

export function saveTemplatedYamlToFiles(helmTemplate: string): void {
  const dataFileJSON = { templated: {} };
  const files = helmTemplate.split('---');

  for(const file of files) {
    const jsonFile = yaml.load(file) as any;
    if (jsonFile) {
      const key = jsonFile.kind + "_" + jsonFile?.metadata?.name.replaceAll('-', "_");
      writeFileSync(`./tmp/templated/${key}.yaml`, file);

      if(!dataFileJSON["templated"][jsonFile.kind]) {
        dataFileJSON["templated"][jsonFile.kind] = {}
      }
      dataFileJSON["templated"][jsonFile.kind][jsonFile?.metadata?.name.replaceAll('-', "_")] = file;
    }
  }

  writeFileSync('tmp/global-data.json', JSON.stringify(dataFileJSON, null, 2))
}

export function saveSourcesYamlToFiles(path: string, prefix = false): void {
  const dataFileJSON = JSON.parse(readFileSync('tmp/global-data.json', 'utf-8'));
  if (!dataFileJSON["sources"]) {
    dataFileJSON["sources"] = {}
  }

  const files = readdirSync(path);

  for(const file of files.filter(name => !name.includes("tgz"))) {
    const fileFullPath = join(path, file);

    if (!statSync(fileFullPath).isDirectory()) {
      const fileContent = readFileSync(fileFullPath);
      let destinationPath = `./tmp/sources/${file}`
      if (prefix) {
        mkdirSync(`./tmp/sources/${path.split('/').at(-1)}`, { recursive: true });
        destinationPath = `./tmp/sources/${path.split('/').at(-1)}/${file}` 
      }
      writeFileSync(destinationPath, fileContent);

      if (!prefix) {
        dataFileJSON["sources"][file] = String(fileContent);
      } else {
        if (!dataFileJSON["sources"][path.split('/').at(-1)]) {
          dataFileJSON["sources"][path.split('/').at(-1)] = {};
        }

        dataFileJSON["sources"][path.split('/').at(-1)][file] = String(fileContent);
        writeFileSync('tmp/global-data.json', JSON.stringify(dataFileJSON, null, 2))
      }
    } else {
      writeFileSync('tmp/global-data.json', JSON.stringify(dataFileJSON, null, 2))
      saveSourcesYamlToFiles(fileFullPath, true);
    }
  }
}
