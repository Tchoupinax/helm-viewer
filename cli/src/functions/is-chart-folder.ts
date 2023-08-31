import fs from 'node:fs';

export function isChartFolder(
  path: string
): boolean {
  const files = fs.readdirSync(path);
  return files.includes('Chart.yaml')
}
