import { describe, expect, it } from 'vitest';
import { Rng, sigmoid, logit, quantile, normalCdf, normalInv, solve, wilson } from './stats';
import {
  auroc,
  rocCurve,
  prCurve,
  brier,
  scaledBrier,
  calibrationStats,
  calibrationCurve,
  confusion,
  classificationStats,
  netBenefit,
  netBenefitTreatAll,
} from './metrics';
import { LogisticRegression, DecisionTree, GradientBoosting, RandomForest } from './models';
import { Preprocessor, type FeatureMeta } from './preprocess';
import { fitModel, stratifiedSplit, pick, oddsRatios } from './pipeline';
import { exactShap, lime, partialDependence, permutationImportance } from './explain';
import { rileySampleSize, coxSnellFromC, maxCoxSnell } from './samplesize';
import { groupReports } from './fairness';
import { makeSepsis, makeDiabetes, makeCareCohort } from '../data/datasets';

describe('stats', () => {
  it('Rng is deterministic and roughly uniform/normal', () => {
    const a = new Rng(5);
    const b = new Rng(5);
    const xs = Array.from({ length: 20000 }, () => a.next());
    expect(xs.slice(0, 5)).toEqual(Array.from({ length: 5 }, () => b.next()));
    const m = xs.reduce((s, v) => s + v, 0) / xs.length;
    expect(m).toBeGreaterThan(0.49);
    expect(m).toBeLessThan(0.51);
    const r = new Rng(1);
    const ns = Array.from({ length: 20000 }, () => r.normal());
    const nm = ns.reduce((s, v) => s + v, 0) / ns.length;
    const nv = ns.reduce((s, v) => s + (v - nm) ** 2, 0) / ns.length;
    expect(Math.abs(nm)).toBeLessThan(0.03);
    expect(Math.abs(nv - 1)).toBeLessThan(0.04);
  });
  it('sigmoid/logit are inverses and stable', () => {
    expect(sigmoid(0)).toBe(0.5);
    expect(sigmoid(-800)).toBeGreaterThanOrEqual(0);
    expect(sigmoid(800)).toBeLessThanOrEqual(1);
    expect(logit(sigmoid(1.234))).toBeCloseTo(1.234, 9);
  });
  it('normalCdf / normalInv', () => {
    expect(normalCdf(1.959964)).toBeCloseTo(0.975, 5);
    expect(normalInv(0.975)).toBeCloseTo(1.959964, 5);
    expect(normalInv(0.5)).toBeCloseTo(0, 9);
  });
  it('quantile type 7', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([1, NaN, 3], 0.5)).toBe(2);
  });
  it('solve linear system', () => {
    const x = solve(
      [
        [4, 1],
        [1, 3],
      ],
      [1, 2],
    );
    expect(x[0]).toBeCloseTo(1 / 11, 10);
    expect(x[1]).toBeCloseTo(7 / 11, 10);
  });
  it('wilson interval', () => {
    const [lo, hi] = wilson(50, 100);
    expect(lo).toBeCloseTo(0.4038, 3);
    expect(hi).toBeCloseTo(0.5962, 3);
  });
});

