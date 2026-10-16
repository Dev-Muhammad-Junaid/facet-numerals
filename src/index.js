// Facet Numerals — faceted SVG digits with motion.
// Code: MIT. Digit artwork (./digits.js): CC BY-NC 4.0, see LICENSE-ASSETS.md.
import { DIGITS } from './digits.js';

export { DIGITS };

/** The tabular cell every digit sits on, in SVG user units. */
export const CELL = Object.freeze({ width: 56, height: 80, capLine: 8, baseline: 72 });

export const FINISHES = Object.freeze(['gem', 'gold', 'graphite', 'pearl', 'wire', 'glass']);

/** Timing for each motion at 1x speed. `stagger` is the delay between digit places, left to right. */
export const MOTIONS = Object.freeze({
  roll:     { duration: 380, perStep: 45,  exit: 0,   stagger: 40, easing: 'cubic-bezier(.16,1,.3,1)' },
  flip:     { duration: 420, exit: 170, stagger: 40, easing: 'cubic-bezier(.2,.7,.3,1)' },
  drop:     { duration: 460, exit: 170, stagger: 50, easing: 'cubic-bezier(.3,.9,.4,1)' },
  focus:    { duration: 320, exit: 170, stagger: 30, easing: 'cubic-bezier(.16,1,.3,1)' },
  pop:      { duration: 360, exit: 0,   stagger: 0,  easing: 'cubic-bezier(.3,.6,.4,1)' },
  assemble: { duration: 380, perFacet: 9, exit: 120, stagger: 90, easing: 'cubic-bezier(.2,.8,.2,1)' },
  draw:     { duration: 620, perFacet: 6, exit: 120, stagger: 90, easing: 'cubic-bezier(.45,0,.2,1)' },
  fade:     { duration: 150, exit: 120, stagger: 0,  easing: 'linear' },
  none:     { duration: 0,   exit: 0,   stagger: 0,  easing: 'linear' }
});

const GLINT = { duration: 700, stagger: 55, easing: 'cubic-bezier(.45,0,.2,1)' };
const EASE_IN = 'cubic-bezier(.5,0,.75,0)';

// Duotone ramps: each facet's luminance is mapped onto five steps, so the light direction survives.
const LUMA = '<feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0"/>';
const RAMPS = {
  gold:     ['0.16 0.52 0.86 1 1', '0.07 0.27 0.58 0.84 0.97', '0.02 0.05 0.14 0.44 0.82'],
  graphite: ['0.10 0.24 0.46 0.78 0.96', '0.11 0.25 0.48 0.80 0.97', '0.15 0.32 0.56 0.86 1'],
  pearl:    ['0.36 0.55 0.78 0.93 1', '0.40 0.60 0.83 0.96 1', '0.62 0.80 0.96 1 1']
};

let uid = 0;

/**
 * Returns one digit as a standalone SVG string. Safe to call on the server.
 * IDs are unique per call, so any number of digits can share a page.
 */
