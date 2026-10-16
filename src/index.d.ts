export type Finish = 'gem' | 'gold' | 'graphite' | 'pearl' | 'wire' | 'glass';
export type Motion = 'roll' | 'flip' | 'drop' | 'focus' | 'pop' | 'assemble' | 'draw' | 'fade' | 'none';

export interface DigitData {
  /** <defs> block with the digit's gradients (IDs d<digit>g<n>). */
  defs: string;
  /** One <path> string per facet, in original drawing coordinates. */
  paths: string[];
  /** Transform that places the paths on the 56 x 80 cell: translate(tx ty) scale(s). */
  tx: number;
  ty: number;
  s: number;
}

export interface MotionTiming {
  duration: number;
  exit: number;
  stagger: number;
  easing: string;
  perStep?: number;
  perFacet?: number;
}

export interface DigitOptions {
  finish?: Finish;
  /** Accessible name. When set the SVG gets role="img"; otherwise it is aria-hidden. */
  title?: string;
}

export interface SetOptions {
  motion?: Motion;
  /** Sweep a highlight across the number once it settles. */
  glint?: boolean;
}

export declare const DIGITS: readonly DigitData[];
export declare const CELL: Readonly<{ width: 56; height: 80; capLine: 8; baseline: 72 }>;
export declare const FINISHES: readonly Finish[];
export declare const MOTIONS: Readonly<Record<Motion, MotionTiming>>;

/** One digit as a standalone SVG string with unique IDs. Works on the server. */
export declare function digitSVG(digit: number | string, options?: DigitOptions): string;
/** Every digit of a value as SVG strings. Non-digits are dropped. */
export declare function numberSVG(value: number | string, options?: DigitOptions): string[];

export declare class FacetNumber extends HTMLElement {
  value: string;
  motion: Motion;
  finish: Finish;
  speed: number;
  readonly pad: number;
  /** Animate to a new value. Resolves when every digit has settled. */
  set(value: number | string, options?: SetOptions): Promise<void>;
  /** Sweep a highlight across the number. */
  glint(): Promise<void>;
}

/** Registers the element (default tag: facet-number). Safe to call repeatedly; no-op on the server. */
export declare function define(tagName?: string): string;

export interface FacetSettleEvent extends CustomEvent<{ value: string }> {}

declare global {
  interface HTMLElementTagNameMap {
    'facet-number': FacetNumber;
  }
  interface HTMLElementEventMap {
    'facet-settle': FacetSettleEvent;
  }
}
