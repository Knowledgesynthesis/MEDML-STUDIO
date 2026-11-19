// Model-agnostic explanation methods, implemented exactly as described in the primary papers.
//  - Permutation importance: Breiman 2001; Fisher, Rudin & Dominici, JMLR 2019.
//  - Shapley values (interventional / "baseline" game): Lundberg & Lee, NeurIPS 2017; Janzing et al., AISTATS 2020.
//  - LIME (tabular, quartile discretisation, exponential kernel): Ribeiro, Singh & Guestrin, KDD 2016.
//  - Partial dependence: Friedman, Ann Stat 2001. ICE curves: Goldstein et al., JCGS 2015.

import { auroc } from './metrics';
import { Rng, logit, mean, quantile, sd, solve } from './stats';

export type PredictFn = (rows: number[][]) => number[];

export interface PermutationResult {
  feature: number;
  drop: number;
  sd: number;
}

/** Mean decrease in AUROC when one feature's column is shuffled (on held-out data). */
export function permutationImportance(predict: PredictFn, X: number[][], y: number[], repeats = 5, seed = 13): PermutationResult[] {
  const rng = new Rng(seed);
  const base = auroc(predict(X), y);
  const p = X[0].length;
  const out: PermutationResult[] = [];
  for (let j = 0; j < p; j++) {
    const drops: number[] = [];
    for (let r = 0; r < repeats; r++) {
      const perm = rng.shuffle(X.map((row) => row[j]));
      const Xp = X.map((row, i) => {
        const c = row.slice();
        c[j] = perm[i];
        return c;
      });
      drops.push(base - auroc(predict(Xp), y));
    }
    out.push({ feature: j, drop: mean(drops), sd: sd(drops) });
  }
  return out;
}

export interface ShapResult {
  /** E[f(X)] over the background sample (the "base value"). */
  base: number;
  /** f(x) */
  fx: number;
  phi: number[];
  scale: 'probability' | 'log-odds';
}

/**
 * Exact interventional Shapley values by enumerating all 2^p coalitions.
 * v(S) = mean over background rows b of f(x_S, b_~S). Feasible for p ≤ 12.
 * Satisfies efficiency exactly: base + Σφ = f(x).
 */
export function exactShap(predict: PredictFn, x: number[], background: number[][], scale: 'probability' | 'log-odds' = 'probability'): ShapResult {
  const p = x.length;
  if (p > 12) throw new Error('Exact Shapley enumeration limited to 12 features');
  const nMask = 1 << p;
  const B = background.length;
  const rows: number[][] = new Array(nMask * B);
  for (let m = 0; m < nMask; m++) {
    for (let b = 0; b < B; b++) {
      const bg = background[b];
      const r = new Array<number>(p);
      for (let j = 0; j < p; j++) r[j] = m & (1 << j) ? x[j] : bg[j];
      rows[m * B + b] = r;
    }
  }
  const preds = predict(rows);
  const v = new Float64Array(nMask);
  for (let m = 0; m < nMask; m++) {
    let s = 0;
    for (let b = 0; b < B; b++) {
      const q = preds[m * B + b];
      s += scale === 'log-odds' ? logit(q) : q;
    }
    v[m] = s / B;
  }
  // Shapley weights |S|!(p-|S|-1)!/p!
  const fact = [1];
  for (let i = 1; i <= p; i++) fact[i] = fact[i - 1] * i;
  const w = Array.from({ length: p }, (_, s) => (fact[s] * fact[p - s - 1]) / fact[p]);
  const popcount = (m: number) => {
    let c = 0;
    while (m) {
      m &= m - 1;
      c++;
    }
    return c;
  };
  const phi = new Array<number>(p).fill(0);
  for (let m = 0; m < nMask; m++) {
    const s = popcount(m);
    for (let j = 0; j < p; j++) {
      if (m & (1 << j)) continue;
      phi[j] += w[s] * (v[m | (1 << j)] - v[m]);
    }
  }
  return { base: v[0], fx: v[nMask - 1], phi, scale };
}

export interface LimeTerm {
  feature: number;
  weight: number;
  /** human-readable bin, e.g. "lactate > 2.4" */
  rule: string;
}

export interface LimeResult {
  intercept: number;
  terms: LimeTerm[];
  /** weighted R² of the local surrogate (local fidelity) */
  r2: number;
  prediction: number;
}

export interface LimeOptions {
  nSamples: number;
  kernelWidth?: number;
  seed: number;
  labels: string[];
  decimals?: number[];
  binary: boolean[];
}

/**
 * LIME for tabular data with quartile discretisation (the library default).
 * Perturbations are drawn feature-by-feature from the training marginals (features treated as independent),
 * mapped to "same bin as the patient?" indicators, weighted by an exponential kernel and fit with ridge regression.
 */