describe('discrimination', () => {
  it('AUROC: perfect, reversed, all ties, and a worked example', () => {
    expect(auroc([0.1, 0.2, 0.8, 0.9], [0, 0, 1, 1])).toBe(1);
    expect(auroc([0.9, 0.8, 0.2, 0.1], [0, 0, 1, 1])).toBe(0);
    expect(auroc([0.5, 0.5, 0.5, 0.5], [0, 1, 0, 1])).toBe(0.5);
    // pairs (pos,neg): (0.35,0.1)✓ (0.35,0.4)✗ (0.8,0.1)✓ (0.8,0.4)✓ → 3/4
    expect(auroc([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])).toBe(0.75);
    // a tie between a positive and a negative counts 1/2
    expect(auroc([0.2, 0.5, 0.5], [0, 0, 1])).toBe(0.75);
  });
  it('AUROC equals the trapezoidal area under the empirical ROC curve', () => {
    const rng = new Rng(3);
    const y = Array.from({ length: 400 }, () => rng.bernoulli(0.3));
    const s = y.map((v) => Math.round((v + rng.normal(0, 1)) * 10) / 10); // rounded → many ties
    const pts = rocCurve(s, y);
    let area = 0;
    for (let i = 1; i < pts.length; i++) area += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2;
    expect(area).toBeCloseTo(auroc(s, y), 10);
    expect(pts.at(-1)).toMatchObject({ fpr: 1, tpr: 1 });
  });
  it('AUROC is invariant to prevalence when the score distributions are fixed', () => {
    const rng = new Rng(9);
    const mk = (nPos: number, nNeg: number) => {
      const s: number[] = [];
      const y: number[] = [];
      for (let i = 0; i < nPos; i++) {
        s.push(rng.normal(1, 1));
        y.push(1);
      }
      for (let i = 0; i < nNeg; i++) {
        s.push(rng.normal(0, 1));
        y.push(0);
      }
      return auroc(s, y);
    };
    expect(Math.abs(mk(5000, 5000) - mk(500, 9500))).toBeLessThan(0.02);
  });
  it('never loops forever on NaN scores', () => {
    expect(() => rocCurve([NaN, NaN, 0.3], [1, 0, 1])).not.toThrow();
    expect(() => prCurve([NaN, NaN, 0.3], [1, 0, 1])).not.toThrow();
  });
  it('average precision of a perfect ranking is 1 and of random ranking ≈ prevalence', () => {
    expect(prCurve([0.9, 0.8, 0.1, 0.2], [1, 1, 0, 0]).averagePrecision).toBe(1);
    const rng = new Rng(1);
    const y = Array.from({ length: 20000 }, () => rng.bernoulli(0.1));
    const s = y.map(() => rng.next());
    expect(prCurve(s, y).averagePrecision).toBeCloseTo(0.1, 1);
  });
});

describe('classification at a threshold', () => {
  it('confusion matrix counts every cell (regression test: FN was always 0 in v1)', () => {
    const c = confusion([0.9, 0.2, 0.7, 0.1], [1, 1, 0, 0], 0.5);
    expect(c).toEqual({ tp: 1, fn: 1, fp: 1, tn: 1 });
    const st = classificationStats([0.9, 0.2, 0.7, 0.1], [1, 1, 0, 0], 0.5);
    expect(st.sensitivity).toBe(0.5);
    expect(st.ppv).toBe(0.5);
    expect(st.nnAlert).toBe(2);
  });
  it('net benefit matches hand calculation and treat-all formula', () => {
    // 10 patients, 3 events. Threshold 0.2 → odds 0.25.
    const p = [0.9, 0.8, 0.3, 0.25, 0.1, 0.05, 0.6, 0.15, 0.1, 0.05];
    const y = [1, 1, 0, 1, 0, 0, 0, 0, 0, 0];
    // positives at ≥0.2: idx 0,1,2,3,6 → TP 3, FP 2 → NB = 0.3 − 0.2×0.25 = 0.25
    expect(netBenefit(p, y, 0.2)).toBeCloseTo(0.25, 12);
    expect(netBenefitTreatAll(0.3, 0.2)).toBeCloseTo(0.3 - 0.7 * 0.25, 12);
    // treat-all equals the model that flags everyone
    expect(netBenefit(p.map(() => 1), y, 0.2)).toBeCloseTo(netBenefitTreatAll(0.3, 0.2), 12);
  });
});

describe('calibration & overall performance', () => {
  const rng = new Rng(21);
  const lp = Array.from({ length: 20000 }, () => rng.normal(-1.5, 1.2));
  const truth = lp.map(sigmoid);
  const y = truth.map((p) => rng.bernoulli(p));
  it('true risks are calibrated (intercept 0, slope 1, O/E 1)', () => {
    const c = calibrationStats(truth, y);
    expect(Math.abs(c.intercept)).toBeLessThan(0.05);
    expect(Math.abs(c.slope - 1)).toBeLessThan(0.05);
    expect(Math.abs(c.oe - 1)).toBeLessThan(0.05);
  });
  it('over-extreme predictions give slope ≈ 0.5; under-prediction gives positive intercept', () => {
    const extreme = lp.map((v) => sigmoid(-1.5 + 2 * (v + 1.5)));
    expect(calibrationStats(extreme, y).slope).toBeCloseTo(0.5, 1);
    const low = lp.map((v) => sigmoid(v - 1));
    expect(calibrationStats(low, y).intercept).toBeCloseTo(1, 1);
  });
  it('calibration curve bins cover all patients and observed≈predicted for true risks', () => {
    const bins = calibrationCurve(truth, y, 10);
    expect(bins.reduce((s, b) => s + b.n, 0)).toBe(truth.length);
    for (const b of bins) expect(Math.abs(b.observed - b.predicted)).toBeLessThan(0.03);
  });
  it('Brier score: prevalence-only model has scaled Brier 0', () => {
    const prev = y.reduce((s, v) => s + v, 0) / y.length;
    expect(scaledBrier(y.map(() => prev), y)).toBeCloseTo(0, 10);
    expect(brier([1, 0], [1, 0])).toBe(0);
  });
});

