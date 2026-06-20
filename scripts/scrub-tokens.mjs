#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { argv, exit, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(repoRoot, 'scrub.manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const scrubMap = Object.entries(manifest.tokenScrub?.map ?? {});
const scanRoots = argv.slice(2);

if (scanRoots.length === 0) {
  stderr.write('Usage: node scripts/scrub-tokens.mjs <path> [...path]\n');
  exit(2);
}

if (scrubMap.length === 0) {
  stdout.write('scrub-tokens: nothing to scrub\n');
  exit(0);
}

let filesChanged = 0;

for (const scanRoot of scanRoots) {
  if (!existsSync(scanRoot)) {
    stderr.write(`scrub-tokens: path not found: ${scanRoot}\n`);
    exit(2);
  }

  for (const filePath of walk(scanRoot)) {
    const text = readTextFile(filePath);
    if (text === null) continue;

    let scrubbedText = text;
    for (const [needle, replacement] of scrubMap) {
      scrubbedText = scrubbedText.replaceAll(needle, replacement);
    }

    if (scrubbedText === text) continue;

    writeFileSync(filePath, scrubbedText);
    filesChanged++;
  }
}

stdout.write(`scrub-tokens: updated ${filesChanged} file${filesChanged === 1 ? '' : 's'}\n`);

function* walk(entryPath) {
  const stats = lstatSync(entryPath);

  if (stats.isSymbolicLink()) return;

  if (stats.isDirectory()) {
    for (const childName of readdirSync(entryPath)) {
      if (childName === '.DS_Store') continue;
      yield* walk(join(entryPath, childName));
    }
    return;
  }

  if (stats.isFile()) yield entryPath;
}

function readTextFile(filePath) {
  const buffer = readFileSync(filePath);
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  if (sample.includes(0)) return null;
  return buffer.toString('utf8');
}
