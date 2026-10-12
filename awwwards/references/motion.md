# Motion: choreography and recipes

## Principles

- **Motion verb.** The concept defines one verb ("slide and lock", "settle like paper",
  "compile"). Every animation is a variation of it: same ease family, related durations.
- **Choreography, not decoration.** Each animation answers: what happened, what matters, where
  to look next. Sequence elements in reading order; lead with the largest element.
- **Continuity.** Loader hands into the hero; pages hand into pages; a clicked thumbnail becomes
  the next hero. Never a hard cut; a plain fade is the minimum, not the goal.
- **Restraint.** One orchestrated intro per page. Scroll reveals for content that benefits from
  pacing, not for every paragraph. Static UI stays static.
- **Interruptible and fast.** Hovers respond within 100 ms; transitions never wait on themselves
  (the engine runs leave in parallel with fetch).

## Timing

| Thing | Duration | Ease (engine `ease`) |
|---|---|---|
| Hover / press feedback | 0.25 to 0.5 s | `soft` (power3.out) |
| Text line reveal | 1.0 to 1.3 s, stagger 0.06 to 0.1 | `out` (expo.out) |
| Image reveal / clip | 1.2 to 1.6 s | `out` |
| Curtain / page transition | 0.8 to 1.1 s each way | `inOut` (expo.inOut) |
| Loader total | 1.1 to 2.6 s | real progress |
| Scroll-linked | scrub `true` or 0.5 to 1 | `none` on the tween |

