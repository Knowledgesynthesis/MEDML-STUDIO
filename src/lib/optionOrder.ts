import { Rng } from './ml/stats';

/** Stable FNV-1a hash of a string → 32-bit seed. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic display order for a question's options, seeded by its id, so the correct answer's
 * position carries no cue but does not change between visits.
 */
export function optionOrder(id: string, n: number): number[] {
  return new Rng(hash(id) || 1).shuffle(Array.from({ length: n }, (_, i) => i));
}
