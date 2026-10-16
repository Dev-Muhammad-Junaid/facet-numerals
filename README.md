# Facet Numerals

![Facet Numerals cycling through eight motions: odometer roll, split flip, drop and settle, focus snap, tick pop, facet assemble, line draw to fill and glint sweep](media/motions.gif)

Ten faceted, gem-style SVG digits, audited for precision and rebuilt on a shared tabular grid, plus a motion lab for trying them out.

**Live lab: https://dev-muhammad-junaid.github.io/facet-numerals/**

In the lab you can type a number, then choose one of seven motions and one of six finishes. You can play the motion at 0.25×–2× speed to check individual frames, and switch on guide lines to confirm the digits stay on the baseline while they move.

## What's in here

| Path | What it is |
| --- | --- |
| `index.html` | The motion lab. One file, no build step, no dependencies besides Google Fonts. |
| `digits.js` | The ten digits packaged as data for the page. Generated, don't edit. |
| `svg/0.svg` … `svg/9.svg` | Normalized digits, ready to use. |
| `svg/original/` | The digits as first generated, kept for the audit. |
| `tools/normalize.py` | Rebuilds `svg/` and `digits.js` from `svg/original/`. |
| `tools/capture-gif.js` | Renders `media/motions.gif` from the lab, frame by frame. |
| `media/motions.gif` | The motion reel at the top of this README. |
| `preview.png` | Static social preview image. |

## Using the SVGs

Every normalized digit sits on the same **56 × 80** cell:

- cap line at **y = 8**, baseline at **y = 72** (cap height 64)
- glyph centered horizontally, so every digit takes the same width and numbers don't shift sideways as they change
- transparent background and see-through holes (counters), so they work on any background
- gradient IDs are unique per digit (`d0g0` … `d9g10`), so all ten can be inlined on one page

```html
<img src="svg/2.svg" alt="2" height="80">
```

To animate individual facets, inline the SVG markup instead of using `<img>`.

## What the audit found

The generated files looked right on black but weren't production-ready:

- **Painted holes.** The holes (counters) in 0, 4, 8 and 9 were black shapes, not cut-outs, so they showed as black blobs on light backgrounds.
- **Black backgrounds.** Every file had an opaque black rectangle behind the digit, each a different width.
- **Baseline drift.** 8 and 9 sat about 3 units high, and 4 touched the bottom edge of its canvas.
- **Mixed canvas sizes.** 0 and 4 were drawn on 48 × 48, the rest on 80 × 80.
- **Uneven heights and widths.** Digit height varied by 6.5%, and widths were proportional rather than fixed.

`tools/normalize.py` fixes all of these. Two issues need a redraw by hand: the 7 has fewer facets than the others, and a few facet edges curve slightly. The lab page has the full list with measurements.

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

To regenerate the GIF after changing digits or motions, run `tools/capture-gif.js` with a local server running, then encode the frames with [gifski](https://gif.ski). The script pauses every animation on the page and steps it 40 ms at a time, so the GIF matches the real timing exactly. Usage is at the top of the file.

The finishes are SVG filters in `index.html` (`#f-gold`, `#f-graphite`, `#f-pearl`). Each maps every facet's brightness onto a five-step color ramp, so you can add a new finish by copying a filter and changing its `tableValues`.

## License

- **Code** (`index.html`, `tools/`): [MIT](LICENSE)
- **Digit artwork** (`svg/`, `digits.js`, `media/`, `preview.png`): [CC BY-NC 4.0](LICENSE-ASSETS.md). Remix freely for non-commercial use, with credit.

The digits were generated with [QuiverAI Arrow](https://quiver.ai) on its free tier, which allows only non-commercial use of its output, so the artwork can't be licensed for commercial use. Replace the artwork with your own and you can use the code for anything.
