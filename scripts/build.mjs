import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const cache = join(root, '.build');
const dataDir = join(root, 'data');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

const profile = JSON.parse(await readFile(join(dataDir, 'profile.json'), 'utf8'));
const publications = JSON.parse(await readFile(join(dataDir, 'publications.json'), 'utf8'));
assert(profile && typeof profile === 'object' && !Array.isArray(profile), 'Profile must be an object');
assert(Array.isArray(publications), 'Publications must be a list');

const ids = new Set();
for (const paper of publications) {
  for (const key of ['id', 'year', 'type', 'scope', 'title', 'authors', 'venue']) {
    assert(String(paper[key] ?? '').trim(), `Missing ${key} in ${paper.id ?? 'publication'}`);
  }
  assert(!ids.has(paper.id), `Duplicate publication ID: ${paper.id}`);
  ids.add(paper.id);
  assert(['journal', 'conference'].includes(paper.type), `Invalid type in ${paper.id}`);
  assert(['international', 'korean'].includes(paper.scope), `Invalid scope in ${paper.id}`);
  assert(!paper.doi || /^10\.\d{4,9}\/\S+$/.test(paper.doi), `Invalid DOI in ${paper.id}`);
  assert(!paper.url || paper.url.startsWith('https://'), `Paper URL must use HTTPS in ${paper.id}`);
}
for (const item of profile.news || []) {
  assert(/^\d{4}-(0[1-9]|1[0-2])$/.test(item.date), `Invalid News date: ${item.date}`);
  assert(String(item.text ?? '').trim(), `Missing News text in ${item.date}`);
  assert(!item.paper_id || ids.has(item.paper_id), `Unknown News paper ID: ${item.paper_id}`);
}

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets'), { recursive: true });
await mkdir(cache, { recursive: true });
await Promise.all([
  copyFile(join(root, 'assets', 'site.css'), join(dist, 'assets', 'site.css')),
  copyFile(join(root, 'assets', 'favicon.svg'), join(dist, 'assets', 'favicon.svg')),
]);

await build({
  entryPoints: [join(root, 'src', 'client.jsx')],
  outfile: join(dist, 'assets', 'app.js'),
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'esm',
  jsx: 'automatic',
  target: 'es2020',
});
await build({
  entryPoints: [join(root, 'src', 'App.jsx')],
  outfile: join(cache, 'App.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  target: 'node22',
});

const { default: App } = await import(`${pathToFileURL(join(cache, 'App.mjs')).href}?v=${Date.now()}`);
const shell = await readFile(join(root, 'src', 'shell.html'), 'utf8');
const pages = {
  index: {
    title: 'SoYeop Yoo — Postdoctoral Researcher at AIST',
    description: 'SoYeop Yoo is a postdoctoral researcher at the Intelligent Platforms Research Institute, AIST, in Tokyo, Japan.',
  },
  publications: {
    title: 'Publications — SoYeop Yoo',
    description: 'Journal and conference publications by SoYeop Yoo.',
  },
  cv: {
    title: 'CV — SoYeop Yoo',
    description: 'Research experience, education, projects, teaching, and awards of SoYeop Yoo.',
  },
};

for (const [page, meta] of Object.entries(pages)) {
  const markup = renderToString(React.createElement(App, { page }));
  const html = shell
    .replace('__TITLE__', escapeHtml(meta.title))
    .replace('__DESCRIPTION__', escapeHtml(meta.description))
    .replace('__PAGE__', page)
    .replace('__MARKUP__', markup);
  assert(!/__([A-Z_]+)__/.test(html), `Unfilled template field in ${page}`);
  await writeFile(join(dist, `${page}.html`), html);
}

console.log(`Built ${publications.length} publications and 3 pages in ${dist}`);
