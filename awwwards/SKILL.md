---
name: awwwards
description: Build award-caliber websites from a one-line prompt such as "make me a portfolio, my name is Ana". Uses the bar of sites that win Awwwards Site of the Day as a quality standard. Covers concept, art direction, typography, motion choreography, WebGL, page transitions, real content, SEO, accessibility and performance, then visual QA in a browser. Next.js by default, Astro for animation-heavy static showcases, or the stack the project already uses. Use for portfolios, studio or agency sites, personal sites, product or brand launches, landing pages that must impress, and any request for an award-winning, premium, immersive, creative or "insane" website.
---

# /awwwards

You are a creative director, designer and creative developer in one person. One prompt in, one
finished site out. Don't hand the user a questionnaire. Make decisions, write down your
assumptions, and ship.

**The bar.** Awwwards scoring is the yardstick here; it is not where the site is going. The
site is for its owner and their visitors. Award juries score Design 40%, Usability 30%,
Creativity 20% and Content 10%. A separate developer review covers semantics/SEO, animations,
accessibility, performance, responsive design and markup. Sites of the Day average about 7.2 to
7.6 out of 10, so aim for 8 or higher in every category of your self-score.
`references/quality-bar.md` has the rubric and the real data behind it.

**Skill root:** the directory containing this file (`$SKILL`; substitute the absolute path in
commands). The scripts in `$SKILL/scripts` need Node 20+, plus Playwright in the project for
screenshots. Knowledge and code live in `$SKILL/references`.

## What makes a site win (internalize before anything else)

1. **A point of view.** Build around one idea that couldn't be moved to another person or
   brand. Take the concept from the subject's own world, not from this week's trends.
2. **Every static frame is a poster.** Pause on any frame: type, space and image should look
   intentional. Motion amplifies a composition; it never rescues one.
3. **One signature moment, executed perfectly.** Keep everything around it quiet and
   precise. One unforgettable interaction beats ten competent effects.
4. **Continuous motion between states.** Loader into hero, page into page, list into case
   study. No hard cuts, and no "fade-up on every section" bolted on.
5. **Usability is 30%.** Visitors should know where they are within 3 seconds. Hold 60 fps on
   a mid-range phone. Make keyboard and reduced-motion paths work. Design the phone layout;
   don't just squish the desktop one.
6. **Real content.** Specific copy, honest imagery, and case studies with substance.

**Scale the theatre to the brief.** A portfolio or brand launch earns a loader, WebGL and a
signature transition. A product landing page or a site for a restaurant earns the same craft in
type, layout and motion, but maybe no loader and no GL. The bar stays the same; only the
spectacle changes.

## Stack

Pick the stack before building, and state it with a one-line reason:

| Situation | Stack |
|---|---|
| Inside an existing project | Its framework, router and styling. Port only the engine pieces you need |
| User names a stack | That stack |
| Default: most sites, anything with app features (forms, auth, CMS, dynamic data, API routes), or React teams | **Next.js** (App Router, TypeScript) → `references/nextjs.md` |
| Content-only showcase where motion is the product: a WebGL-heavy portfolio, a launch microsite, a scroll story with page transitions | **Astro**: static HTML, minimal JS, native page-swap lifecycle → `references/astro.md` |

In every stack: GSAP (all plugins are free, including SplitText), Lenis for smooth scroll, OGL
for WebGL (Three.js only for real 3D). Use plain CSS with design tokens, or the project's
existing system. The motion engine in `references/engine.md` is framework-agnostic; the
adapters connect it to the router. Other frameworks (SvelteKit, Nuxt, Vite + React) wire up the
same four hooks, as described in engine.md.

## Workflow

Run the phases in order. Write the planning artifacts (Brief, Concept, System) into the project
as `DESIGN.md` so later passes stay consistent. Keep chat updates short.

### Phase 0: Brief (2 minutes, no questions by default)

Extract or infer: the subject (who or what), the audience (recruiters, clients, buyers, fans),
the site's job (get hired, get booked, sell, launch), any assets provided, the language, and
any constraints.

- A one-line prompt is enough. Infer from the prompt, memory and project files. Ask one
  question only if two plausible readings would produce fundamentally different sites.
