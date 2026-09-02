import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAW_DIR = join(dirname(fileURLToPath(import.meta.url)), 'raw');

const src = readFileSync(join(RAW_DIR, 'bsn_data.js'), 'utf8');

// bsn_data.js declares three top-level consts; run it in a bare Function scope and read them back
const sandbox: Record<string, unknown> = {};
new Function('window', `${src}\nwindow._ENC=_ENC; window._SL=_SL; window.CAREER_DATA=CAREER_DATA;`)(sandbox);

const outputs: Array<[string, string]> = [
  ['_ENC', 'enc.json'],
  ['_SL', 'season-logs.json'],
  ['CAREER_DATA', 'careers.json'],
];

for (const [key, file] of outputs) {
  if (sandbox[key] === undefined) throw new Error(`bsn_data.js did not define ${key}`);
  writeFileSync(join(RAW_DIR, file), JSON.stringify(sandbox[key]));
  console.log(`wrote raw/${file}`);
}
