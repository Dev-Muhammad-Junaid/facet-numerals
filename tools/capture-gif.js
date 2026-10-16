// Renders the lab's hero stage frame-by-frame on a virtual clock and writes PNGs.
// Every Web Animation on the page is paused and stepped 40ms at a time, so the frames show
// the exact durations and easings from index.html with no capture jitter.
//
// Usage (from the repo root, with a static server running on port 8000):
//   npm i --no-save playwright-core
//   node tools/capture-gif.js http://localhost:8000/ frames
//   gifski --fps 25 --width 800 --quality 92 -o media/motions.gif frames/*.png
//
// Set CHROME_PATH if Chrome isn't at the default macOS location.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const URL = process.argv[2];
const OUT = process.argv[3];
const FPS = 25, DT = 1000 / FPS;
const W = 800, H = 400;

const SEGMENTS = [
  // [label, spec, action, hold-after ms]
  ['Odometer roll',     '380ms + 45ms / step · cubic-bezier(.16,1,.3,1)', `hero.set('2026','roll',{glint:false,dir:1})`, 1250],
  ['Split flip',        '420ms in · 170ms out · cubic-bezier(.2,.7,.3,1)', `hero.set('4815','flip',{glint:false})`, 1150],
  ['Drop & settle',     '460ms · cubic-bezier(.3,.9,.4,1)',               `hero.set('7302','drop',{glint:false})`, 1100],
  ['Focus snap',        '320ms · cubic-bezier(.16,1,.3,1)',               `hero.set('1964','focus',{glint:false})`, 950],
  ['Tick pop',          '360ms · cubic-bezier(.3,1.5,.5,1)',              `hero.set('1965','pop',{glint:false})`, 520],
  ['Tick pop',          '360ms · cubic-bezier(.3,1.5,.5,1)',              `hero.set('1966','pop',{glint:false})`, 800],
  ['Facet assemble',    '380ms + 9ms / facet · cubic-bezier(.2,.8,.2,1)', `hero.set('8080','assemble',{glint:false})`, 1500],
  ['Line draw to fill', '620ms + 6ms / facet · cubic-bezier(.45,0,.2,1)', `hero.set('3759','draw',{glint:false})`, 1650],
  ['Glint sweep',       '700ms · 55ms stagger · cubic-bezier(.45,0,.2,1)', `hero.glint()`, 1250],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage({ viewport: { width: W, height: 1200 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3500); // let the page's own intro roll and card autoplay finish

  await page.addStyleTag({ content: `
    body{background:#07080F}
    .wrap{padding:0!important;max-width:none!important;gap:0!important}
    .wrap>*:not(section[aria-label="Motion lab"]){display:none!important}
    .lab{display:block!important}
    .controls{display:none!important}
    .stage{width:${W}px!important;height:${H}px!important;min-height:0!important;border:0!important;border-radius:0!important;padding:0 32px!important}
    .stage-meta{left:28px!important;right:28px!important;bottom:22px!important;font-size:13px!important;color:#7D82B0!important}
    #stage-left{font:600 17px/1 'Chakra Petch',sans-serif!important;letter-spacing:.03em;color:#E8EAF7}
    .gif-mark{position:absolute;left:28px;top:24px;font:500 12px/1 'Chakra Petch',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#FFC467}
    .gif-step{position:absolute;right:28px;top:24px;font:500 12px/1 'IBM Plex Mono',monospace;color:#5E6394}
  `});
  await page.evaluate(() => {
    const st = document.getElementById('stage');
    st.insertAdjacentHTML('beforeend', '<div class="gif-mark">Facet Numerals · motion studies</div><div class="gif-step" id="gif-step"></div>');
    document.getElementById('glint').checked = false;
    // finish anything still running, then start the virtual clock
    document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} });
    window.__vt = 0; window.__t0 = new WeakMap();
    window.__adopt = () => { for (const a of document.getAnimations()) if (!__t0.has(a)) { __t0.set(a, __vt); a.pause(); a.currentTime = 0; } };
    window.__step = dt => {
      __vt += dt;
      for (const a of document.getAnimations()) {
        if (!__t0.has(a)) { __t0.set(a, __vt - dt); a.pause(); }
        const local = (__vt - __t0.get(a)) * a.playbackRate;
        const end = a.effect.getComputedTiming().endTime;
        if (local >= end) { if (a.playState !== 'finished') a.finish(); }
        else a.currentTime = local;
      }
    };
    hero.render('0000'); fitHero();
  });

  const box = await page.locator('#stage').boundingBox();
  const clip = { x: box.x, y: box.y, width: W, height: H };
  let n = 0;
  const shot = async () => page.screenshot({ path: path.join(OUT, String(n++).padStart(4, '0') + '.png'), clip });

  // opening hold on 0000
  await page.evaluate(() => { document.getElementById('stage-left').textContent = 'Ready'; document.getElementById('stage-right').textContent = '56 × 80 tabular cell · cap 64 · baseline 72'; });
  for (let i = 0; i < Math.round(450 / DT); i++) await shot();

  for (let s = 0; s < SEGMENTS.length; s++) {
    const [label, spec, action, hold] = SEGMENTS[s];
    const idx = new Set(SEGMENTS.slice(0, s + 1).map(x => x[0])).size;
    await page.evaluate(([label, spec, action, idx]) => {
      document.getElementById('stage-left').textContent = label;
      document.getElementById('stage-right').textContent = spec;
      document.getElementById('gif-step').textContent = String(idx).padStart(2, '0') + ' / 08';
      const settle = eval(action);
      __adopt();
      window.__settle = typeof settle === 'number' ? settle : 0;
    }, [label, spec, action, idx]);
    const settle = await page.evaluate(() => window.__settle);
    const frames = Math.round((Math.max(settle, 0) + hold) / DT);
    for (let i = 0; i < frames; i++) { await shot(); await page.evaluate(dt => __step(dt), DT); }
  }
  await browser.close();
  console.log('frames', n);
})();
