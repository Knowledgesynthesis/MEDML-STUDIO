// Synthetic cohorts generated from *known* data-generating processes (DGPs).
// Because the true risk of every synthetic patient is known, learners can check what a model
// recovered versus what was actually true — something real data never allows.
// Parameter values are chosen to be clinically plausible, not to reproduce any specific cohort.

import type { FeatureMeta } from '../ml/preprocess';
import { Rng, clamp, sigmoid } from '../ml/stats';

export interface Dataset {
  id: DatasetId;
  name: string;
  setting: string;
  outcome: string;
  predictionTime: string;
  features: FeatureMeta[];
  X: number[][];
  y: number[];
  /** P(outcome | measured predictors) under the DGP (unmeasured risk integrated out). */
  trueRisk: number[];
  group: number[];
  groupName: string;
  groupLabels: [string, string];
  dgp: string[];
  /** Extra columns used by specific labs. */
  extra: Record<string, number[]>;
}

export type DatasetId = 'sepsis' | 'diabetes';

/** E[σ(η+u)] for u ~ N(0, s²): probit approximation (error < 0.02 on the probability scale). */
const marginalize = (eta: number, s: number) => sigmoid(eta / Math.sqrt(1 + (Math.PI * s * s) / 8));

/* ───────────────────── Sepsis in the emergency department ───────────────────── */

