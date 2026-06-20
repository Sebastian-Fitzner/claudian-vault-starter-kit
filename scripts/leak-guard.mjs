#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { argv, cwd, exit, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(repoRoot, 'scrub.manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const leakPattern = new RegExp(manifest.leakGuard.regex, 'g');
const scanRoots = argv.slice(2);

if (scanRoots.length === 0) {
  stderr.write('Usage: node scripts/leak-guard.mjs <path> [...path]\n');
  exit(2);
}

let leakCount = 0;

for (const scanRoot of scanRoots) {
  if (!existsSync(scanRoot)) {
    stderr.write(`leak-guard: path not found: ${scanRoot}\n`);
    exit(2);
  }

  for (const filePath of walk(scanRoot)) {
    const text = readTextFile(filePath);
    if (text === null) continue;

    leakPattern.lastIndex = 0;
    for (const match of text.matchAll(leakPattern)) {
      leakCount++;
      const location = getLocation(text, match.index ?? 0);
      const displayPath = relative(cwd(), filePath) || filePath;
      stderr.write(`${displayPath}:${location.line}:${location.column} matched "${match[0]}"\n`);
    }
  }
}

if (leakCount > 0) {
  stderr.write(`leak-guard: found ${leakCount} personal-data match${leakCount === 1 ? '' : 'es'}.\n`);
  exit(1);
}

stdout.write('leak-guard: clean\n');

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

function getLocation(text, index) {
  const prefix = text.slice(0, index);
  const lines = prefix.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}
