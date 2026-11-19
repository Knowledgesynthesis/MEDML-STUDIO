// Minimum sample size for developing a prediction model with a binary outcome.
// Riley RD et al. BMJ 2020;368:m441 (criteria 1–3) and Riley, Van Calster & Collins, Stat Med 2021;40:859–864
// (anticipated Cox–Snell R² from a C-statistic). Matches the logic of the `pmsampsize` package.

import { normalInv } from './stats';

export interface SampleSizeInput {
  prevalence: number;
  /** number of candidate predictor parameters (count each spline term / category separately) */
  parameters: number;
  /** anticipated Cox–Snell R² (adjusted); if omitted, derived from cStatistic */
  r2cs?: number;
  cStatistic?: number;
  shrinkage?: number;
  /** maximum acceptable optimism in Nagelkerke R² */
  delta?: number;
  /** margin of error for the overall risk (criterion 3) */
  margin?: number;
}

export interface SampleSizeResult {
  r2cs: number;
  maxR2cs: number;
  criterion1: number;
  criterion2: number;
  criterion3: number;
  n: number;
  events: number;
  epp: number;
}

export function maxCoxSnell(prevalence: number): number {
  const lnLnull = prevalence * Math.log(prevalence) + (1 - prevalence) * Math.log(1 - prevalence);
  return 1 - Math.exp(2 * lnLnull);
}

/**
 * Cox–Snell R² implied by a C-statistic, assuming the linear predictor is normal with equal variance
 * in events and non-events (binormal model): events ~ N(μ,1), non-events ~ N(0,1), μ = √2·Φ⁻¹(C).
 * Computed by numerical integration of the expected log-likelihood ratio per patient.
 */
export function coxSnellFromC(c: number, prevalence: number): number {
  if (c <= 0.5) return 0;
  const mu = Math.SQRT2 * normalInv(c);
  const a = Math.log(prevalence / (1 - prevalence)) - (mu * mu) / 2;
  const phi = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  const steps = 4000;
  const lo = -10;
  const hi = 10 + mu;
  const h = (hi - lo) / steps;
  let e1 = 0;
  let e0 = 0;
  for (let i = 0; i <= steps; i++) {
    const x = lo + i * h;
    const w = i === 0 || i === steps ? 0.5 : 1;
    const eta = a + mu * x;
    const logP = -Math.log1p(Math.exp(-eta));
    const log1mP = -Math.log1p(Math.exp(eta));
    e1 += w * phi(x - mu) * logP;
    e0 += w * phi(x) * log1mP;
  }
  e1 *= h;
  e0 *= h;
  const llModel = prevalence * e1 + (1 - prevalence) * e0;
  const llNull = prevalence * Math.log(prevalence) + (1 - prevalence) * Math.log(1 - prevalence);
  const lrPerPatient = 2 * (llModel - llNull);
  return 1 - Math.exp(-lrPerPatient);
}

export function rileySampleSize(input: SampleSizeInput): SampleSizeResult {
  const S = input.shrinkage ?? 0.9;
  const delta = input.delta ?? 0.05;
  const margin = input.margin ?? 0.05;
  const phi = input.prevalence;
  const P = input.parameters;
  const r2 = input.r2cs ?? coxSnellFromC(input.cStatistic ?? 0.75, phi);
  const maxR2 = maxCoxSnell(phi);
  const c1 = P / ((S - 1) * Math.log(1 - r2 / S));
  const sAdj = r2 / (r2 + delta * maxR2);
  const c2 = P / ((sAdj - 1) * Math.log(1 - r2 - delta * maxR2));
  const c3 = (1.96 / margin) ** 2 * phi * (1 - phi);
  const n = Math.ceil(Math.max(c1, c2, c3));
  return {
    r2cs: r2,
    maxR2cs: maxR2,
    criterion1: Math.ceil(c1),
    criterion2: Math.ceil(c2),
    criterion3: Math.ceil(c3),
    n,
    events: n * phi,
    epp: (n * phi) / P,
  };
}
