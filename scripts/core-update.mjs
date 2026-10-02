import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const stateFile = '.owl-core.json';
const json = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const digest = (file) => fs.existsSync(file) ? hash(fs.readFileSync(file)) : null;
function safeFile(base, entry) {
  if (typeof entry !== 'string' || !entry || entry.includes('\\') || entry.includes(':') || entry.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('Invalid core path: ' + entry);
  let file = base;
  for (const part of entry.split('/')) {
    file = path.join(file, part);
    if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw new Error('Symlink unsupported: ' + file);
  }
  return file;
}
export function snapshotCore(source) {
  const manifest = json(path.join(source, 'core-files.json'));
  if (manifest.schema !== 1 || !Array.isArray(manifest.files) || new Set(manifest.files).size !== manifest.files.length) throw new Error('Invalid core manifest');
  const files = Object.fromEntries(manifest.files.map(entry => {
    const value = digest(safeFile(source, entry));
    if (!value) throw new Error('Missing source file: ' + entry);
    return [entry, value];
  }));
  return { schema: 1, revision: hash(JSON.stringify(files)), files };
}
export function initializeCore(target, source) {
  fs.writeFileSync(path.join(target, stateFile), JSON.stringify({ ...snapshotCore(source), source: path.relative(target, source).split(path.sep).join('/') }, null, 2) + '\n');
}
/** @param {{ target?: string, source?: string, apply?: boolean }} options */
export function updateCore({ target = root, source, apply = false } = {}) {
  target = fs.realpathSync(target);
  const statePath = safeFile(target, stateFile);
  const previous = fs.existsSync(statePath) ? json(statePath) : { schema: 1, files: {} };
  if (previous.schema !== 1 || !previous.files || typeof previous.files !== 'object') throw new Error('Invalid installed core state');
  if (!source && !previous.source) throw new Error('Specify --from <template-directory> for the first update.');
  source = fs.realpathSync(source ? path.resolve(source) : path.resolve(target, previous.source));
  if (source === target) throw new Error('Source and target must be different projects');
  const next = snapshotCore(source);
  const conflicts = [], changes = [];
  const dependencies = json(path.join(target, 'package.json')).dependencies || {};
  for (const [name, version] of Object.entries(json(path.join(source, 'package.json')).dependencies || {})) {
    if (dependencies[name] !== version) conflicts.push('Align dependency and lockfile first: ' + name + '@' + version);
  }
  for (const [entry, incoming] of Object.entries(next.files)) {
    const local = digest(safeFile(target, entry));
    if (local === incoming) continue;
    if (incoming === previous.files[entry]) continue;
    if ((previous.files[entry] && local === previous.files[entry]) || (!previous.files[entry] && local === null)) changes.push(entry);
    else conflicts.push(entry);
  }
  for (const entry of Object.keys(previous.files)) {
    if (!(entry in next.files)) conflicts.push('Removed upstream; migrate manually and remove state entry: ' + entry);
  }
  const result = { revision: next.revision, changes, conflicts, applied: false };
  if (!apply || conflicts.length) return result;
  safeFile(target, '.owl-core-backups');
  const backup = path.join(target, '.owl-core-backups', randomUUID());
  fs.mkdirSync(backup, { recursive: true });
  const originals = new Map();
  for (const entry of [...changes, stateFile]) {
    const file = safeFile(target, entry);
    const bytes = fs.existsSync(file) ? fs.readFileSync(file) : null;
    originals.set(entry, bytes);
    if (bytes !== null) {
      const copy = path.join(backup, entry);
      fs.mkdirSync(path.dirname(copy), { recursive: true });
      fs.writeFileSync(copy, bytes);
    }
  }
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ changes, created: [...originals].filter(([, bytes]) => bytes === null).map(([entry]) => entry) }, null, 2));
  try {
    for (const entry of changes) {
      const bytes = fs.readFileSync(safeFile(source, entry));
      if (hash(bytes) !== next.files[entry]) throw new Error('Source changed during update: ' + entry);
      const file = safeFile(target, entry);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, bytes);
    }
    fs.writeFileSync(statePath, JSON.stringify({ ...next, source: path.relative(target, source).split(path.sep).join('/') }, null, 2) + '\n');
  } catch (error) {
    for (const [entry, bytes] of originals) {
      const file = safeFile(target, entry);
      if (bytes === null) fs.rmSync(file, { force: true });
      else fs.writeFileSync(file, bytes);
    }
    throw error;
  }
  return { ...result, applied: true, backup };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2), options = {};
    while (args.length) {
      const flag = args.shift();
      if (flag === '--apply') options.apply = true;
      else if (['--from', '--target'].includes(flag) && args[0] && !args[0].startsWith('--')) options[flag === '--from' ? 'source' : 'target'] = args.shift();
      else throw new Error('Usage: npm run core:update -- [--from path] [--target path] [--apply]');
    }
    const result = updateCore(options);
    console.log(JSON.stringify(result, null, 2));
    if (result.conflicts.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
