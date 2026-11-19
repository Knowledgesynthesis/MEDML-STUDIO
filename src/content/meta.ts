// Lightweight module metadata for navigation and progress (no widget code).
// Kept in sync with the full module definitions by content.test.ts.

export interface ModuleMeta {
  id: string;
  number: number;
  title: string;
  summary: string;
  minutes: number;
}

export const MODULE_META: ModuleMeta[] = [
  { id: 'm1', number: 1, title: 'Prediction in medicine: what models can and cannot do', summary: 'Define a prediction model precisely, separate prediction from causation, see why base rates dominate alerts, and place models in the 2026 regulatory landscape.', minutes: 25 },
  { id: 'm2', number: 2, title: 'Data, outcomes and study design', summary: 'Most failed models fail before any algorithm runs. Fix the prediction time, avoid leakage, respect informative missingness, choose an honest outcome and enough data.', minutes: 30 },
  { id: 'm3', number: 3, title: 'Logistic regression done well', summary: 'The workhorse of clinical prediction: probability, odds and log-odds; odds ratios with confidence intervals; non-linear effects without categorising; shrinkage.', minutes: 30 },
  { id: 'm4', number: 4, title: 'Trees, ensembles and neural networks', summary: 'How CART, random forests, gradient boosting and neural nets learn, what each trades away, and a fair head-to-head against regression on held-out patients.', minutes: 30 },
  { id: 'm5', number: 5, title: 'Discrimination and thresholds', summary: 'What AUROC means and what it ignores, how to choose a threshold from consequences, precision–recall without myths, and why accuracy and F1 mislead.', minutes: 25 },
  { id: 'm6', number: 6, title: 'Calibration: can you trust the number?', summary: 'Reading calibration plots, the calibration hierarchy, what breaks calibration (overfitting, shift, rebalancing) and how to repair it.', minutes: 25 },
  { id: 'm7', number: 7, title: 'Clinical utility and real-world impact', summary: 'Net benefit and decision curves link a model to a decision; impact studies link the decision to patient outcomes; human factors decide whether the link holds.', minutes: 25 },
  { id: 'm8', number: 8, title: 'Explainability: SHAP, LIME, PDP and their limits', summary: 'Compute exact SHAP values, stress-test LIME, read PDP/ICE curves and three importance measures, and learn what explanations can and cannot justify.', minutes: 35 },
  { id: 'm9', number: 9, title: 'Bias, fairness and equity', summary: 'Where bias enters the pipeline, how to audit a model by group, why fairness criteria conflict, and how to reason about race and other group variables.', minutes: 30 },
  { id: 'm10', number: 10, title: 'Deployment, monitoring and appraisal', summary: 'Dataset shift and updating, monitoring after go-live, a 10-question appraisal you can use tomorrow, the 2026 regulatory picture, and LLM-specific risks.', minutes: 35 },
];

export const META_MAP: Record<string, ModuleMeta> = Object.fromEntries(MODULE_META.map((m) => [m.id, m]));

export const PARTS: { title: string; modules: string[] }[] = [
  { title: 'Foundations', modules: ['m1', 'm2'] },
  { title: 'Building models', modules: ['m3', 'm4'] },
  { title: 'Evaluating models', modules: ['m5', 'm6', 'm7'] },
  { title: 'Trust and safety', modules: ['m8', 'm9', 'm10'] },
];
