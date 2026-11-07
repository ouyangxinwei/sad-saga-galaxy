import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const baseUrl = process.env.PAGES_URL || 'https://ouyangxinwei.github.io/sad-saga-galaxy/';
const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

async function fetchOk(url, label) {
  const response = await fetch(url, { redirect: 'follow' });
  assert.equal(response.status, 200, `${label} returned HTTP ${response.status}: ${url}`);
  return response;
}

const pageResponse = await fetchOk(base, 'Pages entry');
const html = await pageResponse.text();
assert.match(html, /<div id="root"><\/div>/, 'app root element is missing');
const scriptUrls = [...html.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((match) => new URL(match[1], base).toString());
assert.ok(scriptUrls.length > 0, 'production JavaScript entry is missing');
for (const url of scriptUrls) await fetchOk(url, 'JavaScript bundle');

const manifestResponse = await fetchOk(new URL('manifest.webmanifest', base), 'PWA manifest');
const manifest = await manifestResponse.json();
assert.equal(manifest.start_url, new URL(base).pathname);
assert.equal(manifest.scope, new URL(base).pathname);
for (const icon of manifest.icons || []) await fetchOk(new URL(icon.src, new URL('manifest.webmanifest', base)).toString(), 'PWA icon');

const swResponse = await fetchOk(new URL('sw.js', base), 'Service Worker');
const sw = await swResponse.text();
assert.match(sw, /CACHE_NAME = `\$\{CACHE_PREFIX\}v60`/, 'Service Worker cache version is not v60');

const chrome = process.env.CHROME_BIN || 'google-chrome';
const dom = execFileSync(chrome, [
  '--headless',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--disable-background-timer-throttling',
  '--virtual-time-budget=15000',
  '--dump-dom',
  base,
], { encoding: 'utf8', timeout: 90000, maxBuffer: 20 * 1024 * 1024 });
const rootMatch = dom.match(/<div id="root">([\s\S]*?)<\/div>/);
assert.ok(rootMatch && rootMatch[1].trim().length > 0, 'Chromium loaded the page but React did not render into #root');
console.log(`Browser smoke passed: ${base}; manifest, ${scriptUrls.length} JS entry, icons, Service Worker v60, and hydrated React root verified.`);