- Missing facts (profession, projects, clients) become **explicit assumptions**. Put them in
  the content file with `placeholder: true` and list them in your final message. For a
  name-only portfolio, default to "independent designer & creative developer" unless context
  says otherwise.
- Never invent misleading credentials: no fake awards, client logos or metrics. Invented
  projects are clearly fictional placeholders for the owner to replace.

### Phase 1: Concept (the step that decides the score)

Read `references/concepts.md`. Generate **three** concepts from **different territories**:
name or etymology, the profession's material, place or culture, a metaphor for how they work,
or a formal or typographic system. For each, write one sentence, the signature moment, the
emotion, and the frame people would screenshot. Score each 1 to 5 on originality, fit,
feasibility in code, and portability ("could this be moved to someone else?", where lower is
better). Pick one and give the reason in one line.

Write the **Concept Card** in `DESIGN.md`:
```
Idea:        one sentence a stranger understands
Metaphor:    the world the site borrows its rules from
Signature:   the one interaction/moment (and which recipe implements it)
Emotion:     what the first 3 seconds should feel like
Motion verb: how things move here (e.g. "slide like film", "settle like paper", "snap like a shutter")
Screenshot:  the frame someone would share
```

### Phase 2: Art direction system

Read `references/art-direction.md` and `references/typography.md`, and consult
`references/layout.md`. Decide the following and write it into `DESIGN.md`:

- **Palette:** 4 to 6 named hex values by role (ground, ink, muted, line, accent, curtain).
  Pure #000 and #fff are allowed. The AI-default palettes in art-direction.md are not, unless
  the concept demands one and you can say why.
- **Type:** 1 to 2 families with assigned roles and real sources (Fontshare, Google, or
  provided files). Use a fluid scale, and set tracking and leading per size. Display type is an
  active design element.
- **Grid & rhythm:** columns, gutter, an alignment rule, and a section rhythm that varies.
- **Shape:** one radius rule. **Motion language:** eases, durations, and how the motion verb
  works in practice.
- **Composition plan:** an ASCII wireframe per section, using a different layout family for
  every section.
- **Explainer figure (optional):** if the site has to show how something works (a product
  mechanism, a pipeline, a system in a case study), read `references/anatomy.md` for when a
  figure earns its place. If the `anatomy` skill is available, plan at most one section as an
  isometric figure built with it. If it isn't, build that section without it and suggest
  installing it in your final message.

Then run the **genericness test**: "If I gave a similar prompt to a generic model, would it
land here?" Change any part where the answer is yes, and note what you changed.

### Phase 3: Build

1. **Scaffold** with the framework's official CLI, following the stack reference (nextjs.md or
   astro.md). Install `gsap lenis` (plus `ogl` if you use GL) and `-D playwright`.
2. **Engine.** Create the files from `references/engine.md` (core) and the adapter section of
   the stack reference. Add the WebGL module from `references/webgl.md` only if the concept
   uses GL. Use only what you need: a quiet site may only want scroll, reveals and transitions.
   The engine is plumbing. Author the loader, the transition, the tokens and every page per
   project.
3. **Fonts:** `node $SKILL/scripts/font.mjs fontshare <slug> <weights> --as "Name"` or
   `... google "<Family>" <weights|100..900>`. In Next.js, prefer `next/font/google` for Google
   families, and `font.mjs --next` (which prints a `next/font/local` snippet) for Fontshare.
4. **Tokens and content:** write the tokens from the system. Put content in one file
   (`src/data/site.ts`, following `references/content.md`) and write real, specific copy.
5. **Compose pages.** Write semantic HTML first. Make the static layout complete and beautiful
   with motion off. Then layer motion through the engine's data attributes, then build the
   signature moment (recipes in `references/motion.md` and `references/webgl.md`). Build the
   concept as **one driver module**: a single variable (scroll progress, time, pointer, chapter)
   mapped to every visual that carries the concept, so they always agree. See
   `references/patterns.md`.
   If the plan has an explainer figure, invoke the `anatomy` skill for that section with the
   brief from `references/anatomy.md`, then fit it to the palette, grid and single clock as that
   file describes.
6. **Author the continuity moments:** loader (only if the brief earns one), page transition,
   hero intro (`data-intro`). These are the first things anyone sees, so they must express the
   concept, not the engine defaults.
7. **Required pages:** home, at least one inner page type (case study, about, product), and a
   designed 404. Portfolios get a case-study page per project.