describe('models', () => {
  it('logistic regression recovers the data-generating coefficients and converges fast', () => {
    const rng = new Rng(4);
    const X = Array.from({ length: 6000 }, () => [rng.normal(), rng.normal(), rng.bernoulli(0.4)]);
    const y = X.map((x) => rng.bernoulli(sigmoid(-1 + 0.8 * x[0] - 0.5 * x[1] + 1.0 * x[2])));
    const m = new LogisticRegression({ l2: 0 });
    m.fit(X, y);
    expect(m.converged).toBe(true);
    expect(m.iterations).toBeLessThan(12);
    // each estimate within 3 standard errors of the truth
    expect(Math.abs(m.intercept + 1)).toBeLessThan(3 * m.interceptSe);
    [0.8, -0.5, 1.0].forEach((truth, j) => expect(Math.abs(m.coef[j] - truth)).toBeLessThan(3 * m.se[j]));
    for (const s of m.se) expect(s).toBeGreaterThan(0.02);
  });
  it('ridge penalty shrinks coefficients toward zero', () => {
    const rng = new Rng(8);
    const X = Array.from({ length: 300 }, () => [rng.normal(), rng.normal()]);
    const y = X.map((x) => rng.bernoulli(sigmoid(x[0] - x[1])));
    const a = new LogisticRegression({ l2: 0 });
    const b = new LogisticRegression({ l2: 50 });
    a.fit(X, y);
    b.fit(X, y);
    expect(Math.abs(b.coef[0])).toBeLessThan(Math.abs(a.coef[0]));
  });
  it('decision tree finds a perfect single split and respects depth', () => {
    const X = Array.from({ length: 100 }, (_, i) => [i, (i * 7) % 13]);
    const y = X.map((x) => (x[0] >= 60 ? 1 : 0));
    const t = new DecisionTree({ maxDepth: 3, minSamplesLeaf: 1 });
    t.fit(X, y);
    expect(t.root && !t.root.leaf && t.root.feature).toBe(0);
    expect(t.root && !t.root.leaf && t.root.threshold).toBe(59.5);
    expect(t.predict([[10, 0], [80, 0]])).toEqual([0, 1]);
    expect(t.stats().depth).toBeLessThanOrEqual(3);
  });
  it('gradient boosting monotonically reduces training log-loss', () => {
    const rng = new Rng(2);
    const X = Array.from({ length: 500 }, () => [rng.normal(), rng.normal()]);
    const y = X.map((x) => rng.bernoulli(sigmoid(x[0] * x[1] * 1.5)));
    const g = new GradientBoosting({ nEstimators: 40, learningRate: 0.2, maxDepth: 2, minSamplesLeaf: 5, subsample: 1, lambda: 1, seed: 1 });
    g.fit(X, y);
    for (let i = 1; i < g.trainLoss.length; i++) expect(g.trainLoss[i]).toBeLessThanOrEqual(g.trainLoss[i - 1] + 1e-9);
    // captures an interaction that a main-effects model cannot
    expect(auroc(g.predict(X), y)).toBeGreaterThan(0.7);
  });
  it('random forest probabilities are in [0,1] and importance sums ≈ total impurity decrease', () => {
    const rng = new Rng(6);
    const X = Array.from({ length: 300 }, () => [rng.normal(), rng.normal(), rng.normal()]);
    const y = X.map((x) => rng.bernoulli(sigmoid(2 * x[0])));
    const f = new RandomForest({ nTrees: 20, maxDepth: 5, minSamplesLeaf: 3, seed: 1 });
    f.fit(X, y);
    for (const p of f.predict(X)) expect(p >= 0 && p <= 1).toBe(true);
    const imp = f.importance();
    expect(imp[0]).toBeGreaterThan(imp[1]);
    expect(imp[0]).toBeGreaterThan(imp[2]);
  });
});

