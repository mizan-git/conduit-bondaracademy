import * as fs from 'fs';
import * as path from 'path';

export function readInputData<T = Record<string, unknown>>(filePath: string = 'custom-data/inputdata.json'): T {
  const fullPath = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
}