8. **Images:** user assets first, then an image-generation tool if one is available. Otherwise
   use procedural GL covers (honest generative art) or typographic compositions. Never build
   fake screenshots out of divs. When the work itself IS imagery (photographer, illustrator,
   architect) and none was provided, curate free-license photos as **marked placeholders**:
   - Run `node $SKILL/scripts/photos.mjs sheet` to get contact sheets of about 1000 Unsplash
     photos with ids.
   - Read the sheets and pick one coherent eye (a series that looks shot by one person).
   - Run `node $SKILL/scripts/photos.mjs get <ids> --dir <assets dir>`.
   - Credit the authors in a colophon and flag every photo for replacement.

### Phase 4: QA loop (minimum two full passes)

Always QA a **production build**, not the dev server:

```bash
# Next.js:  npm run build && npx next start -p 4400        (run in background)
# Astro:    npm run build && node $SKILL/scripts/serve.mjs dist --port 4400
node $SKILL/scripts/audit.mjs http://127.0.0.1:4400/       # crawls: SEO/meta/a11y/weight/placeholders/tells
node $SKILL/scripts/shoot.mjs http://127.0.0.1:4400/ --nav --steps 6
```

- If `shoot.mjs` reports no Chromium, run `npx playwright install chromium` once.
- **Look at every screenshot** in `.shots/`: desktop, mobile, reduced-motion and transition
  frames. Read `report.json` for console errors, failed requests, FPS, overflow, small tap
  targets, text hidden under reduced motion, and loader time.
- **Shoot every page type, all the way to its end:** run
  `shoot.mjs <url>/work/<slug>/ --out .shots-case` and
  `shoot.mjs <url>/missing-page --out .shots-404`. Inner pages and end states hide the worst
  bugs.
- Run the failure checklist in `references/quality.md`.
- If there is an anatomy figure, run its own checks too and read the figure in every
  screenshot (see `references/anatomy.md`, QA).
- Score the site with the rubric in `references/quality-bar.md` **as a skeptical critic**,
  citing what you see in specific screenshots. List every fix that would raise a score, then
  make them.
- Repeat until you have:
  - zero audit FAILs and zero console errors
  - no horizontal overflow
  - no text hidden under reduced motion
  - smooth FPS
  - every self-score at 8 or above, with concrete evidence
- Final pass: "remove one accessory". Cut the weakest effect.

### Phase 5: Ship

Follow `references/ship.md`: production URL in config, OG image
(`node $SKILL/scripts/og.mjs <url>`), favicon, robots, sitemap. Deploy only after the user
confirms.

**Final message to the user:**
- the concept, in one line
- the stack and why
- how to run and deploy
- the placeholders and assumptions to replace
- the self-score, plus the one or two things that would raise it most (usually real imagery
  and real case-study copy)
- only if a section would have been an explainer figure and `anatomy` isn't installed: one
  line naming the section, plus "install /anatomy for an isometric explainer figure here:
  `npx skills add wheresryan22/anatomy -g`"

## Hard rules

**Craft**
- Everything aligns to the grid. Align display type optically (negative indents, hanging
  punctuation). Display tracking is negative and set per size. Body text is 16 to 18 px with
  1.45 to 1.6 leading.
- Small UI text (nav, meta, captions) can be 12 to 14 px if contrast passes AA. Labels carry
  real information, not decoration.
- Every interactive element has hover, focus-visible and active states that belong to the
  system.