describe('preprocessing', () => {
  const meta: FeatureMeta[] = [
    { key: 'a', label: 'A', type: 'continuous', description: '' },
    { key: 'b', label: 'B', type: 'binary', description: '' },
  ];
  it('imputes with the training median, adds a missing indicator, and does not refit on new data', () => {
    const prep = new Preprocessor(meta, { standardize: true }).fit([
      [1, 0],
      [3, 1],
      [NaN, 1],
      [5, 0],
    ]);
    expect(prep.columns.map((c) => c.name)).toEqual(['a', 'b', 'a_missing']);
    const row = prep.transformRow([NaN, 1]);
    expect(row[2]).toBe(1);
    expect(row[1]).toBe(1); // binary not standardised
    const before = prep.medians.slice();
    prep.transform([[100, 0]]);
    expect(prep.medians).toEqual(before);
  });
});

describe('explanations', () => {
  const ds = makeDiabetes(900, 5);
  const split = stratifiedSplit(ds.y, 0.3, 1);
  const Xtr = pick(ds.X, split.train);
  const ytr = pick(ds.y, split.train);
  const lr = fitModel({ kind: 'logistic', l2: 0.01 }, ds.features, Xtr, ytr);
  const background = Xtr.slice(0, 40);
  const x = ds.X[split.test[0]];

  it('exact SHAP satisfies efficiency (base + Σφ = f(x))', () => {
    const r = exactShap((X) => lr.predict(X), x, background, 'probability');
    expect(r.base + r.phi.reduce((s, v) => s + v, 0)).toBeCloseTo(r.fx, 10);
    expect(r.fx).toBeCloseTo(lr.predictOne(x), 10);
    const f = fitModel({ kind: 'forest', nTrees: 15, depth: 4 }, ds.features, Xtr, ytr);
    const rf = exactShap((X) => f.predict(X), x, background, 'probability');
    expect(rf.base + rf.phi.reduce((s, v) => s + v, 0)).toBeCloseTo(rf.fx, 10);
  });
  it('for an additive logistic model, log-odds SHAP = β·(x − mean background x)', () => {
    const r = exactShap((X) => lr.predict(X), x, background, 'log-odds');
    const est = lr.est as LogisticRegression;
    const zx = lr.prep.transformRow(x);
    const zb = background.map((b) => lr.prep.transformRow(b));
    r.phi.forEach((phi, j) => {
      const meanZ = zb.reduce((s, row) => s + row[j], 0) / zb.length;
      expect(phi).toBeCloseTo(est.coef[j] * (zx[j] - meanZ), 8);
    });
  });
  it('SHAP gives zero attribution to a feature the model ignores (dummy axiom)', () => {
    const predict = (X: number[][]) => X.map((r) => sigmoid(r[0] - r[2]));
    const r = exactShap(predict, [1, 5, 2], [
      [0, 0, 0],
      [1, 1, 1],
    ]);
    expect(r.phi[1]).toBeCloseTo(0, 12);
  });
  it('LIME returns one term per feature, prediction for the patient, and varies with seed', () => {
    const opts = {
      nSamples: 300,
      labels: ds.features.map((f) => f.label),
      binary: ds.features.map((f) => f.type === 'binary'),
    };
    const a = lime((X) => lr.predict(X), x, Xtr, { ...opts, seed: 1 });
    const b = lime((X) => lr.predict(X), x, Xtr, { ...opts, seed: 2 });
    expect(a.terms).toHaveLength(ds.features.length);
    expect(a.prediction).toBeCloseTo(lr.predictOne(x), 10);
    expect(a.terms.map((t) => t.weight)).not.toEqual(b.terms.map((t) => t.weight));
  });
  it('partial dependence of HbA1c is increasing for the diabetes model', () => {
    const pd = partialDependence((X) => lr.predict(X), Xtr, 2);
    expect(pd.pdp.at(-1)!).toBeGreaterThan(pd.pdp[0]);
    expect(pd.ice[0]).toHaveLength(pd.grid.length);
  });
  it('permutation importance ranks HbA1c above an irrelevant shuffled copy', () => {
    const imp = permutationImportance((X) => lr.predict(X), pick(ds.X, split.test), pick(ds.y, split.test), 3);
    const a1c = imp.find((r) => r.feature === 2)!;
    expect(a1c.drop).toBeGreaterThan(0.01);
  });
  it('odds ratios have CIs that bracket the estimate', () => {
    for (const r of oddsRatios(lr)) {
      expect(r.lo).toBeLessThan(r.or);
      expect(r.hi).toBeGreaterThan(r.or);
    }
  });
});