export function digitSVG(digit, { finish = 'gem', title } = {}) {
  const d = Number(digit);
  const g = DIGITS[d];
  if (!g) throw new RangeError(`facet-numerals: digit must be 0-9, got ${digit}`);
  const id = 'fn' + (++uid).toString(36);
  const fix = s => s.replace(/d\dg(\d+)/g, `${id}g$1`);
  const xf = `translate(${g.tx} ${g.ty}) scale(${g.s})`;
  const paths = fix(g.paths.join('')).replace(/<path /g, '<path pathLength="1" ');
  const ramp = RAMPS[finish];
  const filterDef = ramp
    ? `<filter id="${id}f" color-interpolation-filters="sRGB">${LUMA}<feComponentTransfer><feFuncR type="table" tableValues="${ramp[0]}"/><feFuncG type="table" tableValues="${ramp[1]}"/><feFuncB type="table" tableValues="${ramp[2]}"/></feComponentTransfer></filter>`
    : '';
  const a11y = title ? `role="img" aria-label="${String(title).replace(/"/g, '&quot;')}"` : 'aria-hidden="true" focusable="false"';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="fn-digit fn-${finish}" viewBox="0 0 ${CELL.width} ${CELL.height}" ${a11y}>`
    + `<defs>${fix(g.defs.replace(/^<defs>|<\/defs>$/g, ''))}${filterDef}`
    + `<clipPath id="${id}c" transform="${xf}">${fix(g.paths.join(''))}</clipPath>`
    + `<linearGradient id="${id}gl" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".78"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`
    + `<g class="fn-glyph"${ramp ? ` filter="url(#${id}f)"` : ''}><g class="fn-xf" transform="${xf}">${paths}</g></g>`
    + `<g clip-path="url(#${id}c)"><g class="fn-glint"><rect x="-34" y="-10" width="20" height="100" fill="url(#${id}gl)" transform="skewX(-18)"/></g></g></svg>`;
}

/** Returns a whole number as a row of SVG strings (one per digit). */
export function numberSVG(value, options) {
  return String(value).replace(/\D/g, '').split('').map(c => digitSVG(c, options));
}

/* ------------------------------------------------------------------ */
/* <facet-number> element                                              */
/* ------------------------------------------------------------------ */

const CSS = `
:host{display:inline-flex;vertical-align:middle;height:var(--facet-height,1.4em);line-height:0;contain:layout style}
:host([hidden]){display:none}
.num{display:flex;height:100%;gap:var(--facet-gap,0px)}
.cell{position:relative;height:100%;aspect-ratio:56/80;flex:none}
.cell.clip{overflow:hidden}
svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;display:block}
.strip{position:absolute;left:0;right:0;top:0;will-change:transform}
.strip>div{position:relative;width:100%}
.fn-xf path{transform-box:fill-box;transform-origin:50% 50%}
.fn-wire .fn-xf path{fill:none!important;stroke:var(--facet-wire-color,#7FE0FF);stroke-width:.45;stroke-linejoin:round}
.fn-glass .fn-xf path{fill-opacity:.22;stroke:var(--facet-glass-edge,#BDEBFF);stroke-opacity:.55;stroke-width:.35;stroke-linejoin:round}
.drawing .fn-xf path{stroke:var(--facet-draw-color,#9FE8FF);stroke-width:.55;stroke-linejoin:round;stroke-dasharray:1 1}
`;

const Base = globalThis.HTMLElement ?? class {};
const reducedMotion = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const clean = (v, pad) => (String(v ?? '').replace(/\D/g, '') || '0').padStart(pad, '0');

export class FacetNumber extends Base {
  static get observedAttributes() { return ['value', 'motion', 'finish', 'glint', 'pad', 'speed']; }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `<style>${CSS}</style><span class="num" part="number"></span>`;
    this._num = this._root.querySelector('.num');
    this._shown = null;
    this._anims = [];
  }

  get value() { return this.getAttribute('value') ?? '0'; }
  set value(v) { this.setAttribute('value', String(v)); }
  get motion() { return this.getAttribute('motion') || 'roll'; }
  set motion(v) { this.setAttribute('motion', v); }
  get finish() { return FINISHES.includes(this.getAttribute('finish')) ? this.getAttribute('finish') : 'gem'; }
  set finish(v) { this.setAttribute('finish', v); }
  get speed() { const s = parseFloat(this.getAttribute('speed')); return s > 0 ? s : 1; }
  set speed(v) { this.setAttribute('speed', String(v)); }
  get pad() { return Math.max(0, parseInt(this.getAttribute('pad'), 10) || 0); }

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
    if (this._shown === null) this._render(clean(this.value, this.pad));
  }

  attributeChangedCallback(name, oldV, newV) {
    if (this._shown === null || oldV === newV || this._silent) return;
    if (name === 'value' || name === 'pad') this.set(this.value);
    else if (name === 'finish') this._render(this._shown);
  }

  /** Animates to a new value. Resolves when every digit has settled. */
  set(value, { motion = this.motion, glint = this.hasAttribute('glint') } = {}) {
    const next = clean(value, this.pad);
    if (this.getAttribute('value') !== String(value)) {
      this._silent = true; this.setAttribute('value', String(value)); this._silent = false;
    }
    if (this._shown === null) { this._render(next); return Promise.resolve(); }
    const prev = this._shown;
    if (next === prev) return Promise.resolve();
    const m = reducedMotion() ? 'fade' : (MOTIONS[motion] ? motion : 'roll');
    if (next.length !== prev.length) this._render('0'.repeat(next.length));
    const from = this._shown;
    const up = Number(next) >= Number(prev);
    this._anims = [];
    let i = 0, settle = 0;
    this._cells().forEach((cell, k) => {
      if (from[k] === next[k]) return;
      settle = Math.max(settle, this._change(cell, +from[k], +next[k], m, i++ * MOTIONS[m].stagger, up));
    });
    this._shown = next;
    this.setAttribute('aria-label', next);
    if (glint && !reducedMotion()) this._glint(settle + 60);
    const anims = this._anims.map(a => a.finished.catch(() => {}));
    return Promise.all(anims).then(() => {
      this.dispatchEvent(new CustomEvent('facet-settle', { detail: { value: next }, bubbles: true, composed: true }));
    });
  }

  /** Sweeps a highlight across the number. */
  glint() {
    this._anims = [];
    this._glint(0);
    return Promise.all(this._anims.map(a => a.finished.catch(() => {})));
  }

  _render(str) {
    this._shown = str;
    this._num.innerHTML = '';
    for (const c of str) {
      const cell = document.createElement('span');
      cell.className = 'cell';
      cell.appendChild(this._digit(+c));
      this._num.appendChild(cell);
    }
    this.setAttribute('aria-label', str);
  }

  _cells() { return [...this._num.children]; }

  _digit(d) {
    const t = document.createElement('template');
    t.innerHTML = digitSVG(d, { finish: this.finish });
    return t.content.firstElementChild;
  }

  _a(el, kf, opt) {
    const a = el.animate(kf, Object.assign({ fill: 'backwards' }, opt));
    a.playbackRate = this.speed;
    a.finished.catch(() => {});
    this._anims.push(a);
    return a;
  }

  _glint(delay) {
    if (reducedMotion()) return;
    this._cells().forEach((cell, i) => cell.querySelectorAll('.fn-glint').forEach(g =>
      this._a(g, [{ transform: 'translateX(0)' }, { transform: 'translateX(120px)' }],
        { duration: GLINT.duration, delay: delay + i * GLINT.stagger, easing: GLINT.easing })));
  }

  _change(cell, a, b, m, delay, up) {
    cell.getAnimations({ subtree: true }).forEach(x => x.cancel());
    cell.classList.remove('clip');
    cell.innerHTML = '';
    if (m === 'none') { cell.appendChild(this._digit(b)); return 0; }
    if (m === 'roll') return this._roll(cell, a, b, delay, up);
    const old = this._digit(a), nw = this._digit(b);
    cell.append(old, nw);
    const T = MOTIONS[m];
    const exits = {
      flip: [{ transform: 'perspective(420px) rotateX(0deg)' }, { transform: 'perspective(420px) rotateX(88deg)', opacity: .3 }],
      drop: [{ transform: 'none', opacity: 1 }, { transform: 'translateY(24%)', opacity: 0 }],
      focus: [{ opacity: 1 }, { transform: 'scale(.9)', filter: 'blur(6px)', opacity: 0 }]
    };
    this._a(old, exits[m] || [{ opacity: 1 }, { opacity: 0 }],
      { duration: Math.max(T.exit, 1), delay, easing: exits[m] ? EASE_IN : 'linear', fill: 'forwards' })
      .finished.then(() => old.remove(), () => {});
    switch (m) {
      case 'flip':
        this._a(nw, [{ transform: 'perspective(420px) rotateX(-90deg)', opacity: 0 }, { transform: 'perspective(420px) rotateX(10deg)', opacity: 1, offset: .72 }, { transform: 'perspective(420px) rotateX(0deg)' }],
          { duration: T.duration, delay: delay + 150, easing: T.easing });
        return delay + 150 + T.duration;
      case 'drop':
        nw.style.transformOrigin = '50% 90%';
        this._a(nw, [{ transform: 'translateY(-26%)', opacity: 0 }, { transform: 'translateY(3%) scale(1.03,.95)', opacity: 1, offset: .62 }, { transform: 'translateY(-1%) scale(.99,1.01)', offset: .82 }, { transform: 'none' }],
          { duration: T.duration, delay, easing: T.easing });
        return delay + T.duration;
      case 'focus':
        this._a(nw, [{ transform: 'scale(1.16)', filter: 'blur(8px)', opacity: 0 }, { transform: 'none', filter: 'blur(0px)', opacity: 1 }],
          { duration: T.duration, delay, easing: T.easing });
        return delay + T.duration;
      case 'pop':
        nw.style.transformOrigin = '50% 90%';
        this._a(nw, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: .32 }, { transform: 'scale(.97)', offset: .68 }, { transform: 'none' }],
          { duration: T.duration, delay, easing: T.easing });
        return delay + T.duration;
      case 'assemble': {
        const ps = ranked(nw);
        ps.forEach((p, i) => this._a(p, [{ transform: 'scale(.25) rotate(-24deg)', opacity: 0 }, { transform: 'scale(1.06) rotate(0deg)', offset: .7 }, { transform: 'none' }],
          { duration: T.duration, delay: delay + i * T.perFacet, easing: T.easing }));
        return delay + ps.length * T.perFacet + T.duration;
      }
      case 'draw': {
        const ps = ranked(nw), lineOnly = this.finish === 'wire' || this.finish === 'glass';
        nw.classList.add('drawing');
        const kf = lineOnly
          ? [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }]
          : [{ strokeDashoffset: 1, fillOpacity: 0, strokeOpacity: 1 }, { strokeDashoffset: 0, fillOpacity: 0, strokeOpacity: 1, offset: .62 }, { strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0 }];
        let last;
        ps.forEach((p, i) => { last = this._a(p, kf, { duration: T.duration, delay: delay + i * T.perFacet, easing: T.easing }); });
        last?.finished.then(() => nw.classList.remove('drawing'), () => {});
        return delay + ps.length * T.perFacet + T.duration;
      }
      default:
        this._a(nw, [{ opacity: 0 }, { opacity: 1 }], { duration: T.duration, delay });
        return delay + T.duration;
    }
  }

  _roll(cell, a, b, delay, up) {
    const seq = [a];
    for (let d = a; d !== b;) { d = up ? (d + 1) % 10 : (d + 9) % 10; seq.push(d); }
    const items = up ? seq : seq.slice().reverse();
    const n = items.length, dist = n - 1, T = MOTIONS.roll;
    const strip = document.createElement('div');
    strip.className = 'strip';
    strip.style.height = `${n * 100}%`;
    for (const d of items) {
      const w = document.createElement('div');
      w.style.height = `${100 / n}%`;
      w.appendChild(this._digit(d));
      strip.appendChild(w);
    }
    cell.classList.add('clip');
    cell.appendChild(strip);
    const pct = dist / n * 100, dur = T.duration + dist * T.perStep;
    const kf = up ? [{ transform: 'translateY(0)' }, { transform: `translateY(-${pct}%)` }]
                  : [{ transform: `translateY(-${pct}%)` }, { transform: 'translateY(0)' }];
    const an = this._a(strip, kf, { duration: dur, delay, easing: T.easing, fill: 'both' });
    if (dist > 2) this._a(strip, [{ filter: 'blur(0px)' }, { filter: 'blur(1.4px)', offset: .3 }, { filter: 'blur(0px)' }], { duration: dur, delay, easing: 'ease-out' });
    an.finished.then(() => { cell.classList.remove('clip'); cell.innerHTML = ''; cell.appendChild(this._digit(b)); }, () => {});
    return delay + dur;
  }
}

// Facets animate in reading order of the light: top-left first.
function ranked(svg) {
  return [...svg.querySelectorAll('.fn-xf path')]
    .map(p => { const bb = p.getBBox(); return { p, k: (bb.x + bb.width / 2) + (bb.y + bb.height / 2) * 1.2 }; })
    .sort((x, y) => x.k - y.k).map(o => o.p);
}

/** Registers <facet-number> (or a custom tag name). Safe to call more than once, and a no-op on the server. */
export function define(tagName = 'facet-number') {
  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) customElements.define(tagName, class extends FacetNumber {});
  return tagName;
}