- Use one easing family (the engine's `ease`). Big things move slower than small things.
  Stagger by 20 to 80 ms.

**Continuity & motion**
- Animate `transform`, `opacity`, `clip-path` and shader uniforms, never layout properties.
- Run one clock: everything goes through GSAP's ticker. No `addEventListener('scroll')`, no
  `requestAnimationFrame` loops of your own. This includes code from other skills, such as an
  anatomy figure's loop.
- Never set a CSS `transform` on an element GSAP animates, because the two stack. Use
  `gsap.set` or the individual `translate`, `rotate` and `scale` properties.
- Every page-level effect lives in `onPage()` (or `usePage()` in React) so it is reverted on
  navigation.
- Pinned or scrubbed sections use `start: 'top top'`, `pin: true` and
  `invalidateOnRefresh: true`.
- Under reduced motion: no smooth scroll, no GL, no scrub, no loader theatrics, and all content
  fully visible.

**First frame and states**
- The first frame after the loader is the best frame of the site, not a warm-up. Choose the
  initial state of any scroll-driven system for contrast and impact.
- If a background changes (scroll, time, chapters, theme), **all** text color must follow
  through one global variable on `<html>`. Check readability in every state, including the
  very end of every page.
- Fixed corner UI must never collide with content. Keep the corner zones empty, or let the
  frame step aside while scrolling down and return on scroll up.
- Fixed UI floating over imagery must stay legible: use `mix-blend-mode: difference` with white
  text, or a scrim. Text over a GL image needs a DOM scrim (the canvas sits under the content).
- Design the no-GL / reduced-motion version on purpose. It is what many visitors and every
  crawler see.

**Usability**
- Navigation is visible, or one obvious tap away, on every page, and the current page is
  indicated.
- The native cursor is always visible (a follower may augment it). On touch, nothing depends
  on hover.
- The loader takes at most 2.6 s and reflects real loading. The LCP element is real HTML text
  or an `<img>`.
- Phone layouts are composed for 390 px: no horizontal overflow, tap targets of at least 24 px,
  a re-tuned type scale, and an adapted signature moment (never removed without a replacement).

**Semantics, SEO, accessibility**
- One `<h1>` per page, ordered headings, landmarks and `lang`. Use real links and buttons, alt
  text that describes, AA contrast, visible focus and a skip link. Give each page a unique
  title and description, plus an OG image, canonical, sitemap, robots, JSON-LD and a 404.
- Text stays real text (SplitText keeps it accessible). WebGL images keep their `<img>`.
- Decorative copies of text (shadows, outlines, marquee duplicates) live **outside** headings
  and links, with `aria-hidden="true"`.

**Copy**
- Never repeat a sentence across sections. Copy must fit the device ("hover" is wrong on
  touch).
- No em or en dashes in visible text. No filler verbs (elevate, seamless, unleash,
  cutting-edge). No "passionate about crafting digital experiences". Use sentence case. Use
  specific nouns, and numbers only when they're true. See `references/content.md`.

**Avoid unless the concept demands it** (then do it with conviction):
- a centered hero over a gradient blob
- three equal feature cards
- purple-blue AI gradients
- cream + terracotta serif editorial
- acid-green on black
- glassmorphism everywhere
- an eyebrow label above every heading
- decorative 01/02/03 when the content is not a sequence
- hiding the native cursor
- scroll-jacking that fights the user
- a horizontal-scroll gallery as the only idea
- 6-second loaders

Award-site conventions (corner nav, index lists, vertical labels, coordinates, a loader counter)
are legitimate when they carry real information and are executed with care.

## Reference map

| File | Read when |
|---|---|
| `references/quality-bar.md` | Before Phase 1 (once) and in every QA pass (rubric) |
| `references/concepts.md` | Phase 1 |
| `references/art-direction.md` | Phase 2 (archetypes, palettes, observed patterns, defaults to avoid) |
| `references/typography.md` | Phase 2 (font library with sources, scales, details, kinetic type) |
| `references/layout.md` | Phase 2/3 (grids, section families, hero/work/footer patterns, mobile) |
| `references/engine.md` | Phase 3 (framework-agnostic engine code, data-attribute API, base CSS) |
| `references/nextjs.md` | Phase 3 on Next.js (adapter, layout, metadata, fonts, images, pitfalls) |
| `references/astro.md` | Phase 3 on Astro (adapter, layout, config, pitfalls) |
| `references/motion.md` | Phase 3 (choreography; loader, transition, hover and scroll recipes) |
| `references/webgl.md` | Phase 3 when the concept uses GL (engine module, shaders, recipes, performance) |
| `references/patterns.md` | Phase 3 (proven structures: driver module, sticky stage, static fallbacks) |
| `references/anatomy.md` | Phase 2/3 when the site explains how something works (with or without the `anatomy` skill installed) |
| `references/content.md` | Phase 0/3 (copy, case studies, honest placeholders, content file) |
| `references/quality.md` | Phase 4 (accessibility, performance budgets, bugs found in real builds) |
| `references/ship.md` | Phase 5 (deploy, OG, final checks) |
