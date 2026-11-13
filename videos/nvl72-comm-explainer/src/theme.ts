import { Easing, interpolate } from 'remotion';

export const BG = '#0a0c0e';
export const INK = '#eceef0';
export const INK2 = '#a2abb5';
export const INK3 = '#5d6772';
export const COPPER = '#d98a52';
export const COPPER_HI = '#f4b781';
export const SIGNAL = '#43e0b5';
export const SLOW = '#8b949e';
export const CN = '"Noto Sans SC", "WenQuanYi Micro Hei", sans-serif';
export const MONO = '"JetBrains Mono", "Noto Sans Mono", monospace';

export const EASE = Easing.bezier(0, 0, 0.2, 1);
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

/** 0→1 over [start, start+len], then holds. Professional ease, no overshoot. */
export const rise = (frame: number, start: number, len = 20): number =>
  interpolate(frame, [start, start + len], [0, 1], { ...CLAMP, easing: EASE });

export const fade = rise;

export const slide = (frame: number, start: number, len: number, from: number): number =>
  interpolate(frame, [start, start + len], [from, 0], { ...CLAMP, easing: EASE });

/** Deterministic PRNG. Same seed, same sequence. */
export const mulberry32 = (seed: number) => {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const cubic = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
};
