/** Mulberry32 — シード固定で再現可能 */
export function createRng(seed: number) {
  let state = seed >>> 0;
  return {
    next(): number {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    chance(p: number): boolean {
      return this.next() < p;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
