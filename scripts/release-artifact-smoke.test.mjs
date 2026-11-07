import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const read = (path) => readFileSync(join(dist, path), 'utf8');

test('production build contains the app shell and a bundled JavaScript entry', () => {
  assert.ok(existsSync(join(dist, 'index.html')), 'dist/index.html is missing');
  const html = read('index.html');
  assert.match(html, /<div id="root"><\/div>/);
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((match) => match[1]);
  assert.ok(scripts.length > 0, 'no production JavaScript bundle is referenced');
  for (const url of scripts) {
    const relative = url.replace(/^\/sad-saga-galaxy\//, '').replace(/^\//, '');
    assert.ok(existsSync(join(dist, relative)), `missing production script: ${url}`);
  }
});

test('manifest and all declared app icons are present in the production artifact', () => {
  const manifestPath = join(dist, 'manifest.webmanifest');
  assert.ok(existsSync(manifestPath), 'manifest.webmanifest is missing');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.start_url, '/sad-saga-galaxy/');
  assert.equal(manifest.scope, '/sad-saga-galaxy/');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 3);
  for (const icon of manifest.icons) {
    const relative = icon.src.replace(/^\.\//, '');
    assert.ok(existsSync(join(dist, relative)), `missing manifest icon: ${icon.src}`);
  }
});

test('service worker uses the current release cache namespace', () => {
  assert.ok(existsSync(join(dist, 'sw.js')), 'service worker is missing from dist');
  assert.match(read('sw.js'), /CACHE_PREFIX = 'oooo-app-shell-'[\s\S]*CACHE_NAME = `\$\{CACHE_PREFIX\}v59`/);
});