export const SEPSIS_FEATURES: FeatureMeta[] = [
  { key: 'age', label: 'Age', unit: 'y', type: 'continuous', description: 'Age at ED arrival', decimals: 0 },
  { key: 'temp', label: 'Temperature', unit: '°C', type: 'continuous', description: 'First triage temperature. Both fever and hypothermia raise risk (U-shaped).', decimals: 1 },
  { key: 'hr', label: 'Heart rate', unit: '/min', type: 'continuous', description: 'First triage heart rate', decimals: 0 },
  { key: 'rr', label: 'Respiratory rate', unit: '/min', type: 'continuous', description: 'First triage respiratory rate (qSOFA criterion ≥ 22)', decimals: 0 },
  { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', type: 'continuous', description: 'First systolic blood pressure (qSOFA criterion ≤ 100)', decimals: 0 },
  { key: 'wbc', label: 'WBC', unit: '×10⁹/L', type: 'continuous', description: 'White cell count. Leukopenia and leukocytosis both raise risk (U-shaped).', decimals: 1 },
  { key: 'lactate', label: 'Lactate', unit: 'mmol/L', type: 'continuous', description: 'Serum lactate — only measured when a clinician orders it (informative missingness).', decimals: 1 },
  { key: 'altered', label: 'Altered mentation', type: 'binary', description: 'GCS < 15 at triage (qSOFA criterion)' },
];

export interface SepsisSite {
  name: string;
  ageMean: number;
  /** shift in baseline log-odds of the outcome (different case mix / outcome definition) */
  outcomeShift: number;
  /** shift in log-odds that a lactate is ordered; Infinity = protocolised lactate for everyone */
  lactateOrderShift: number;
  /** systematic thermometer offset in °C (e.g. a different device) */
  tempOffset: number;
}

export const HOME_SITE: SepsisSite = { name: 'Development hospital', ageMean: 58, outcomeShift: 0, lactateOrderShift: 0, tempOffset: 0 };

export function makeSepsis(n = 2400, seed = 42, site: SepsisSite = HOME_SITE): Dataset {
  const rng = new Rng(seed);
  const X: number[][] = [];
  const y: number[] = [];
  const trueRisk: number[] = [];
  const group: number[] = [];
  const abxAny: number[] = [];
  const abxAtT0: number[] = [];
  const U_SD = 0.9;
  for (let i = 0; i < n; i++) {
    const z = rng.normal(); // shared acute-illness severity, seen only through the vitals/labs
    const age = clamp(rng.normal(site.ageMean, 18), 18, 98);
    const tempTrue = clamp(37.3 + 0.25 * z + rng.normal(0, 0.85), 34, 41.5);
    const hr = clamp(84 + 11 * z + rng.normal(0, 13), 40, 180);
    const rr = clamp(18 + 2.6 * z + rng.normal(0, 3.2), 8, 45);
    const sbp = clamp(127 - 9 * z + rng.normal(0, 17), 60, 220);
    const wbc = clamp(9 + 2.2 * z + rng.normal(0, 3.6), 0.5, 40);
    const lactate = clamp(Math.exp(rng.normal(Math.log(1.4) + 0.28 * z, 0.38)), 0.3, 15);
    const altered = rng.bernoulli(sigmoid(-2.4 + 0.9 * z + 0.03 * (age - 60)));
    const sex = rng.bernoulli(0.5);
    const eta =
      -2.75 +
      site.outcomeShift +
      0.022 * (age - 60) +
      0.55 * (tempTrue - 37.3) ** 2 +
      0.018 * (hr - 85) +
      0.08 * (rr - 18) -
      0.016 * (sbp - 125) +
      0.01 * (wbc - 9) ** 2 +
      1.0 * Math.log(lactate / 1.4) +
      0.95 * altered;
    const u = rng.normal(0, U_SD);
    const outcome = rng.bernoulli(sigmoid(eta + u));
    const ordered = Number.isFinite(site.lactateOrderShift)
      ? rng.bernoulli(sigmoid(-0.2 + 1.3 * z + 0.9 * altered + site.lactateOrderShift))
      : 1;
    const temp = tempTrue + site.tempOffset;
    X.push([age, temp, hr, rr, sbp, wbc, ordered ? lactate : NaN, altered]);
    y.push(outcome);
    // true risk given measured predictors: lactate's true value is known to the DGP, so this is an upper bound
    trueRisk.push(marginalize(eta, U_SD));
    group.push(sex);
    // IV antibiotics: mostly ordered *after* clinicians recognise sepsis → future information
    const abx = outcome ? rng.bernoulli(0.88) : rng.bernoulli(0.14);
    abxAny.push(abx);
    abxAtT0.push(abx ? rng.bernoulli(0.18) : 0);
  }
  return {
    id: 'sepsis',
    name: 'ED sepsis',
    setting: 'Adults presenting to the emergency department with suspected infection',
    outcome: 'Sepsis (infection + acute rise in SOFA ≥ 2) within 48 h',
    predictionTime: 'Triage: first vital signs and first labs',
    features: SEPSIS_FEATURES,
    X,
    y,
    trueRisk,
    group,
    groupName: 'Sex',
    groupLabels: ['Female', 'Male'],
    dgp: [
      'Outcome generated from a logistic model with U-shaped (quadratic) effects of temperature and WBC and a log-linear effect of lactate.',
      'Lactate is ordered more often in sicker patients, so "not measured" carries prognostic information.',
      'An unmeasured risk factor (SD 0.9 on the log-odds scale) limits the best achievable AUROC.',
      'Sex has no effect on the outcome in this data-generating process.',
    ],
    extra: { abxAny, abxAtT0 },
  };
}

/* ───────────────────── Incident type 2 diabetes in primary care ───────────────────── */

export const DIABETES_FEATURES: FeatureMeta[] = [
  { key: 'age', label: 'Age', unit: 'y', type: 'continuous', description: 'Age at baseline visit', decimals: 0 },
  { key: 'bmi', label: 'BMI', unit: 'kg/m²', type: 'continuous', description: 'Body-mass index', decimals: 1 },
  { key: 'a1c', label: 'HbA1c', unit: '%', type: 'continuous', description: 'Baseline HbA1c (all < 6.5%, i.e. no diabetes at baseline)', decimals: 1 },
  { key: 'fpg', label: 'Fasting glucose', unit: 'mg/dL', type: 'continuous', description: 'Baseline fasting plasma glucose (all < 126 mg/dL)', decimals: 0 },
  { key: 'family', label: 'Family history', type: 'binary', description: 'First-degree relative with type 2 diabetes' },
  { key: 'activity', label: 'Physical activity', unit: 'h/wk', type: 'continuous', description: 'Self-reported moderate-to-vigorous activity', decimals: 1 },
  { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', type: 'continuous', description: 'Seated systolic blood pressure', decimals: 0 },
];

export interface DiabetesOptions {
  /** systematic HbA1c under-reading in Group B (percentage points) — measurement bias */
  a1cBiasB?: number;
}

export function makeDiabetes(n = 2400, seed = 123, opts: DiabetesOptions = {}): Dataset {
  const rng = new Rng(seed);
  const X: number[][] = [];
  const y: number[] = [];
  const trueRisk: number[] = [];
  const group: number[] = [];
  const U_SD = 0.8;
  for (let i = 0; i < n; i++) {
    const g = rng.bernoulli(0.35);
    const age = clamp(rng.normal(52, 10), 35, 70);
    const bmi = clamp(rng.normal(29 + 1.5 * g, 5.5), 18, 55);
    const activity = clamp(Math.exp(rng.normal(Math.log(2.5), 0.7)), 0, 15);
    const family = rng.bernoulli(0.28 + 0.06 * g);
    const sbp = clamp(rng.normal(127 + 0.5 * (age - 52) + 0.6 * (bmi - 29), 14), 90, 200);
    const gly = rng.normal();
    const a1cTrue = clamp(5.45 + 0.22 * gly + 0.012 * (bmi - 29) + 0.006 * (age - 52), 4.3, 6.4);
    const fpg = clamp(95 + 6.5 * gly + 0.5 * (bmi - 29) + rng.normal(0, 5), 70, 125);
    const eta =
      -2.55 +
      0.03 * (age - 52) +
      0.07 * (bmi - 29) +
      1.9 * (a1cTrue - 5.45) +
      0.045 * (fpg - 95) +
      0.55 * family -
      0.1 * (activity - 3) +
      0.006 * (sbp - 127) +
      0.35 * g; // structural factors (access, food environment…) not captured by the predictors
    const outcome = rng.bernoulli(sigmoid(eta + rng.normal(0, U_SD)));
    const a1cObs = clamp(a1cTrue - (g ? opts.a1cBiasB ?? 0 : 0), 4.0, 6.4);
    X.push([age, bmi, a1cObs, fpg, family, activity, sbp]);
    y.push(outcome);
    trueRisk.push(marginalize(eta, U_SD));
    group.push(g);
  }
  return {
    id: 'diabetes',
    name: 'Incident type 2 diabetes',
    setting: 'Primary-care adults aged 35–70 without diabetes at baseline (HbA1c < 6.5%, FPG < 126 mg/dL)',
    outcome: 'New diagnosis of type 2 diabetes within 5 years (ADA criteria)',
    predictionTime: 'Routine baseline visit',
    features: DIABETES_FEATURES,
    X,
    y,
    trueRisk,
    group,
    groupName: 'Population group',
    groupLabels: ['Group A', 'Group B'],
    dgp: [
      'Baseline HbA1c and fasting glucose are restricted to the non-diabetic range, so the model predicts future disease rather than re-detecting current disease (avoids target leakage).',
      'Group B has a higher incidence, partly through measured predictors (BMI, family history) and partly through structural factors not in the data (+0.35 log-odds).',
      'Group membership is not a model input; models therefore tend to under-predict for Group B unless this is checked.',
    ],
    extra: {},
  };
}

/* ───────────────────── Care-management selection (label-choice bias) ───────────────────── */

export interface CareCohort {
  X: number[][];
  features: FeatureMeta[];
  group: number[];
  needNext: number[];
  costNext: number[];
  labelCost: number[];
  labelNeed: number[];
}

export const CARE_FEATURES: FeatureMeta[] = [
  { key: 'age', label: 'Age', unit: 'y', type: 'continuous', description: 'Age', decimals: 0 },
  { key: 'conditions', label: 'Active chronic conditions', type: 'continuous', description: 'Number of active chronic conditions this year', decimals: 0 },
  { key: 'cost', label: 'Healthcare cost this year', unit: '$', type: 'continuous', description: 'Total billed cost this year', decimals: 0 },
  { key: 'ed', label: 'ED visits this year', type: 'continuous', description: 'Emergency department visits', decimals: 0 },
];

/**
 * Mimics the mechanism documented by Obermeyer et al. (Science 2019): Group B generates less cost
 * for the same health need (access barriers), so a model trained to predict cost under-selects Group B.
 */
export function makeCareCohort(n = 3000, seed = 77, accessB = 0.65): CareCohort {
  const rng = new Rng(seed);
  const X: number[][] = [];
  const group: number[] = [];
  const needNext: number[] = [];
  const costNext: number[] = [];
  for (let i = 0; i < n; i++) {
    const g = rng.bernoulli(0.3);
    const age = clamp(rng.normal(55, 14), 18, 95);
    const frailty = rng.normal(0.25 * g + 0.02 * (age - 55), 1);
    const conditions = Math.max(0, Math.round(2 + 1.4 * frailty + rng.normal(0, 0.8)));
    const access = g ? accessB : 1;
    const cost = Math.round(Math.max(200, 2500 * access * Math.exp(0.45 * frailty + rng.normal(0, 0.45))));
    const ed = Math.max(0, Math.round(rng.normal(0.6 + 0.5 * frailty + 0.3 * (1 - access), 0.8)));
    const need = Math.max(0, 2 + 1.5 * frailty + rng.normal(0, 0.9));
    const nextCost = 2800 * access * Math.exp(0.5 * frailty + rng.normal(0, 0.4));
    X.push([age, conditions, cost, ed]);
    group.push(g);
    needNext.push(need);
    costNext.push(nextCost);
  }
  const topQuintile = (v: number[]) => {
    const cut = v.slice().sort((a, b) => b - a)[Math.floor(v.length * 0.2)];
    return v.map((x) => (x > cut ? 1 : 0));
  };
  return { X, features: CARE_FEATURES, group, needNext, costNext, labelCost: topQuintile(costNext), labelNeed: topQuintile(needNext) };
}

export function getDataset(id: DatasetId): Dataset {
  return id === 'sepsis' ? makeSepsis() : makeDiabetes();
}
