/** Fixed-width histogram bins over [lo, hi]. */
export function histogram(values: number[], lo: number, hi: number, nBins: number, normalize = false) {
  const w = (hi - lo) / nBins;
  const counts = new Array(nBins).fill(0);
  for (const v of values) {
    const k = Math.min(nBins - 1, Math.max(0, Math.floor((v - lo) / w)));
    counts[k]++;
  }
  const total = normalize ? values.length || 1 : 1;
  return counts.map((c, i) => ({ x0: lo + i * w, x1: lo + (i + 1) * w, v: c / total }));
}