export function lime(predict: PredictFn, x: number[], train: number[][], opts: LimeOptions): LimeResult {
  const rng = new Rng(opts.seed);
  const p = x.length;
  const cuts = Array.from({ length: p }, (_, j) => {
    if (opts.binary[j]) return [];
    const col = train.map((r) => r[j]).filter((v) => !Number.isNaN(v));
    return [quantile(col, 0.25), quantile(col, 0.5), quantile(col, 0.75)];
  });
  const bin = (j: number, v: number) => {
    if (Number.isNaN(v)) return -1;
    if (opts.binary[j]) return v;
    const c = cuts[j];
    let b = 0;
    while (b < c.length && v > c[b]) b++;
    return b;
  };
  const xb = x.map((v, j) => bin(j, v));
  const width = opts.kernelWidth ?? 0.75 * Math.sqrt(p);
  const Z: number[][] = [];
  const rows: number[][] = [];
  for (let s = 0; s < opts.nSamples; s++) {
    if (s === 0) {
      rows.push(x.slice());
      Z.push(new Array(p).fill(1));
      continue;
    }
    const r = new Array<number>(p);
    const z = new Array<number>(p);
    for (let j = 0; j < p; j++) {
      r[j] = train[rng.int(train.length)][j];
      z[j] = bin(j, r[j]) === xb[j] ? 1 : 0;
    }
    rows.push(r);
    Z.push(z);
  }
  const f = predict(rows);
  const wts = Z.map((z) => {
    let d2 = 0;
    for (const v of z) d2 += (1 - v) ** 2;
    return Math.sqrt(Math.exp(-d2 / (width * width)));
  });
  // weighted ridge (alpha = 1) with unpenalised intercept
  const k = p + 1;
  const A = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  const bvec = new Array<number>(k).fill(0);
  for (let s = 0; s < Z.length; s++) {
    const row = [1, ...Z[s]];
    for (let a = 0; a < k; a++) {
      bvec[a] += wts[s] * row[a] * f[s];
      for (let c = 0; c < k; c++) A[a][c] += wts[s] * row[a] * row[c];
    }
  }
  for (let j = 1; j < k; j++) A[j][j] += 1;
  for (let j = 0; j < k; j++) A[j][j] += 1e-9;
  const coef = solve(A, bvec);
  let sw = 0;
  let mw = 0;
  for (let s = 0; s < f.length; s++) {
    sw += wts[s];
    mw += wts[s] * f[s];
  }
  mw /= sw;
  let ssr = 0;
  let sst = 0;
  for (let s = 0; s < f.length; s++) {
    let yhat = coef[0];
    for (let j = 0; j < p; j++) yhat += coef[j + 1] * Z[s][j];
    ssr += wts[s] * (f[s] - yhat) ** 2;
    sst += wts[s] * (f[s] - mw) ** 2;
  }
  const fmt = (v: number, j: number) => v.toFixed(opts.decimals?.[j] ?? 1);
  const terms: LimeTerm[] = x.map((v, j) => {
    let rule: string;
    const name = opts.labels[j];
    if (Number.isNaN(v)) rule = `${name} not measured`;
    else if (opts.binary[j]) rule = `${name} = ${v ? 'yes' : 'no'}`;
    else {
      const c = cuts[j];
      const b = xb[j];
      rule = b === 0 ? `${name} ≤ ${fmt(c[0], j)}` : b === 3 ? `${name} > ${fmt(c[2], j)}` : `${fmt(c[b - 1], j)} < ${name} ≤ ${fmt(c[b], j)}`;
    }
    return { feature: j, weight: coef[j + 1], rule };
  });
  return { intercept: coef[0], terms, r2: sst > 0 ? 1 - ssr / sst : 1, prediction: f[0] };
}

export interface PdpResult {
  grid: number[];
  pdp: number[];
  ice: number[][];
}

/** Partial dependence (average of ICE curves) over a grid spanning the 2nd–98th percentile. */
export function partialDependence(predict: PredictFn, X: number[][], feature: number, opts: { gridSize?: number; nIce?: number; seed?: number; binary?: boolean } = {}): PdpResult {
  const col = X.map((r) => r[feature]).filter((v) => !Number.isNaN(v));
  const gridSize = opts.gridSize ?? 25;
  const grid = opts.binary
    ? [0, 1]
    : Array.from({ length: gridSize }, (_, i) => quantile(col, 0.02) + ((quantile(col, 0.98) - quantile(col, 0.02)) * i) / (gridSize - 1));
  const rng = new Rng(opts.seed ?? 3);
  const rows = rng.shuffle(X).slice(0, Math.min(X.length, opts.nIce ?? 150));
  const batch: number[][] = [];
  for (const r of rows)
    for (const g of grid) {
      const c = r.slice();
      c[feature] = g;
      batch.push(c);
    }
  const preds = predict(batch);
  const ice = rows.map((_, i) => grid.map((_, k) => preds[i * grid.length + k]));
  const pdp = grid.map((_, k) => mean(ice.map((curve) => curve[k])));
  return { grid, pdp, ice };
}
