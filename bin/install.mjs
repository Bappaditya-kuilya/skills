#!/usr/bin/env node
// Install the skills in this repo into agent skill folders.
//   npx github:juliobsz/skills                 install every skill into detected agents
//   npx github:juliobsz/skills awwwards        install one skill
//   options: --claude --codex --agents         pick targets (default: every agent folder that exists)
//            --project                         install into ./.claude/skills of the current directory
//            --dir <path>                      install into a custom skills folder
//            --anatomy / --no-anatomy          add the /anatomy companion skill without asking / skip it
//            --uninstall  --list  --help
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : undefined; };
const ANATOMY = 'wheresryan22/anatomy';
const c = (n, s) => (process.stdout.isTTY ? `\x1b[${n}m${s}\x1b[0m` : s);

const skills = fs.readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'SKILL.md')))
  .map((d) => d.name);
const describe = (name) => {
  const md = fs.readFileSync(path.join(root, name, 'SKILL.md'), 'utf8');
  return (md.match(/^description:\s*(.+)$/m)?.[1] || '').split('. ')[0];
};

if (has('help') || has('h')) {
  console.log(`Usage: npx github:juliobsz/skills [skill...] [options]

Targets (default: every agent folder that already exists, else Claude Code):
  --claude      ~/.claude/skills   (Claude Code)
  --codex       ~/.codex/skills    (Codex CLI)
  --agents      ~/.agents/skills   (shared agent folder)
  --project     ./.claude/skills   (this project only)
  --dir <path>  any skills folder

Companion:
  --anatomy     also install /anatomy (isometric explainer figures, github.com/${ANATOMY})
  --no-anatomy  skip it without asking (default when not run in a terminal)

  --list        show available skills
  --uninstall   remove instead of install`);
  process.exit(0);
}
if (has('list')) {
  for (const s of skills) console.log(`${c(1, s)}  ${describe(s)}`);
  process.exit(0);
}

const wanted = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--dir');
if (wanted.includes('anatomy')) { console.error(`anatomy is a companion skill: use --anatomy to install it.`); process.exit(1); }
const unknown = wanted.filter((w) => !skills.includes(w));
if (unknown.length) { console.error(`Unknown skill: ${unknown.join(', ')}. Available: ${skills.join(', ')}`); process.exit(1); }
const selected = wanted.length ? wanted : skills;

const home = os.homedir();
const agents = { claude: path.join(home, '.claude'), codex: path.join(home, '.codex'), agents: path.join(home, '.agents') };
let targets = [];
if (opt('dir')) targets.push(path.resolve(opt('dir')));
if (has('project')) targets.push(path.resolve('.claude', 'skills'));
for (const [k, dir] of Object.entries(agents)) if (has(k)) targets.push(path.join(dir, 'skills'));
if (!targets.length) {
  targets = Object.values(agents).filter((d) => fs.existsSync(d)).map((d) => path.join(d, 'skills'));
  if (!targets.length) targets = [path.join(agents.claude, 'skills')];
}

const skip = new Set(['node_modules', '.git', 'dist', '.next', '.astro']);
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const s = path.join(from, e.name), d = path.join(to, e.name);
    if (e.isDirectory()) copy(s, d); else if (e.isFile()) fs.copyFileSync(s, d);
  }
}

const tilde = (p) => (p.startsWith(home) ? `~${p.slice(home.length)}` : p);
for (const dir of targets) {
  for (const s of selected) {
    const dest = path.join(dir, s);
    fs.rmSync(dest, { recursive: true, force: true });
    if (has('uninstall')) { console.log(`${c(31, '−')} ${s}  ${c(2, tilde(dest))}`); continue; }
    copy(path.join(root, s), dest);
    console.log(`${c(32, '✓')} ${s}  ${c(2, tilde(dest))}`);
  }
}

// /anatomy companion: fetched from its own repository so it stays current and credited.
if (has('uninstall')) {
  if (has('anatomy')) for (const dir of targets) {
    fs.rmSync(path.join(dir, 'anatomy'), { recursive: true, force: true });
    console.log(`${c(31, '−')} anatomy  ${c(2, tilde(path.join(dir, 'anatomy')))}`);
  }
  process.exit(0);
}
if (selected.includes('awwwards') && !has('no-anatomy')) {
  const want = has('anatomy') || await checkbox(
    'Also install /anatomy?',
    `isometric explainer figures for "how it works" sections, by ${ANATOMY}`,
  );
  if (want) installAnatomy();
}
console.log(`\nDone. Start a new agent session and run ${c(1, `/${selected[0]}`)} or just ask for a website.`);

// One checkbox, checked by default. Space or x toggles, y/n set it, Enter confirms.
async function checkbox(question, detail) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;
  const readline = await import('node:readline');
  let on = true;
  const draw = (first) => {
    if (!first) process.stdout.write('\x1b[2A');
    process.stdout.write(`\r\x1b[2K${c(36, '?')} ${c(1, question)} ${c(2, 'space to toggle, enter to confirm')}\n`);
    process.stdout.write(`\r\x1b[2K  ${on ? c(32, '[x]') : '[ ]'} anatomy  ${c(2, detail)}\n`);
  };
  console.log();
  draw(true);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve) => {
    const done = (value) => {
      process.stdin.off('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      resolve(value);
    };
    const onKey = (str, key = {}) => {
      if (key.ctrl && key.name === 'c') { process.stdin.setRawMode(false); process.stdout.write('\n'); process.exit(130); }
      if (key.name === 'return' || key.name === 'enter') return done(on);
      if (key.name === 'space' || str === 'x') on = !on;
      else if (str === 'y') on = true;
      else if (str === 'n') on = false;
      else return;
      draw(false);
    };
    process.stdin.on('keypress', onKey);
  });
}

function installAnatomy() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'anatomy-'));
  const src = path.join(tmp, 'anatomy');
  try {
    try {
      execFileSync('git', ['clone', '--depth', '1', '--quiet', `https://github.com/${ANATOMY}.git`, src], { stdio: 'ignore' });
    } catch {
      // No git: download the tarball and unpack it with tar (built into Windows 10+, macOS and Linux).
      const tgz = path.join(tmp, 'anatomy.tgz');
      execFileSync('curl', ['-fsSL', '-o', tgz, `https://codeload.github.com/${ANATOMY}/tar.gz/HEAD`], { stdio: 'ignore' });
      fs.mkdirSync(src);
      execFileSync('tar', ['-xzf', tgz, '-C', src, '--strip-components=1'], { stdio: 'ignore' });
    }
    if (!fs.existsSync(path.join(src, 'SKILL.md'))) throw new Error('no SKILL.md in download');
    for (const dir of targets) {
      const dest = path.join(dir, 'anatomy');
      fs.rmSync(dest, { recursive: true, force: true });
      copy(src, dest);
      console.log(`${c(32, '✓')} anatomy  ${c(2, tilde(dest))}  ${c(2, `by ${ANATOMY}`)}`);
    }
  } catch (err) {
    console.log(`${c(33, '!')} Could not install anatomy (${err.message.split('\n')[0]}). Install it later with: npx skills add ${ANATOMY}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
