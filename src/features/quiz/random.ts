/**
 * Deterministische Zufallshelfer (seedbar), damit Prüfungsziehungen
 * reproduzierbar sind und Shuffles nicht von Render-Zyklen abhängen.
 */

export type Rng = () => number;

/** Mulberry32 – kleiner, schneller PRNG mit 32-bit-Seed. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Neuer Seed für einen Versuch (nicht deterministisch). */
export function newSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
}

/** Fisher-Yates-Shuffle; liefert eine neue Liste. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle, das garantiert NICHT der Ausgangsreihenfolge entspricht (falls möglich). */
export function shuffleNotIdentity<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  if (items.length < 2) return items.slice();
  for (let tries = 0; tries < 12; tries++) {
    const s = shuffle(items, rng);
    if (s.some((x, i) => x !== items[i])) return s;
  }
  // Fallback: Rotation um eins ist nie identisch
  return [...items.slice(1), items[0]];
}

/** Indizes 0..n-1 gemischt. */
export function shuffledIndices(n: number, rng: Rng = Math.random): number[] {
  return shuffle(
    Array.from({ length: n }, (_, i) => i),
    rng,
  );
}