Custom curves: `CustomEase.create('frame', 'M0,0 C0.7,0 0.2,1 1,1')` (GSAP's CustomEase is free)
when the motion verb needs its own feel; register once and use the name everywhere.

## Engine-first

Most reveals need no code: `data-split`, `data-reveal`, `data-intro`, `data-parallax`, `data-gl`,
`data-magnetic`, `data-cursor` (engine.md). Write code for the signature moment and the
continuity moments. Put all page code inside `onPage()` (or `usePage()` in React components);
register global behavior once in `setupMotion`.

## Recipes

Imports use the Next alias `@/engine`; in Astro, use a relative path (`../engine`).

### Loader handoff (counter becomes the hero)
Make the loader's last frame identical to the hero's first frame, then remove the loader: the
visitor perceives one continuous motion. Example: the loader shows the name at hero size in the
hero position; the exit timeline only moves the counter and wipes the background, and the hero's
`data-intro` name is set to start visible.
```ts
// in setupMotion:
setLoaderExit((root) => gsap.timeline()
  .to(root.querySelector('[data-loader-count]'), { yPercent: -110, duration: 0.6, ease: ease.inOut })
  .to(root, { backgroundColor: 'transparent', duration: 0.8, ease: ease.inOut }, '<0.1')
  .to(root.querySelector('.loader__name'), { autoAlpha: 0, duration: 0.01 })); // hero name now visible underneath
```

### Custom page transition: clip-path iris from the click point
```ts
import { gsap } from 'gsap';
import { setTransition, ease } from '@/engine';
let point = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointerdown', (e) => { point = { x: e.clientX, y: e.clientY }; });
setTransition({
  leave: (c) => gsap.timeline()
    .set(c, { autoAlpha: 1 })
    .fromTo(c.querySelector('.curtain__panel'),
      { clipPath: `circle(0% at ${point.x}px ${point.y}px)` },
      { clipPath: `circle(150% at ${point.x}px ${point.y}px)`, duration: 0.9, ease: ease.inOut }),
  enter: (c) => gsap.timeline()
    .to(c.querySelector('.curtain__panel'), { clipPath: `circle(0% at 50% 50%)`, duration: 0.9, ease: ease.inOut })
    .set(c, { autoAlpha: 0 }),
});
```
Call `setTransition` from `setupMotion` (it is global, registered once).
Variants: N vertical columns wiping with stagger (add N panels in the curtain), the panel carrying
the next page's title (read `document.title` in `enter` or the link text in `leave`).

### Shared-element transition: thumbnail grows into the case hero
```ts
import { gsap } from 'gsap';
import { setTransition, ease } from '@/engine';
let source: HTMLElement | null = null;
document.addEventListener('click', (e) => {
  source = (e.target as HTMLElement).closest('a')?.querySelector<HTMLElement>('[data-flip-src]') ?? null;
}, true);
setTransition({
  leave: (c) => {
    const panel = c.querySelector<HTMLElement>('.curtain__panel')!;
    if (!source) return gsap.timeline().set(c, { autoAlpha: 1 }).fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: ease.inOut });
    const r = source.getBoundingClientRect();
    const ghost = source.cloneNode(true) as HTMLElement;
    ghost.classList.add('flip-ghost');            // CSS: .flip-ghost img { opacity: 1 !important } (GL hides imgs)
    Object.assign(ghost.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: '0', zIndex: '1' });
    c.appendChild(ghost);
    gsap.set(panel, { yPercent: 100 });
    // Target = where the case hero media sits (keep these in sync with the case page CSS).
    return gsap.timeline().set(c, { autoAlpha: 1 })
      .to(ghost, { left: 0, top: 0, width: innerWidth, height: innerHeight, duration: 1, ease: ease.inOut });
  },
  enter: (c) => {
    const ghost = c.querySelector('.flip-ghost');
    return gsap.timeline()
      .to(ghost, { autoAlpha: 0, duration: 0.5, delay: 0.15 })
      .add(() => { ghost?.remove(); source = null; })
      .set(c, { autoAlpha: 0 });
  },
});
```
The case page hero media must start at exactly the ghost's final rect and be visible immediately
(`data-gl-instant` if it is a GL plane, no reveal). Procedural covers have no `<img>`: give the
ghost the project's color (`ghost.style.background = ...`) or render the cover into an image.

### Index list with cursor-following preview (desktop) and inline thumbnails (touch)
Markup (render it from `projects` in JSX or Astro; shown as HTML):
```html
<ul class="index" data-index>
  <li><a href="/work/harbor-lights/" data-preview="/photos/harbor.jpg" data-cursor="Open">
    <span class="index__title">Harbor Lights</span><span>Art direction</span><span>2026</span>
  </a></li>
</ul>
<div class="preview" aria-hidden="true"><img alt="" /></div>
```
Behavior, registered once from `setupMotion` (it checks for the list on every page):
```ts
import { gsap } from 'gsap';
import { onPage, onScroll, isTouch } from '@/engine';

export const indexPreview = () => onPage(() => {
  const list = document.querySelector('[data-index]');
  const box = document.querySelector<HTMLElement>('.preview');
  if (!list || !box || isTouch()) return;
  const img = box.querySelector('img')!;
  const x = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3.out' });
  const y = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3.out' });
  const rot = gsap.quickTo(box, 'rotate', { duration: 0.8, ease: 'power3.out' });
  let lastX = 0, px = 0, py = 0;
  const move = (e: PointerEvent) => {
    px = e.clientX; py = e.clientY;
    x(px); y(py); rot(gsap.utils.clamp(-12, 12, (px - lastX) * 0.6)); lastX = px;
  };
  const show = (e: Event) => { img.src = (e.currentTarget as HTMLElement).dataset.preview!; gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' }); };
  const hide = () => gsap.to(box, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: 'expo.out' });
  list.querySelectorAll<HTMLAnchorElement>('a[data-preview]').forEach((a) => { a.addEventListener('pointerenter', show); a.addEventListener('focus', show); });
  list.addEventListener('pointerleave', hide);
  addEventListener('pointermove', move);
  // pointerleave never fires when the page scrolls out from under a still pointer: check on scroll.
  const off = onScroll(() => { if (!list.contains(document.elementFromPoint(px, py))) hide(); });
  return () => { removeEventListener('pointermove', move); off(); };
});
```
```css
.preview { position: fixed; left: 0; top: 0; width: 22vw; aspect-ratio: 4/5; pointer-events: none;
  translate: -50% -50%; opacity: 0; visibility: hidden; z-index: 5; } /* translate (not transform) so GSAP owns transform */
.preview img { width: 100%; height: 100%; object-fit: cover; }
.index a { display: grid; grid-template-columns: 6fr 3fr 1fr; padding-block: 1.2rem; }
```
Preload preview images (`<link rel="preload" as="image">` for the first few or create Image objects).
On touch, render the thumbnail inline in each row instead.

### Velocity marquee (one per page, max)
```ts
onPage(() => {
  const track = document.querySelector<HTMLElement>('[data-marquee] [data-track]');
  if (!track) return;                      // track holds the content twice for a seamless loop
  const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
  const off = onScroll(({ velocity }) => {
    const dir = velocity < 0 ? -1 : 1;
    gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(velocity) / 8, 5)), duration: 0.4, overwrite: true });
  });
  return () => { off(); };
});
```

### Pinned horizontal pan (only for real sequences)
```ts
onPage(() => {
  const wrap = document.querySelector<HTMLElement>('[data-hpan]');
  const track = wrap?.querySelector<HTMLElement>('[data-track]');
  if (!wrap || !track || isMobile()) return; // phones: native overflow-x scroll-snap instead
  const dist = () => track.scrollWidth - innerWidth;
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
    trigger: wrap, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
});
```

### Pinned chapters (sticky media, changing state)
```ts
onPage(() => {
  const chapters = gsap.utils.toArray<HTMLElement>('[data-chapter]');
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (!chapters.length || !stage) return;
  chapters.forEach((ch, i) => ScrollTrigger.create({
    trigger: ch, start: 'top center', end: 'bottom center',
    onToggle: (self) => self.isActive && stage.setAttribute('data-state', String(i)), // CSS/GSAP reacts to state
  }));
});
```
Use CSS `position: sticky` for the stage (cheaper than pinning) and animate between states with GSAP.

### Scroll-scrubbed timeline (one object transforms across a section)
```ts
const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-story]', start: 'top top', end: '+=250%', pin: true, scrub: 1 } });
tl.to('.obj', { rotate: 90, scale: 0.6 }).to('.obj', { xPercent: 80 }).to('.caption-2', { autoAlpha: 1 }, '<');
```

### Kinetic type: variable axis on scroll
```ts
onPage(() => {
  const el = document.querySelector<HTMLElement>('[data-wdth]');
  if (!el) return;
  gsap.fromTo(el, { fontVariationSettings: '"wght" 200, "wdth" 62' }, { fontVariationSettings: '"wght" 900, "wdth" 125',
    ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
});
```
Requires a variable font that has the axes (Archivo, Mona Sans, Bricolage Grotesque).

### Text scramble (tech concepts; final text stays in the DOM)
```ts
export function scramble(el: HTMLElement, duration = 0.9) {
  const final = el.textContent || ''; const glyphs = '!<>-_\\/[]{}=+*^?#';
  el.setAttribute('aria-label', final);
  const o = { p: 0 };
  return gsap.to(o, { p: 1, duration, ease: 'none', onUpdate: () => {
    const n = Math.floor(o.p * final.length);
    el.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0])).join('');
  }, onComplete: () => { el.textContent = final; } });
}
```

### Counter (real numbers only)
```ts
const o = { v: 0 };
gsap.to(o, { v: 214, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true },
  onUpdate: () => (el.textContent = Math.round(o.v).toString()) });
```

### Full-screen menu overlay (accessible)
- Button: `<button aria-expanded="false" aria-controls="menu">Menu</button>`; overlay `<nav id="menu" hidden>`.
- Open: remove `hidden`, `stopScroll()`, animate panel clip-path and stagger link lines (`yPercent: 110 → 0`),
  move focus to the first link, trap Tab inside, Escape closes, restore focus to the button,
  `startScroll()`. Close the menu when a navigation starts (in your transition's `leave`, or on route change).

### Image trail (playful portfolios)
On pointermove beyond a distance threshold (e.g. 80 px), place the next image from a pool of
6 to 8 `<img>` at the pointer, `gsap.fromTo(scale 0.6 → 1, autoAlpha 1)` then fade/drop after 0.8 s.
Recycle elements; never create DOM per event.

### Drag canvas (big archives)
Absolutely positioned grid inside a container; pointer drag sets target x/y, a ticker lerps the
current position (`gsap.ticker`), wrap positions with `gsap.utils.wrap` for infinity. Provide a
list view toggle for accessibility.

### Sound (only when the concept is about sound)
Off by default, a visible toggle with state ("Sound off/on"), Web Audio with a user gesture,
short UI sounds under 30 KB each, respect reduced motion as a hint to keep it off.

## Pitfalls

- Never set CSS `transform` on something GSAP moves; use `translate`/`rotate`/`scale` individual
  CSS properties or `gsap.set`.
- `ScrollTrigger.refresh()` after images/fonts change layout (the engine refreshes on page init).
- Pin + Lenis: works through the engine's ScrollTrigger sync; never add `pinType` hacks.
- Do not animate `filter: blur()` on large areas or `box-shadow` on scroll.
- `will-change` only during an animation, never globally.
- Check the reduced-motion screenshot: content must be visible and complete.