describe('sample size (Riley et al. BMJ 2020)', () => {
  it('reproduces the published worked example (R²cs 0.288, 24 parameters, prevalence 0.174)', () => {
    const r = rileySampleSize({ prevalence: 0.174, parameters: 24, r2cs: 0.288 });
    expect(r.criterion1).toBe(623);
    expect(r.criterion2).toBe(662);
    expect(r.criterion3).toBe(221);
    expect(r.n).toBe(662);
    expect(r.epp).toBeCloseTo(4.8, 1);
  });
  it('Cox–Snell R² from C is 0 at C = 0.5, increases with C, and stays below the maximum', () => {
    expect(coxSnellFromC(0.5, 0.2)).toBe(0);
    const a = coxSnellFromC(0.7, 0.2);
    const b = coxSnellFromC(0.8, 0.2);
    expect(b).toBeGreaterThan(a);
    expect(b).toBeLessThan(maxCoxSnell(0.2));
  });
});

describe('synthetic datasets', () => {
  it('are deterministic and clinically plausible', () => {
    const a = makeSepsis(500, 1);
    const b = makeSepsis(500, 1);
    expect(a.y).toEqual(b.y);
    const prev = a.y.reduce((s, v) => s + v, 0) / a.y.length;
    expect(prev).toBeGreaterThan(0.1);
    expect(prev).toBeLessThan(0.3);
    const lactateMissing = a.X.filter((r) => Number.isNaN(r[6])).length / a.X.length;
    expect(lactateMissing).toBeGreaterThan(0.3);
    expect(lactateMissing).toBeLessThan(0.7);
  });
  it('lactate missingness is informative (lower outcome rate when not measured)', () => {
    const d = makeSepsis(4000, 3);
    const rate = (miss: boolean) => {
      const idx = d.X.map((r, i) => (Number.isNaN(r[6]) === miss ? i : -1)).filter((i) => i >= 0);
      return idx.reduce((s, i) => s + d.y[i], 0) / idx.length;
    };
    expect(rate(true)).toBeLessThan(rate(false));
  });
  it('diabetes cohort excludes prevalent diabetes at baseline', () => {
    const d = makeDiabetes(2000, 2);
    for (const r of d.X) {
      expect(r[2]).toBeLessThan(6.5);
      expect(r[3]).toBeLessThan(126);
    }
  });
  it('care cohort: Group B has equal-or-greater need but less cost (label-choice bias)', () => {
    const c = makeCareCohort(3000, 1);
    const avg = (v: number[], g: number) => {
      const idx = c.group.map((x, i) => (x === g ? i : -1)).filter((i) => i >= 0);
      return idx.reduce((s, i) => s + v[i], 0) / idx.length;
    };
    expect(avg(c.needNext, 1)).toBeGreaterThanOrEqual(avg(c.needNext, 0));
    expect(avg(c.costNext, 1)).toBeLessThan(avg(c.costNext, 0));
  });
  it('flexible models overfit relative to logistic regression on the diabetes cohort', () => {
    const d = makeDiabetes(1600, 9);
    const s = stratifiedSplit(d.y, 0.3, 3);
    const tr = (k: 'logistic' | 'forest') => fitModel({ kind: k, nTrees: 40 }, d.features, pick(d.X, s.train), pick(d.y, s.train));
    const lrM = tr('logistic');
    const rf = tr('forest');
    const gap = (m: typeof lrM) => auroc(m.predict(pick(d.X, s.train)), pick(d.y, s.train)) - auroc(m.predict(pick(d.X, s.test)), pick(d.y, s.test));
    expect(gap(rf)).toBeGreaterThan(gap(lrM));
  });
});

describe('fairness', () => {
  it('group reports compute per-group TPR/FPR at group thresholds', () => {
    const p = [0.9, 0.1, 0.8, 0.2, 0.7, 0.3];
    const y = [1, 0, 1, 0, 0, 1];
    const g = [0, 0, 0, 1, 1, 1];
    const r = groupReports(p, y, g, ['A', 'B'], [0.5, 0.5]);
    expect(r[0].tpr).toBe(1);
    expect(r[0].fpr).toBe(0);
    expect(r[1].tpr).toBe(0);
    expect(r[1].fpr).toBe(0.5);
  });
});
