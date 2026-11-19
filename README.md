# MedML Studio

An interactive, evidence-based course on **clinical prediction models and interpretable machine learning**, for clinicians, trainees and informaticians.

Real models (logistic regression, CART, random forests, gradient boosting, a neural network) train in the browser on synthetic patients whose **true risk is known**, so every lesson can show what a model recovered against what was actually true. Every factual claim links to its primary source (DOI or official page). Content is current to **November 2026**.

## What's inside

| Area | Contents |
| --- | --- |
| **Course** (10 modules, ~5 h) | Prediction vs causation · data, leakage and sample size · logistic regression done well · trees, ensembles and neural nets · discrimination and thresholds · calibration · net benefit and impact evidence · SHAP, LIME, PDP/ICE and their limits · bias and fairness · deployment, monitoring, appraisal and regulation |
| **Labs** | 20 interactive widgets: Bayes/PPV, logistic link, target leakage, informative missingness, Riley sample size, odds-ratio forest plot, non-linearity, tree depth vs overfitting, six-model comparison, threshold explorer, calibration and recalibration, class-imbalance harm, decision curves, exact SHAP, LIME stability, PDP/ICE, three importance measures, group fairness audit, label-choice bias (Obermeyer mechanism), dataset shift and model updating |
| **Case files** | 10 documented real-world deployments (e.g. external validation of a proprietary sepsis model, TREWS, Kaiser AAM, Obermeyer 2019, pulse oximetry, shortcut learning in radiographs, autonomous retinopathy screening), each ending with a decision for the learner |
| **Assessment** | 50 module questions with explanatory feedback (mastery = 80%), 10 case decisions, and a 15-item integrative exam with deferred feedback. Option order is shuffled deterministically so answer position carries no cue. |
| **Toolkit** | 10-question appraisal checklist (TRIPOD+AI / PROBAST+AI), sample-size calculator, threshold and net-benefit calculators, vendor question list |
| **Reference** | 63-term glossary linked to modules; 87 references with DOIs |

## Synthetic data

| Cohort | Population and outcome | Built-in teaching features |
| --- | --- | --- |
| ED sepsis (n = 2,400) | ED adults with suspected infection → Sepsis-3 within 48 h | U-shaped temperature and WBC effects, log-linear lactate, informative lactate missingness, an unmeasured risk factor, a leakage variable (antibiotic orders) |
| Incident type 2 diabetes (n = 2,400) | Primary care, no diabetes at baseline → ADA diagnosis within 5 years | Two population groups with different base rates, optional HbA1c measurement bias |
| Care management (n = 4,000) | Cost versus health-need labels | Reproduces the label-choice mechanism of Obermeyer et al. (Science 2019) |

All generators are seeded, so every user sees identical numbers.

## Engineering

- **Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Zustand 5, vite-plugin-pwa (installable, works offline). Charts are dependency-free responsive SVG.
- **ML engine** (`src/lib/ml`), written from scratch with no ML dependencies:
  - logistic regression by Newton–Raphson/IRLS with ridge penalty and Wald CIs;
  - CART (Gini), random forest (bootstrap + √p features), gradient boosting with second-order leaves, and a one-hidden-layer MLP trained with Adam;
  - AUROC with tie handling, ROC/PR curves, Brier and scaled Brier, calibration intercept and slope, logistic recalibration, net benefit and decision curves, bootstrap CIs;
  - exact interventional Shapley values (all 2ᵖ coalitions), LIME (quartile discretisation, exponential kernel), PDP/ICE, permutation importance;
  - Riley et al. (BMJ 2020) sample-size criteria with Cox–Snell R² derived from a C-statistic.
- **Preprocessing** is fitted on training data only (median imputation + missing indicators, standardisation). Evaluation always uses a held-out stratified 30% test set.

## Quality checks

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 44 unit and content-integrity tests
npm run lint
npm run build      # type-check + production build to dist/
```

The tests cover:
- metric correctness: hand-computed AUROC with ties, ROC-area equivalence, prevalence invariance, net benefit, calibration recovery;
- model behaviour: recovery of known LR coefficients, monotone boosting loss, tree splits;
- SHAP axioms: efficiency, dummy, and the closed form for additive LR;
- LIME seed sensitivity;
- an exact reproduction of the Riley et al. BMJ 2020 worked example (623 / 662 / 221);
- dataset properties: informative missingness, no prevalent diabetes, label-bias direction;
- content integrity: every citation resolves, every quiz answer index is valid, navigation metadata matches the modules, answer positions are balanced.

Before release, every route was also crawled at desktop and phone width with Playwright (no console errors, no horizontal overflow) and scanned with axe-core for WCAG 2.2 AA in light and dark themes.

## Project structure

```
src/
  lib/ml/          models, metrics, explainers, fairness, sample size (+ tests)
  lib/data/        seeded synthetic cohorts with known data-generating processes
  lib/lab.ts       shared cohort/model cache and async compute hook
  components/      UI primitives, SVG charts, quiz and citation components, widgets
  content/         modules (m1–m10), cases, exam, glossary, references
  pages/           Home, Course, Module, Labs, Case files, Toolkit, Exam, Glossary, References
```

Routing is hash-based (`#/learn/m3`), so the build runs on any static host. Old v1 links such as `#module-3` and `#datasets` redirect to the new pages.

## Scope

All patient data are synthetic. The app teaches how to build, evaluate and appraise prediction models. It is not a clinical decision tool.

## Author

Built by Bashar Hasan, MD.
