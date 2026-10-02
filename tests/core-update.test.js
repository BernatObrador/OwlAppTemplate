import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initializeCore, updateCore } from '../scripts/core-update.mjs';

test('core updates preview, preserve app files, back up originals and block conflicts atomically', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'owl-core-'));
  const source = path.join(temp, 'source'), target = path.join(temp, 'app');
  const write = (base, file, text) => fs.writeFileSync(path.join(base, file), text);
  try {
    for (const base of [source, target]) {
      fs.mkdirSync(base);
      write(base, 'package.json', JSON.stringify({ dependencies: { owl: '1' } }));
      write(base, 'core.js', 'original');
    }
    write(source, 'core-files.json', JSON.stringify({ schema: 1, files: ['core.js'] }));
    write(target, 'routes.js', 'app-owned');
    initializeCore(target, source);
    write(source, 'core.js', 'updated');
    assert.deepEqual(updateCore({ target }).changes, ['core.js']);
    assert.equal(fs.readFileSync(path.join(target, 'core.js'), 'utf8'), 'original');
    const result = updateCore({ target, apply: true });
    assert.equal(result.applied, true);
    assert.equal(fs.readFileSync(path.join(result.backup, 'core.js'), 'utf8'), 'original');
    assert.equal(fs.readFileSync(path.join(target, 'routes.js'), 'utf8'), 'app-owned');
    assert.deepEqual(updateCore({ target }).changes, []);
    write(target, 'core.js', 'local customization');
    assert.deepEqual(updateCore({ target }).conflicts, []);
    write(source, 'core.js', 'next release');
    write(source, 'added.js', 'new file');
    write(source, 'core-files.json', JSON.stringify({ schema: 1, files: ['core.js', 'added.js'] }));
    const conflict = updateCore({ target, apply: true });
    assert.deepEqual(conflict.conflicts, ['core.js']);
    assert.equal(conflict.applied, false);
    assert.equal(fs.existsSync(path.join(target, 'added.js')), false);
    assert.equal(fs.readFileSync(path.join(target, 'core.js'), 'utf8'), 'local customization');
    fs.rmSync(path.join(target, '.owl-core.json'));
    assert.deepEqual(updateCore({ target, source, apply: true }).conflicts, ['core.js']);
    write(source, 'core-files.json', JSON.stringify({ schema: 1, files: ['../escape'] }));
    assert.throws(() => updateCore({ target, source, apply: true }), /Invalid core path/);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
