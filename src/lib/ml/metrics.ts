// Performance measures for risk prediction models.
// Reporting follows Van Calster et al., Lancet Digit Health 2025 (AUROC, calibration plot,
// net benefit, risk distributions) and Steyerberg, Clinical Prediction Models (2nd ed., 2019).

import { Rng, logit, mean, sigmoid, solve, wilson, quantile } from './stats';

/** AUROC = concordance probability; ties count 1/2 (Mann–Whitney with mid-ranks). */
export function auroc(scores: number[], y: number[]): number {
  const n = scores.length;
  const idx = scores.map((s, i) => [s, i] as const).sort((a, b) => a[0] - b[0]);
  const ranks = new Array<number>(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && idx[j + 1][0] === idx[i][0]) j++;
    const r = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[idx[k][1]] = r;
    i = j + 1;
  }
  let n1 = 0;
  let sumR = 0;
  for (let k = 0; k < n; k++) {
    if (y[k] === 1) {
      n1++;
      sumR += ranks[k];
    }
  }
  const n0 = n - n1;
  if (n1 === 0 || n0 === 0) return NaN;
  return (sumR - (n1 * (n1 + 1)) / 2) / (n1 * n0);
}

export interface RocPoint {
  threshold: number;
  fpr: number;
  tpr: number;
}

/** Empirical ROC curve (one point per distinct threshold, ties handled jointly). */
export function rocCurve(scores: number[], y: number[]): RocPoint[] {
  const order = scores.map((s, i) => [s, y[i]] as const).sort((a, b) => b[0] - a[0]);
  const P = y.filter((v) => v === 1).length;
  const N = y.length - P;
  const pts: RocPoint[] = [{ threshold: Infinity, fpr: 0, tpr: 0 }];
  let tp = 0;
  let fp = 0;
  let i = 0;
  while (i < order.length) {
    const t = order[i][0];
    do {
      if (order[i][1] === 1) tp++;
      else fp++;
      i++;
    } while (i < order.length && order[i][0] === t);
    pts.push({ threshold: t, fpr: N ? fp / N : 0, tpr: P ? tp / P : 0 });
  }
  return pts;
}

export interface PrPoint {
  threshold: number;
  recall: number;
  precision: number;
}

export function prCurve(scores: number[], y: number[]): { points: PrPoint[]; averagePrecision: number } {
  const order = scores.map((s, i) => [s, y[i]] as const).sort((a, b) => b[0] - a[0]);
  const P = y.filter((v) => v === 1).length;
  const points: PrPoint[] = [];
  let tp = 0;
  let fp = 0;
  let ap = 0;
  let prevRecall = 0;
  let i = 0;
  while (i < order.length) {
    const t = order[i][0];
    do {
      if (order[i][1] === 1) tp++;
      else fp++;
      i++;
    } while (i < order.length && order[i][0] === t);
    const recall = P ? tp / P : 0;
    const precision = tp / (tp + fp);
    ap += (recall - prevRecall) * precision;
    prevRecall = recall;
    points.push({ threshold: t, recall, precision });
  }
  return { points, averagePrecision: ap };
}

export function brier(p: number[], y: number[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) s += (p[i] - y[i]) ** 2;
  return s / p.length;
}

/** Scaled Brier (Brier skill score): 1 − Brier / Brier of a model that always predicts the prevalence. */
export function scaledBrier(p: number[], y: number[]): number {
  const prev = mean(y);
  const ref = prev * (1 - prev);
  return ref === 0 ? NaN : 1 - brier(p, y) / ref;
}

export function logLoss(p: number[], y: number[], eps = 1e-6): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const q = Math.min(1 - eps, Math.max(eps, p[i]));
    s += y[i] === 1 ? -Math.log(q) : -Math.log(1 - q);
  }
  return s / p.length;
}

/**
 * Weak calibration (Van Calster et al., J Clin Epidemiol 2016):
 *  - calibration-in-the-large (intercept): logit P(y=1) = a + offset(logit p)
 *  - calibration slope: logit P(y=1) = a + b·logit p
 * Ideal: intercept 0, slope 1. Slope < 1 → predictions too extreme (typical of overfitting).
 */
export function calibrationStats(p: number[], y: number[]): { intercept: number; slope: number; oe: number; slopeIntercept: number } {
  const lp = p.map((v) => logit(v));
  // intercept with offset: 1-D Newton
  let a = 0;
  for (let it = 0; it < 50; it++) {
    let g = 0;
    let h = 0;
    for (let i = 0; i < lp.length; i++) {
      const q = sigmoid(a + lp[i]);
      g += y[i] - q;
      h += q * (1 - q);
    }
    const step = g / Math.max(h, 1e-12);
    a += step;
    if (Math.abs(step) < 1e-10) break;
  }
  // slope: 2-D Newton on [a, b]
  let b0 = 0;
  let b1 = 1;
  for (let it = 0; it < 100; it++) {
    let g0 = 0;
    let g1 = 0;
    let h00 = 0;
    let h01 = 0;
    let h11 = 0;
    for (let i = 0; i < lp.length; i++) {
      const q = sigmoid(b0 + b1 * lp[i]);
      const r = y[i] - q;
      const w = q * (1 - q);
      g0 += r;
      g1 += r * lp[i];
      h00 += w;
      h01 += w * lp[i];
      h11 += w * lp[i] * lp[i];
    }
    let d: number[];
    try {
      d = solve(
        [
          [h00 + 1e-9, h01],
          [h01, h11 + 1e-9],
        ],
        [g0, g1],
      );
    } catch {
      break;
    }
    b0 += d[0];
    b1 += d[1];
    if (Math.abs(d[0]) + Math.abs(d[1]) < 1e-10) break;
  }
  const oe = y.reduce((s, v) => s + v, 0) / p.reduce((s, v) => s + v, 0);
  return { intercept: a, slope: b1, oe, slopeIntercept: b0 };
}

