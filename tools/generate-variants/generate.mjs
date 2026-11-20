#!/usr/bin/env node
/**
 * Proof-of-concept asset variant generator.
 *
 * Reads the original base SVGs in ./bases and produces 10 variants of each:
 *   5 bases x 10 variants = 50 assets + 140px thumbnails + manifests.
 *
 * No third-party dependencies. Run:
 *   node tools/generate-variants/generate.mjs
 *   node tools/generate-variants/generate.mjs --check
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const BASES_DIR = path.join(HERE, 'bases');
const OUT_DIR = path.join(ROOT, 'public', 'assets');
const MANIFEST_DIR = path.join(OUT_DIR, 'manifest');

const BASES = [
  {
    id: 'lightbulb',
    file: 'lightbulb.svg',
    category: 'objects',
    tags: ['idea', 'lightbulb', 'thinking', 'innovation']
  },
  {
    id: 'person',
    file: 'person.svg',
    category: 'people',
    tags: ['person', 'teacher', 'presenter', 'human']
  },
  {
    id: 'chart',
    file: 'chart.svg',
    category: 'charts',
    tags: ['chart', 'graph', 'growth', 'data', 'analytics']
  },
  {
    id: 'laptop',
    file: 'laptop.svg',
    category: 'technology',
    tags: ['laptop', 'computer', 'work', 'online']
  },
  {
    id: 'cloud',
    file: 'cloud.svg',
    category: 'nature',
    tags: ['cloud', 'weather', 'rain', 'sky']
  }
];

const VARIANTS = [
  { key: 'outline-ink', styles: ['outline'], palette: 'ink', sw: 3, ink: '#1f2933', accent: '#1f2933', fill: 'none', rough: false },
  { key: 'outline-blue', styles: ['outline'], palette: 'blue', sw: 3, ink: '#1f2933', accent: '#2f80ed', fill: 'none', rough: false },
  { key: 'outline-green', styles: ['outline'], palette: 'green', sw: 3, ink: '#1f2933', accent: '#27ae60', fill: 'none', rough: false },
  { key: 'thin-ink', styles: ['thin'], palette: 'ink', sw: 2, ink: '#1f2933', accent: '#1f2933', fill: 'none', rough: false },
  { key: 'thin-blue', styles: ['thin'], palette: 'blue', sw: 2, ink: '#1f2933', accent: '#2f80ed', fill: 'none', rough: false },
  { key: 'bold-ink', styles: ['bold'], palette: 'ink', sw: 5, ink: '#1f2933', accent: '#1f2933', fill: 'none', rough: false },
  { key: 'bold-orange', styles: ['bold'], palette: 'orange', sw: 5, ink: '#1f2933', accent: '#f2994a', fill: 'none', rough: false },
  { key: 'rough-ink', styles: ['rough', 'hand-drawn'], palette: 'ink', sw: 3, ink: '#1f2933', accent: '#1f2933', fill: 'none', rough: true },
  { key: 'rough-blue', styles: ['rough', 'hand-drawn'], palette: 'blue', sw: 3, ink: '#1f2933', accent: '#2f80ed', fill: 'none', rough: true },
  { key: 'fill-accent', styles: ['filled'], palette: 'blue', sw: 3, ink: '#1f2933', accent: '#2f80ed', fill: '#56ccf2', rough: false }
];

const REQUIRED_TOKENS = ['{{INK}}', '{{ACCENT_STROKE}}', '{{ACCENT_FILL}}', '{{SW}}', '{{DEFS}}', '{{FILTER_ATTR}}'];

function renderTemplate(template, variant, seed) {
  const defs = variant.rough
    ? `<defs><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`
    : '';
  const filterAttr = variant.rough ? 'filter="url(#rough)"' : '';

  return template
    .replaceAll('{{INK}}', variant.ink)
    .replaceAll('{{ACCENT_STROKE}}', variant.accent)
    .replaceAll('{{ACCENT_FILL}}', variant.fill)
    .replaceAll('{{SW}}', String(variant.sw))
    .replaceAll('{{DEFS}}', defs)
    .replaceAll('{{FILTER_ATTR}}', filterAttr);
}

function makeThumbnail(svg) {
  return svg.replace('width="512" height="512"', 'width="140" height="140"');
}

function assetPath(category, id, thumb = false) {
  return thumb
    ? `/assets/${category}/thumbs/${id}-140.svg`
    : `/assets/${category}/${id}.svg`;
}

/** Map a public web path (/assets/...) to its file on disk (<root>/public/assets/...). */
function filePathFor(webPath) {
  return path.join(OUT_DIR, webPath.replace(/^\/+assets\//, ''));
}

function writeContactSheet(assets) {
  const cards = assets
    .map(asset => {
      const relative = asset.path.replace(/^\/assets\//, '');
      const tags = asset.tags.join(' · ');
      return `<figure><img src="${relative}" alt="${asset.id}" width="140" height="140"><figcaption><strong>${asset.id}</strong><br><small>${tags}</small></figcaption></figure>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Variant proof-of-concept — ${assets.length} assets</title>
<style>
  body { font: 14px system-ui, sans-serif; margin: 24px; color: #1f2933; }
  h1 { font-size: 20px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }
  figure { margin: 0; padding: 12px; border: 1px solid #e4e7eb; border-radius: 8px; text-align: center; }
  img { display: block; margin: 0 auto 8px; background: #fff; }
  figcaption { font-size: 12px; line-height: 1.35; }
  small { color: #6b7280; }
</style>
</head>
<body>
<h1>Variant proof-of-concept — ${assets.length} original SVG assets</h1>
<p>Open this file from <code>public/assets/contact-sheet.html</code>. All artwork is generated from the five original base drawings in <code>tools/generate-variants/bases/</code>.</p>
<div class="grid">
${cards}
</div>
</body>
</html>
`;

  fs.writeFileSync(path.join(OUT_DIR, 'contact-sheet.html'), html);
}

function generate() {
  fs.mkdirSync(MANIFEST_DIR, { recursive: true });
  const all = [];
  let written = 0;

  for (const base of BASES) {
    const templatePath = path.join(BASES_DIR, base.file);
    if (!fs.existsSync(templatePath)) throw new Error(`Missing base: ${templatePath}`);
    const template = fs.readFileSync(templatePath, 'utf8');
    for (const token of REQUIRED_TOKENS) {
      if (!template.includes(token)) throw new Error(`${base.file} is missing required token ${token}`);
    }

    const categoryAssets = [];

    VARIANTS.forEach((variant, index) => {
      const id = `${base.category}-${base.id}-${variant.key}`;
      const seed = (index + base.id.length) % 20;
      const svg = renderTemplate(template, variant, seed);
      if (svg.includes('{{')) throw new Error(`Unreplaced token in ${id}`);

      const rel = assetPath(base.category, id);
      const thumbRel = assetPath(base.category, id, true);
      fs.mkdirSync(path.dirname(filePathFor(rel)), { recursive: true });
      fs.mkdirSync(path.dirname(filePathFor(thumbRel)), { recursive: true });
      fs.writeFileSync(filePathFor(rel), svg);
      fs.writeFileSync(filePathFor(thumbRel), makeThumbnail(svg));
      written += 2;

      categoryAssets.push({
        id,
        path: rel,
        thumbnail: thumbRel,
        category: base.category,
        tags: [...base.tags, ...variant.styles, variant.palette],
        style: variant.styles,
        palette: [variant.palette],
        license: 'CC0-1.0',
        source: 'original-generator',
        attribution: '',
        approvedBy: null,
        status: 'pending-review',
        version: 1,
        aspect: '1:1',
        animatedStroke: true
      });
    });

    fs.writeFileSync(
      path.join(MANIFEST_DIR, `${base.category}.json`),
      `${JSON.stringify(categoryAssets, null, 2)}\n`
    );
    all.push(...categoryAssets);
  }

  fs.writeFileSync(path.join(MANIFEST_DIR, 'all.json'), `${JSON.stringify(all, null, 2)}\n`);
  writeContactSheet(all);

  console.log(`Generated ${all.length} SVG assets and ${all.length} thumbnails (${written} files).`);
  console.log(`Manifests: ${MANIFEST_DIR}`);
  console.log(`Contact sheet: ${path.join(OUT_DIR, 'contact-sheet.html')}`);
}

function check() {
  const problems = [];
  for (const base of BASES) {
    const templatePath = path.join(BASES_DIR, base.file);
    if (!fs.existsSync(templatePath)) {
      problems.push(`missing base: ${base.file}`);
      continue;
    }
    const template = fs.readFileSync(templatePath, 'utf8');
    for (const token of REQUIRED_TOKENS) {
      if (!template.includes(token)) problems.push(`${base.file} missing ${token}`);
    }
  }

  const manifestPath = path.join(MANIFEST_DIR, 'all.json');
  if (!fs.existsSync(manifestPath)) {
    problems.push('missing manifest/all.json — run generate first');
  } else {
    const assets = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (assets.length !== BASES.length * VARIANTS.length) {
      problems.push(`expected ${BASES.length * VARIANTS.length} assets, found ${assets.length}`);
    }
    const ids = new Set();
    for (const asset of assets) {
      if (ids.has(asset.id)) problems.push(`duplicate id: ${asset.id}`);
      ids.add(asset.id);
      for (const key of ['path', 'thumbnail']) {
        const file = filePathFor(asset[key]);
        if (!fs.existsSync(file)) problems.push(`missing file for ${asset.id}: ${asset[key]}`);
        else if (fs.readFileSync(file, 'utf8').includes('{{')) problems.push(`unreplaced token in ${asset[key]}`);
      }
    }
  }

  if (problems.length) {
    console.error(`Check FAILED (${problems.length} problems):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Check OK: ${BASES.length} bases, ${BASES.length * VARIANTS.length} generated assets, all referenced files present.`);
}

if (process.argv.includes('--check')) check();
else generate();
