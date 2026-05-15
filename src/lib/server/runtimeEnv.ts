import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

let cachedDotEnv: Record<string, string> | null = null;

const parseDotEnvLine = (line: string) => {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) return null;

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (!key) return null;

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value] as const;
};

const readDotEnv = () => {
  if (cachedDotEnv) return cachedDotEnv;

  const envPath = path.resolve(process.cwd(), '.env');
  const values: Record<string, string> = {};

  if (existsSync(envPath)) {
    const file = readFileSync(envPath, 'utf8');

    file.split(/\r?\n/).forEach((line) => {
      const entry = parseDotEnvLine(line);

      if (!entry) return;

      const [key, value] = entry;
      values[key] = value;
    });
  }

  cachedDotEnv = values;

  return cachedDotEnv;
};

export const getRuntimeEnv = (key: string) =>
  process.env[key] ?? readDotEnv()[key] ?? import.meta.env[key];
