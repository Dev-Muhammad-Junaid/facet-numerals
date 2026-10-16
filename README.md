# Facet Numerals

![Facet Numerals cycling through eight motions: odometer roll, split flip, drop and settle, focus snap, tick pop, facet assemble, line draw to fill and glint sweep](https://raw.githubusercontent.com/Dev-Muhammad-Junaid/facet-numerals/main/media/motions.gif)

Ten faceted, gem-style SVG digits, audited for precision and rebuilt on a shared tabular grid, plus a motion lab for trying them out.

**Live lab: https://dev-muhammad-junaid.github.io/facet-numerals/** · [Component examples](https://dev-muhammad-junaid.github.io/facet-numerals/examples/)

```bash
npm i facet-numerals
```

In the lab you can type a number, then choose one of seven motions and one of six finishes. You can play the motion at 0.25×–2× speed to check individual frames, and switch on guide lines to confirm the digits stay on the baseline while they move.

## Use it in your project

The package ships a `<facet-number>` web component with no dependencies, so it works in plain HTML, React, Vue, Svelte or anything else that renders HTML.

```js
import 'facet-numerals/define';
```

```html
<facet-number value="2026" motion="roll" glint style="--facet-height: 120px"></facet-number>
```

Change `value` (the attribute or the property) and the number animates to it. No build step? Load it from a CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/facet-numerals/src/define.js"></script>
```

### Attributes

| Attribute | Values | Default |
| --- | --- | --- |
| `value` | Any number. Non-digits are ignored. | `0` |
| `motion` | `roll` `flip` `drop` `focus` `pop` `assemble` `draw` `fade` `none` | `roll` |
| `finish` | `gem` `gold` `graphite` `pearl` `wire` `glass` | `gem` |
| `glint` | Present = sweep a highlight across the number after each change | off |
| `pad` | Minimum number of digits, padded with zeros (`pad="6"` for a clock) | `0` |
| `speed` | Playback rate, for example `0.25` to slow motions down | `1` |

Size it with `--facet-height` (default `1.4em`, so it sits inline with text) or a plain CSS `height`. Each digit is 0.7 times as wide as it is tall. Other custom properties: `--facet-gap`, `--facet-wire-color`, `--facet-glass-edge`, `--facet-draw-color`. The row of digits is exposed as `::part(number)`.

### JavaScript

```js
const el = document.querySelector('facet-number');
await el.set(4815, { motion: 'flip', glint: true }); // resolves when every digit has settled
await el.glint();
el.addEventListener('facet-settle', e => console.log(e.detail.value));
```

The element sets `role="img"` and an `aria-label` with the current value, so screen readers read the number. When the viewer has reduced motion turned on, every motion becomes a 150 ms crossfade and the glint is skipped.

### Server rendering and static SVG

```js
import { digitSVG, numberSVG } from 'facet-numerals';

digitSVG(7, { finish: 'gold', title: '7' }); // one standalone <svg> string, IDs unique per call
numberSVG(2026);                             // ['<svg…>', '<svg…>', …]
```

Both run in Node with no DOM. The files are also importable directly as `facet-numerals/svg/0.svg` … `9.svg`, and the motion tokens as `facet-numerals/tokens.css`. TypeScript types are included.

## What's in here

| Path | What it is |
| --- | --- |
| `src/` | The npm package: `<facet-number>`, `digitSVG()`, types. |
| `examples/` | Component examples page. |
| `tokens.css` | Motion tokens as CSS custom properties. |
| `index.html` | The motion lab. One file, no build step, no dependencies besides Google Fonts. |
| `digits.js`, `src/digits.js` | The ten digits as data for the lab and the package. Generated, don't edit. |
| `svg/0.svg` … `svg/9.svg` | Normalized digits, ready to use. |
| `svg/original/` | The digits as first generated, kept for the audit. |
| `tools/normalize.py` | Rebuilds `svg/`, `digits.js` and `src/digits.js` from `svg/original/`. |
| `tools/patches.py` | Hand fixes the normalizer applies on top of the originals (the 6's redraw, hole floors, crack sealing). |
| `media/before.js` | The digits as they were before the fixes, for the lab's Fixes section. |
| `tools/capture-gif.cjs` | Renders `media/motions.gif` from the lab, frame by frame. |
| `media/motions.gif` | The motion reel at the top of this README. |
| `preview.png` | Static social preview image. |

## Using the SVGs

Every normalized digit sits on the same **56 × 80** cell:

- cap line at **y = 8**, baseline at **y = 72** (cap height 64)
- glyph centered horizontally, so every digit takes the same width and numbers don't shift sideways as they change
- transparent background, and every hole (counter) has the same dark floor, so the digits read as hollow on any background
- gradient IDs are unique per digit (`d0g0` … `d9g10`), so all ten can be inlined on one page

```html
<img src="svg/2.svg" alt="2" height="80">
```

To animate individual facets, inline the SVG markup instead of using `<img>`.

## What the audit found

The generated files looked right on black but weren't production-ready:

- **Painted holes.** The holes (counters) in 0, 4, 8 and 9 were black shapes, so they showed as black blobs on light backgrounds, and the 6's hole was cut clean through. All holes now share one dark floor colour.
- **Black backgrounds.** Every file had an opaque black rectangle behind the digit, each a different width.
- **Baseline drift.** 8 and 9 sat about 3 units high, and 4 touched the bottom edge of its canvas.
- **Mixed canvas sizes.** 0 and 4 were drawn on 48 × 48, the rest on 80 × 80.
- **Uneven heights and widths.** Digit height varied by 6.5%, and widths were proportional rather than fixed.
- **Hairline cracks.** In the 1, 4, 7 and 9, neighbouring facets stopped a fraction short of each other, so thin lines of background showed through.
- **The 6.** A lumpy hook tip, a hairline opening, a gold corner in five pieces, a curved bevel and a lopsided crease.

`tools/normalize.py` fixes all of these, applying the hand edits in `tools/patches.py` on top of the untouched originals. Two issues still need a redraw by hand: the 7 has fewer facets than the others, and a few facet edges in other digits curve slightly. The lab page has the full list with measurements and a before/after for every fix.

## Motion tokens

| Motion | Enter | Exit | Easing | Use for |
| --- | --- | --- | --- | --- |
| Odometer roll | 380ms + 45ms per step | — | `cubic-bezier(.16,1,.3,1)` | Stats, prices, totals |
| Split flip | 420ms | 170ms | `cubic-bezier(.2,.7,.3,1)` | Timers, countdowns |
| Drop & settle | 460ms | 170ms | `cubic-bezier(.3,.9,.4,1)` | Rank changes, scores |
| Focus snap | 320ms | 170ms | `cubic-bezier(.16,1,.3,1)` | Live dashboards |
| Tick pop | 360ms | instant | `cubic-bezier(.3,1.5,.5,1)` | Single increments |
| Facet assemble | 380ms + 9ms per facet | 120ms | `cubic-bezier(.2,.8,.2,1)` | Brand intros, reveals |
| Line draw to fill | 620ms + 6ms per facet | 120ms | `cubic-bezier(.45,0,.2,1)` | Onboarding, loading |
| Glint sweep | 700ms | — | `cubic-bezier(.45,0,.2,1)` | Idle attention, hover |

Digits animate left to right, 30–50ms apart (90ms for assemble and draw). All motions fall back to a short crossfade when the viewer has reduced motion turned on. The lab's spec section has a copyable CSS token block.

## Remix it

1. Fork the repo, or click **Use this template**.
2. Run it locally with any static server, for example `python3 -m http.server`, then open http://localhost:8000.
3. To use your own digits, put ten SVGs in `svg/original/` named `0.svg` … `9.svg` and run the normalizer. It needs `rsvg-convert` and ImageMagick (`brew install librsvg imagemagick` on macOS).

```bash
python3 tools/normalize.py
```

To regenerate the GIF after changing digits or motions, run `tools/capture-gif.cjs` with a local server running, then encode the frames with [gifski](https://gif.ski). The script pauses every animation on the page and steps it 40 ms at a time, so the GIF matches the real timing exactly. Usage is at the top of the file.

The finishes are SVG filters in `index.html` (`#f-gold`, `#f-graphite`, `#f-pearl`). Each maps every facet's brightness onto a five-step color ramp, so you can add a new finish by copying a filter and changing its `tableValues`.

## License

The npm package's license field is `MIT AND CC-BY-NC-4.0`: the component code is MIT, and the digit artwork bundled with it is non-commercial.


- **Code** (`src/index.js`, `src/define.js`, `index.html`, `examples/`, `tools/`): [MIT](LICENSE)
- **Digit artwork** (`svg/`, `digits.js`, `src/digits.js`, `media/`, `preview.png`): [CC BY-NC 4.0](LICENSE-ASSETS.md). Remix freely for non-commercial use, with credit.

The digits were generated with [QuiverAI Arrow](https://quiver.ai) on its free tier, which allows only non-commercial use of its output, so the artwork can't be licensed for commercial use. Replace the artwork with your own and you can use the code for anything.