/** Logistic recalibration (Cox 1958): p' = σ(a + b·logit p), with (a, b) estimated on new data. */
export function recalibrator(p: number[], y: number[], interceptOnly = false): (q: number) => number {
  const c = calibrationStats(p, y);
  return interceptOnly ? (q) => sigmoid(c.intercept + logit(q)) : (q) => sigmoid(c.slopeIntercept + c.slope * logit(q));
}

export interface CalibrationBin {
  predicted: number;
  observed: number;
  lo: number;
  hi: number;
  n: number;
}

/** Grouped calibration curve using quantile bins (equal-sized groups) with Wilson 95% CIs. */
export function calibrationCurve(p: number[], y: number[], bins = 10): CalibrationBin[] {
  const order = p.map((v, i) => [v, y[i]] as const).sort((a, b) => a[0] - b[0]);
  const out: CalibrationBin[] = [];
  const size = order.length / bins;
  for (let b = 0; b < bins; b++) {
    const chunk = order.slice(Math.round(b * size), Math.round((b + 1) * size));
    if (chunk.length === 0) continue;
    const events = chunk.reduce((s, c) => s + c[1], 0);
    const [lo, hi] = wilson(events, chunk.length);
    out.push({ predicted: mean(chunk.map((c) => c[0])), observed: events / chunk.length, lo, hi, n: chunk.length });
  }
  return out;
}

export interface Confusion {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

/** Classify as positive when predicted risk ≥ threshold. */
export function confusion(p: number[], y: number[], threshold: number): Confusion {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (let i = 0; i < p.length; i++) {
    const pos = p[i] >= threshold;
    if (pos && y[i] === 1) tp++;
    else if (pos && y[i] === 0) fp++;
    else if (!pos && y[i] === 0) tn++;
    else fn++;
  }
  return { tp, fp, tn, fn };
}

export interface ClassificationStats extends Confusion {
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  accuracy: number;
  f1: number;
  flaggedRate: number;
  /** Number needed to evaluate/alert: alerts per true case found = 1 / PPV. */
  nnAlert: number;
}

const ratio = (a: number, b: number) => (b === 0 ? NaN : a / b);

export function classificationStats(p: number[], y: number[], threshold: number): ClassificationStats {
  const c = confusion(p, y, threshold);
  const n = p.length;
  const sens = ratio(c.tp, c.tp + c.fn);
  const ppv = ratio(c.tp, c.tp + c.fp);
  return {
    ...c,
    sensitivity: sens,
    specificity: ratio(c.tn, c.tn + c.fp),
    ppv,
    npv: ratio(c.tn, c.tn + c.fn),
    accuracy: (c.tp + c.tn) / n,
    f1: ratio(2 * c.tp, 2 * c.tp + c.fp + c.fn),
    flaggedRate: (c.tp + c.fp) / n,
    nnAlert: ratio(c.tp + c.fp, c.tp),
  };
}

/**
 * Net benefit at threshold probability pt (Vickers & Elkin, Med Decis Making 2006):
 * NB = TP/n − FP/n × pt/(1 − pt). Exchange rate pt/(1−pt) = harm of a false positive
 * relative to the benefit of a true positive implied by choosing pt.
 */
export function netBenefit(p: number[], y: number[], pt: number): number {
  const c = confusion(p, y, pt);
  const n = p.length;
  return c.tp / n - (c.fp / n) * (pt / (1 - pt));
}

export function netBenefitTreatAll(prevalence: number, pt: number): number {
  return prevalence - (1 - prevalence) * (pt / (1 - pt));
}

export interface DcaPoint {
  pt: number;
  model: number;
  all: number;
  none: number;
}

export function decisionCurve(p: number[], y: number[], thresholds: number[]): DcaPoint[] {
  const prev = mean(y);
  return thresholds.map((pt) => ({ pt, model: netBenefit(p, y, pt), all: netBenefitTreatAll(prev, pt), none: 0 }));
}

/** Percentile bootstrap CI for any metric of (p, y). Resamples patients with replacement. */
export function bootstrapCI(
  p: number[],
  y: number[],
  metric: (p: number[], y: number[]) => number,
  reps = 200,
  seed = 7,
): [number, number] {
  const rng = new Rng(seed);
  const vals: number[] = [];
  const n = p.length;
  for (let r = 0; r < reps; r++) {
    const pp = new Array<number>(n);
    const yy = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const k = rng.int(n);
      pp[i] = p[k];
      yy[i] = y[k];
    }
    const v = metric(pp, yy);
    if (!Number.isNaN(v)) vals.push(v);
  }
  return [quantile(vals, 0.025), quantile(vals, 0.975)];
}

export interface PerformanceSummary {
  n: number;
  events: number;
  prevalence: number;
  auroc: number;
  aurocCI: [number, number];
  averagePrecision: number;
  brier: number;
  scaledBrier: number;
  logLoss: number;
  calIntercept: number;
  calSlope: number;
  oe: number;
}

export function summarize(p: number[], y: number[], withCI = true): PerformanceSummary {
  const cal = calibrationStats(p, y);
  const events = y.reduce((s, v) => s + v, 0);
  return {
    n: y.length,
    events,
    prevalence: events / y.length,
    auroc: auroc(p, y),
    aurocCI: withCI ? bootstrapCI(p, y, auroc) : [NaN, NaN],
    averagePrecision: prCurve(p, y).averagePrecision,
    brier: brier(p, y),
    scaledBrier: scaledBrier(p, y),
    logLoss: logLoss(p, y),
    calIntercept: cal.intercept,
    calSlope: cal.slope,
    oe: cal.oe,
  };
}
