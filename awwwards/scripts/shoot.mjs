#!/usr/bin/env node
// Visual QA: screenshots a running site the way a visitor experiences it (any framework).
//   node shoot.mjs <url> [--out .shots] [--steps 6] [--nav]
// Produces: desktop frames (loader end + scroll steps), mobile frames, reduced-motion frame,
// optional page-transition frames (--nav clicks the first internal link), plus report.json
// with console errors, failed requests, FPS sample and layout metrics. Read every PNG it writes.
import fs from 'node:fs';
import path from 'node:path';
import { launch } from './browser.mjs';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
if (!url) { console.error('usage: node shoot.mjs <url> [--out dir] [--steps n] [--nav]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i > -1 ? args[i + 1] : d; };
const out = path.resolve(opt('out', '.shots'));
const steps = parseInt(opt('steps', '6'), 10);
const nav = args.includes('--nav');
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (f.endsWith('.png')) fs.rmSync(path.join(out, f));

const browser = await launch();
const report = { url, errors: [], failed: [], desktop: {}, mobile: {}, files: [] };
const shot = async (page, name) => {
  const file = path.join(out, `${name}.png`);
  await page.screenshot({ path: file });
  report.files.push(file);
};
// Shooting a missing URL on purpose (to review the 404 page) is not an error.
const expect404 = /404|not-?found|nothing|missing/i.test(new URL(url).pathname);
// A loader is any #loader element; it is done when removed or hidden.
const loaderGone = () => { const l = document.getElementById('loader'); if (!l || l.hidden) return true; const cs = getComputedStyle(l); return cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0; };
const watch = (page, tag) => {
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (expect404 && /status of 404/.test(m.text())) return;
    report.errors.push(`[${tag}] ${m.text()}`);
  });
  page.on('pageerror', (e) => report.errors.push(`[${tag}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => report.failed.push(`[${tag}] ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() < 400) return;
    if (expect404 && r.status() === 404 && r.request().resourceType() === 'document') return;
    report.failed.push(`[${tag}] ${r.status()} ${r.url()}`);
  });
};
// Wheel-scroll like a person so smooth-scroll libraries see real input.
const wheelTo = async (page, y) => {
  for (let i = 0; i < 80; i++) {
    const cur = await page.evaluate(() => scrollY);
    const d = y - cur;
    if (Math.abs(d) < 8) break;
    await page.mouse.wheel(0, Math.max(-900, Math.min(900, d)));
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1300); // let reveals finish
};
const metrics = (page) => page.evaluate(() => {
  const de = document.documentElement;
  const overflowX = de.scrollWidth > innerWidth + 1;
  const offenders = overflowX
    ? [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 5).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').join('.') : ''))
    : [];
  const h1 = [...document.querySelectorAll('h1')].map((h) => h.innerText.trim().slice(0, 60));
  const small = [...document.querySelectorAll('a, button, [role="button"]')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && (r.width < 24 || r.height < 24);
  }).slice(0, 8).map((e) => `${(e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 24)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
  // GL planes render on a canvas UNDER the content: an opaque background on the element or any
  // ancestor inside <main> hides the plane completely (shows up as empty boxes).
  const glHidden = de.classList.contains('gl-on') ? [...document.querySelectorAll('[data-gl]')].map((el) => {
    for (let n = el; n && n.tagName !== 'MAIN' && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const a = cs.backgroundColor.match(/[\d.]+/g);
      const opaque = (a && (a.length < 4 ? true : +a[3] > 0.05) && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') || cs.backgroundImage !== 'none';
      if (opaque) return `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} covered by ${n === el ? 'itself' : n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : '')}`;
    }
    return null;
  }).filter(Boolean).slice(0, 6) : [];
  return { height: de.scrollHeight, overflowX, offenders, h1, smallTargets: small, glHidden, title: document.title, glOn: de.classList.contains('gl-on') };
});
const fps = (page, ms = 2000) => page.evaluate((ms) => new Promise((res) => {
  let n = 0; const t0 = performance.now(); let worst = 0; let last = t0;
  const f = (t) => { n++; worst = Math.max(worst, t - last); last = t; if (t - t0 < ms) requestAnimationFrame(f); else res({ fps: Math.round((n * 1000) / (t - t0)), worstFrameMs: Math.round(worst) }); };
  requestAnimationFrame(f);
}), ms);

// Desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, 'desktop');
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await shot(page, 'd-00-firstpaint');
  await page.waitForFunction(loaderGone, null, { timeout: 8000 }).catch(() => report.errors.push('[desktop] loader still present after 8s'));
  report.desktop.loaderMs = Date.now() - t0;
  await page.waitForTimeout(1600);
  await shot(page, 'd-01-hero');
  await page.mouse.move(720, 450);
  const m = await metrics(page);
  report.desktop = { ...report.desktop, ...m };
  const max = m.height - 900;
  for (let i = 1; i <= steps; i++) {
    await wheelTo(page, Math.round((max * i) / steps));
    await shot(page, `d-${String(i + 1).padStart(2, '0')}-scroll`);
  }
  // FPS while scrolling back up through the page
  const fpsP = fps(page, 2500);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -500); await page.waitForTimeout(120); }
  report.desktop.scrollFps = await fpsP;
  if (nav) {
    await wheelTo(page, 0);
    const href = await page.evaluate(() => [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href'))
      .find((h) => h && h !== '/' && !h.startsWith('/#') && new URL(h, location.href).pathname !== location.pathname));
    if (href) {
      const link = page.locator(`a[href="${href}"]`).first();
      await link.scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await link.click();
      await page.waitForTimeout(300);
      await shot(page, 'd-90-transition-a');
      await page.waitForTimeout(400);
      await shot(page, 'd-90-transition-b');
      await page.waitForTimeout(500);
      await shot(page, 'd-90-transition-c');
      await page.waitForURL((u) => u.pathname.startsWith(href.replace(/\/$/, '')), { timeout: 8000 }).catch(() => report.errors.push(`[nav] did not reach ${href}`));
      await page.waitForTimeout(2200);
      await shot(page, 'd-91-after-nav');
      report.desktop.nav = { href, scrollYAfter: await page.evaluate(() => scrollY), title: await page.title() };
      await page.goBack();
      await page.waitForTimeout(2500);
      await shot(page, 'd-92-back');
    }
  }
  await ctx.close();
}

// Mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page, 'mobile');
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(loaderGone, null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await shot(page, 'm-01-hero');
  report.mobile = await metrics(page);
  const max = report.mobile.height - 844;
  for (let i = 1; i <= Math.min(steps, 5); i++) {
    await page.evaluate((y) => scrollTo(0, y), Math.round((max * i) / Math.min(steps, 5)));
    await page.waitForTimeout(1500);
    await shot(page, `m-${String(i + 1).padStart(2, '0')}-scroll`);
  }
  await ctx.close();
}

// Reduced motion: content must be fully visible with no animation.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  watch(page, 'reduced');
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await shot(page, 'r-01-hero');
  report.reduced = await page.evaluate(() => ({
    hiddenText: [...document.querySelectorAll('h1,h2,h3,p,a')].filter((e) => {
      const cs = getComputedStyle(e);
      return e.getBoundingClientRect().height > 0 && (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05);
    }).length,
  }));
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
  await page.waitForTimeout(600);
  await shot(page, 'r-02-mid');
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, files: `${report.files.length} screenshots in ${out}` }, null, 2));
