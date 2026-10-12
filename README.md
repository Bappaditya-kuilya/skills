<div align="center">

# /awwwards

**An agent skill that builds award-caliber websites from one line.**

[![Node 20+](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Claude Code](https://img.shields.io/badge/Claude_Code-supported-d97757)](https://claude.com/claude-code)
[![Codex](https://img.shields.io/badge/Codex-supported-000000)](https://github.com/openai/codex)
[![Last commit](https://img.shields.io/github/last-commit/juliobsz/skills)](https://github.com/juliobsz/skills/commits/main)
[![Stars](https://img.shields.io/github/stars/juliobsz/skills?style=flat)](https://github.com/juliobsz/skills/stargazers)

[Demo](#demo) · [Install](#install) · [Usage](#usage) · [How it works](#how-it-works) · [Contributing](#contributing)

</div>

```
> make me a portfolio, my name is Julio
```

That's the whole brief. The agent works as creative director, designer and creative developer
in one, then hands back a site it has already checked in a real browser.

## Demo

https://github.com/user-attachments/assets/0ac28c25-9796-4bce-8fa6-4dcc6df55b8b

## Why

Ask an agent for "a portfolio" and you get the same site everyone gets: purple gradient, three
cards, "elevate your brand". This skill replaces that default with a process.

- **A concept that belongs to you.** Three ideas from different territories (your name, your
  craft, your place), scored on originality and fit.
- **A real design system.** Palette by role, curated free fonts, grid and motion language,
  written to `DESIGN.md` and tested against a "genericness check".
- **Motion with intent.** GSAP, Lenis and WebGL (OGL) where they earn their place, with one
  signature moment and everything else quiet.
- **Real copy.** No lorem ipsum, fake awards or invented metrics. Anything made up is marked
  as a placeholder and listed at the end.
- **Verified, not assumed.** A production build, a crawling audit and real-browser screenshots
  on desktop, mobile and reduced motion, scored against a rubric until every category hits 8/10.

Its quality bar is the work that wins [Awwwards](https://www.awwwards.com) Site of the Day. The
site doesn't need to be submitted anywhere; it just has to be that good.

## Quick start

```bash
npx github:juliobsz/skills
```

Open a **new** agent session, then type `/awwwards` or just ask for a website.

## Install

One command installs the skill into every agent folder you already have
(`~/.claude`, `~/.codex`, `~/.agents`). If none exist, it falls back to Claude Code.

| Command | Result |
|---|---|
| `npx github:juliobsz/skills` | Install into every detected agent |
| `npx github:juliobsz/skills awwwards` | Install a single skill by name |
| `npx github:juliobsz/skills --claude` | Claude Code only (`~/.claude/skills`) |
| `npx github:juliobsz/skills --codex` | Codex only (`~/.codex/skills`) |
| `npx github:juliobsz/skills --agents` | Shared agent folder (`~/.agents/skills`) |
| `npx github:juliobsz/skills --project` | This project only (`./.claude/skills`) |
| `npx github:juliobsz/skills --dir <path>` | Any skills folder |
| `npx github:juliobsz/skills --list` | List available skills |
| `npx github:juliobsz/skills --uninstall` | Remove it |
| `npx github:juliobsz/skills --help` | Show all options |

Flags combine, for example `npx github:juliobsz/skills awwwards --claude --codex`.
Run the install command again to update. Requires Node 20+.

<details>
<summary>Manual install</summary>

Copy the `awwwards/` folder into your agent's skills directory, for example
`~/.claude/skills/awwwards`. Any agent that reads `SKILL.md` skills can use it.
</details>

<details>
<summary>Troubleshooting</summary>

- **`/awwwards` isn't found.** Start a new session; agents read their skills folder at startup.
  Then check that `awwwards/SKILL.md` exists in the folder the installer printed.
- **Installed into the wrong agent.** Name the target explicitly with `--claude`, `--codex`,
  `--agents` or `--dir <path>`.
- **Old version after updating.** Re-run the install command. It overwrites the installed copy.
</details>

## Usage

Ask in one line and let the agent decide. It writes its assumptions down instead of running a
questionnaire.

```
make me a portfolio, my name is Ana
a site for my architecture studio in Lisbon, we do small houses
launch page for a mechanical keyboard called Kestrel, it should feel insane
redesign this landing page so it could win site of the day
```

## How it works

| Phase | What happens |
|---|---|
| **Brief** | Infers who it's for, the audience and the site's job. Missing facts become written assumptions |
| **Concept** | Three concepts from different territories (your name, your craft's materials, your place, how you work, a formal system), scored on originality and fit. The winner becomes a one-line idea with a signature moment |
| **Art direction** | Palette by role, type pairing from a curated free-font library, grid, rhythm and motion language, all written to `DESIGN.md`. Then a "genericness test" kills anything an average model would have produced |
| **Build** | Semantic HTML that looks finished with motion off. Then reveals, page transitions, a loader that tracks real loading, and the signature moment |
| **QA loop** | Production build, a crawling audit (SEO, metadata, accessibility, weight, placeholder copy, AI-copy tells) and real-browser screenshots on desktop, mobile, reduced motion and mid-transition. The agent reads every frame, scores itself against the rubric and fixes things until every category hits 8/10 |
| **Ship** | OG image, favicon, sitemap, robots, then deploy to Vercel, Netlify or Cloudflare (only after you confirm) |

### Stack

- **Next.js** (App Router) by default, and for anything with app features.
- **Astro** for content-only showcases where motion is the product: about 75 KB of JS against
  about 250 KB.
- **Your stack** when you run it inside an existing project.

All three use [GSAP](https://gsap.com) (every plugin is free now), [Lenis](https://lenis.dev)
for smooth scroll and [OGL](https://github.com/oframe/ogl) for WebGL. The motion engine is
framework-agnostic TypeScript, shipped as documented code instead of a template: it runs on
one clock, reverts every effect on navigation, runs transitions in parallel with the next page
loading, and keeps content visible without JavaScript or with reduced motion.

### Principles it won't break

- One idea, one signature moment, everything else quiet.
- Every frame works as a still poster before any motion is added.
- The native cursor stays. Reduced motion gets a complete, calm site. Phones get a composed
  layout, not a shrunken one.
- No fake awards, logos or metrics. No lorem ipsum. No em dashes or "elevate your brand" copy.
- No purple gradients, glassmorphism or three-card grids unless the concept truly calls for
  them.

## Standalone scripts

The helpers in `awwwards/scripts/` work on any site, so you can use them on their own:

```bash
node ~/.claude/skills/awwwards/scripts/audit.mjs https://your-site.com/
node ~/.claude/skills/awwwards/scripts/shoot.mjs https://your-site.com/ --nav
```

| Script | Does |
|---|---|
| `audit.mjs` | Crawl a build: SEO, a11y, weight, placeholders, AI-copy tells |
| `shoot.mjs` | Playwright screenshots, FPS, overflow, tap targets, transitions |
| `og.mjs` | Render the OG image from the live hero |
| `font.mjs` | Self-host Fontshare / Google fonts (CSS or `next/font` output) |
| `photos.mjs` | Contact sheets of free photos for marked placeholders |
| `serve.mjs` | Static server for build output |

<details>
<summary>Repository layout</summary>

```
awwwards/
  SKILL.md            the workflow and the hard rules
  references/
    quality-bar.md    scoring weights, real winner scores, self-score rubric
    concepts.md       finding an idea that can't be moved to someone else
    art-direction.md  patterns from recent winners, archetypes, AI defaults to avoid
    typography.md     curated free fonts with sources, scales, setting display type
    layout.md         grids, section families, heroes, mobile composition
    motion.md         choreography and recipes (loader handoff, iris, shared element, index preview…)
    webgl.md          DOM-synced image planes, fullscreen shaders, performance rules
    patterns.md       proven structures from test builds (driver module, sticky stage…)
    content.md        voice, honest placeholders, case-study structure
    quality.md        accessibility, performance budgets, bugs found in real builds
    engine.md         framework-agnostic motion engine
    nextjs.md         Next.js adapter, layout, metadata, fonts
    astro.md          Astro adapter and layout
    ship.md           final checks and deploy
  scripts/            zero-dependency Node helpers
bin/install.mjs       the npx installer
```
</details>

## Security

A skill is instructions your agent follows, and this one has it run builds and scripts on your
machine. Read `awwwards/SKILL.md` before installing, as you would any code you run. Nothing is
deployed without your confirmation.

## Contributing

Issues and pull requests are welcome, especially for bugs found in real builds and new
patterns in `awwwards/references/`.

1. Fork the repo and create a branch.
2. Make the change. A skill is a folder with a `SKILL.md`; the installer discovers any
   top-level folder that has one, so a new skill needs no registration.
3. Test it: `node bin/install.mjs --dir ./tmp-skills`, then run the skill in an agent.
4. Open a pull request describing what changed and what you built to check it.

## Support

Found a bug or have an idea? [Open an issue](https://github.com/juliobsz/skills/issues).
