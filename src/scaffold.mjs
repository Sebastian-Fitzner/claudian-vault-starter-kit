#!/usr/bin/env node
/**
 * Claudian Vault Starter Kit — scaffolder.
 *
 * Personalizes the bundled `template-vault/` into a working Obsidian + Claudian vault.
 * Zero npm dependencies — Node 18+ built-ins only.
 *
 * Usage:
 *   node scaffold.mjs                 # interactive
 *   node scaffold.mjs --target ./my-vault
 *   node scaffold.mjs --defaults      # non-interactive, accept all defaults (for CI/testing)
 *   node scaffold.mjs --help
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(HERE, 'template-vault');
const MANIFEST_PATH = join(HERE, 'kit.manifest.json');

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
};
const paint = (col, s) => `${c[col]}${s}${c.reset}`;
const log = (s = '') => stdout.write(s + '\n');

// ---------- args ----------
const args = argv.slice(2);
const hasFlag = (f) => args.includes(f);
const getOpt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };

if (hasFlag('--help') || hasFlag('-h')) {
  log(`Claudian Vault Starter Kit scaffolder

  node scaffold.mjs [options]

  Interactive by default. Any flag below pre-fills its answer and skips that prompt,
  so passing all of them (or --defaults) makes the run fully headless.

  --target DIR        Where to create the vault (default: ./my-claudian-vault)
  --defaults          Accept every default answer (no prompts)

  Identity:
  --name NAME         Your name
  --role ROLE         Your role
  --email EMAIL       Git commit email
  --stack TEXT        One-line stack/focus
  --focus TEXT        Current domain focus
  --biz-lang LANG     Business/strategy language

  Integrations (use --no-NAME to force off):
  --atlassian | --no-atlassian      + --atlassian-url URL
  --github    | --no-github
  --codegraph | --no-codegraph
  --figma     | --no-figma          keep the Figma skills
  --git       | --no-git            git init + first commit

  --help              This message
`);
  exit(0);
}

const NON_INTERACTIVE = hasFlag('--defaults') || hasFlag('--yes');

// ---------- manifest ----------
if (!existsSync(TEMPLATE_DIR)) {
  log(paint('red', `✗ template-vault/ not found next to scaffold.mjs (looked in ${TEMPLATE_DIR}).`));
  log('  Run this from the unzipped kit folder.');
  exit(1);
}
const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
  : { features: {} };

// ---------- preflight ----------
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 18) {
  log(paint('red', `✗ Node 18+ required (found ${process.versions.node}).`));
  exit(1);
}

// ---------- prompts ----------
const rl = NON_INTERACTIVE ? null : createInterface({ input: stdin, output: stdout });

async function ask(question, def) {
  if (NON_INTERACTIVE) return def;
  const suffix = def ? paint('dim', ` (${def})`) : '';
  const a = (await rl.question(`${paint('cyan', '?')} ${question}${suffix} `)).trim();
  return a || def;
}
async function askYesNo(question, defYes) {
  const def = defYes ? 'Y/n' : 'y/N';
  if (NON_INTERACTIVE) return defYes;
  const a = (await rl.question(`${paint('cyan', '?')} ${question} ${paint('dim', `(${def})`)} `)).trim().toLowerCase();
  if (!a) return defYes;
  return a.startsWith('y');
}

// Flag-aware resolvers: a value passed on the CLI wins and skips the prompt entirely.
// This is what makes a fully headless run possible (CI, scripting) without piping into readline.
async function field(flag, question, def) {
  const v = getOpt(flag);
  if (v !== undefined) return v;
  return ask(question, def);
}
async function toggle(name, question, defYes) {
  if (hasFlag(`--${name}`)) return true;
  if (hasFlag(`--no-${name}`)) return false;
  return askYesNo(question, defYes);
}

// ---------- banner ----------
log('');
log(paint('bold', '  Claudian Vault Starter Kit'));
log(paint('dim', '  Personalize the vault skeleton. Press Enter to accept defaults.'));
log('');

// ---------- collect answers ----------
const targetDir = await field('--target', 'Where should the vault be created?', './my-claudian-vault');

const devName = await field('--name', 'Your name?', 'Your Name');
const devRole = await field('--role', 'Your role?', 'Software Engineer');
const devEmail = await field('--email', 'Git commit email?', 'you@example.com');
const devStack = await field('--stack', 'One line about your stack/focus?', 'Fullstack engineer.');
const domainFocus = await field('--focus', 'Your current domain focus?', 'building great software');
const businessLang = await field('--biz-lang', 'Business / strategy language?', 'English');

log('');
log(paint('bold', '  Optional integrations'));
const useAtlassian = await toggle('atlassian', 'Enable Atlassian (Jira/Confluence) integration?', false);
let atlassianUrl = 'https://your-org.atlassian.net/';
if (useAtlassian) atlassianUrl = await field('--atlassian-url', '  Atlassian cloud URL?', atlassianUrl);
const useGithub = await toggle('github', 'Enable GitHub MCP integration?', true);
const useCodegraph = await toggle('codegraph', 'Enable codegraph (code knowledge graph)?', false);
const useFigma = await toggle('figma', 'Keep the Figma skills (figma-bridge, design-in-figma)?', false);

log('');
const doGit = await toggle('git', 'Initialize a git repo and make the first commit?', true);

if (rl) rl.close();

const features = { atlassian: useAtlassian, github: useGithub, codegraph: useCodegraph, figma: useFigma };

const replacements = {
  DEV_NAME: devName,
  DEV_ROLE: devRole,
  DEV_EMAIL: devEmail,
  DEV_STACK: devStack,
  DOMAIN_FOCUS: domainFocus,
  BUSINESS_LANGUAGE: businessLang,
  ATLASSIAN_CLOUD_URL: atlassianUrl,
  DEV_GIT_AUTHOR: `${devName} <${devEmail}>`,
};

// ---------- helpers ----------
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function applyPlaceholders(text) {
  for (const [key, val] of Object.entries(replacements)) {
    text = text.replaceAll(`{{${key}}}`, val);
  }
  return text;
}

function applyFeatureMarkers(text) {
  for (const [name, enabled] of Object.entries(features)) {
    const open = `<!-- feature:${name} -->`;
    const close = `<!-- /feature:${name} -->`;
    if (!enabled) {
      const re = new RegExp(escapeRegex(open) + '[\\s\\S]*?' + escapeRegex(close) + '\\n?', 'g');
      text = text.replace(re, '');
    } else {
      text = text
        .split('\n')
        .filter((l) => l.trim() !== open && l.trim() !== close)
        .join('\n');
    }
  }
  return text;
}

const TEXT_EXT = new Set([
  '.md', '.tmpl', '.json', '.yaml', '.yml', '.txt', '.gitkeep', '.gitignore', '.js', '.mjs', '.csv',
]);
function isTextFile(p) {
  if (p.endsWith('.gitkeep') || p.endsWith('.gitignore')) return true;
  const dot = p.lastIndexOf('.');
  const ext = dot >= 0 ? p.slice(dot) : '';
  return TEXT_EXT.has(ext);
}

// skills disabled by a turned-off feature
const disabledSkills = new Set();
for (const [name, enabled] of Object.entries(features)) {
  if (!enabled) {
    const skills = manifest.features?.[name]?.skills || [];
    skills.forEach((s) => disabledSkills.add(s));
  }
}

// ---------- target dir guard ----------
const absTarget = join(process.cwd(), targetDir);
if (existsSync(absTarget) && readdirSync(absTarget).length > 0) {
  log(paint('red', `✗ Target ${targetDir} exists and is not empty. Choose an empty path.`));
  exit(1);
}
mkdirSync(absTarget, { recursive: true });

// ---------- walk + write ----------
let filesWritten = 0;
let skillsDropped = 0;

function walk(srcDir, relBase = '') {
  for (const entry of readdirSync(srcDir)) {
    if (entry === '.DS_Store') continue;
    const srcPath = join(srcDir, entry);
    const rel = relBase ? join(relBase, entry) : entry;
    const st = statSync(srcPath);

    // drop disabled skill directories wholesale
    const skillMatch = rel.match(/^skills\/([^/]+)/);
    if (skillMatch && disabledSkills.has(skillMatch[1])) {
      if (relBase === 'skills') skillsDropped++;
      continue;
    }

    if (st.isDirectory()) {
      walk(srcPath, rel);
      continue;
    }

    // file → compute destination, strip .tmpl
    let destRel = rel;
    if (destRel.endsWith('.tmpl')) destRel = destRel.slice(0, -'.tmpl'.length);
    const destPath = join(absTarget, destRel);
    mkdirSync(dirname(destPath), { recursive: true });

    if (isTextFile(srcPath)) {
      let text = readFileSync(srcPath, 'utf8');
      text = applyFeatureMarkers(text);
      text = applyPlaceholders(text);
      writeFileSync(destPath, text);
    } else {
      writeFileSync(destPath, readFileSync(srcPath));
    }
    filesWritten++;
  }
}

log('');
log(paint('dim', `  Writing vault into ${targetDir} ...`));
walk(TEMPLATE_DIR);

// ---------- git ----------
let gitDone = false;
if (doGit) {
  try {
    execSync('git init -q', { cwd: absTarget });
    execSync('git add -A', { cwd: absTarget });
    execSync(
      `git -c user.name=${JSON.stringify(devName)} -c user.email=${JSON.stringify(devEmail)} ` +
      `commit -q -m "chore: scaffold Claudian vault" --author=${JSON.stringify(replacements.DEV_GIT_AUTHOR)}`,
      { cwd: absTarget },
    );
    gitDone = true;
  } catch (e) {
    log(paint('yellow', `  ! git init/commit skipped: ${e.message.split('\n')[0]}`));
  }
}

// ---------- summary ----------
log('');
log(paint('green', '  ✓ Vault created.'));
log(`    ${paint('bold', 'Location:')}  ${targetDir}`);
log(`    ${paint('bold', 'Files:')}     ${filesWritten}`);
log(`    ${paint('bold', 'Identity:')}  ${devName} <${devEmail}>`);
const on = Object.entries(features).filter(([, v]) => v).map(([k]) => k);
const off = Object.entries(features).filter(([, v]) => !v).map(([k]) => k);
log(`    ${paint('bold', 'Enabled:')}   ${on.join(', ') || '(none)'}`);
log(`    ${paint('bold', 'Disabled:')}  ${off.join(', ') || '(none)'}`);
if (skillsDropped) log(`    ${paint('bold', 'Skills cut:')} ${skillsDropped} (from disabled features)`);
if (gitDone) log(`    ${paint('bold', 'Git:')}       initialized + first commit`);

log('');
log(paint('bold', '  Next steps:'));
log('    1. Open the folder as a vault in Obsidian.');
log('    2. Install plugins — see docs/plugins.md (Claudian + BRAT).');
const mcpBits = [useAtlassian && 'Atlassian', useGithub && 'GitHub', useCodegraph && 'codegraph']
  .filter(Boolean).join(', ');
if (mcpBits) log(`    3. Set up MCP servers (${mcpBits}) — see docs/mcp-setup.md.`);
log('    4. Fill in 00 Context/About Me.md, then read WALKTHROUGH.md.');
log('');
