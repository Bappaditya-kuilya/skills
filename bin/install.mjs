#!/usr/bin/env node
// Install the skills in this repo into agent skill folders.
//   npx github:juliobsz/skills                 install every skill into detected agents
//   npx github:juliobsz/skills awwwards        install one skill
//   options: --claude --codex --agents         pick targets (default: every agent folder that exists)
//            --project                         install into ./.claude/skills of the current directory
//            --dir <path>                      install into a custom skills folder
//            --uninstall  --list  --help
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : undefined; };
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

  --list        show available skills
  --uninstall   remove instead of install`);
  process.exit(0);
}
if (has('list')) {
  for (const s of skills) console.log(`${c(1, s)}  ${describe(s)}`);
  process.exit(0);
}

const wanted = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--dir');
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
if (!has('uninstall')) console.log(`\nDone. Start a new agent session and run ${c(1, `/${selected[0]}`)} or just ask for a website.`);
