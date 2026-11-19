import { Callout } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { CalibrationWidget, ImbalanceWidget } from '@/components/widgets/EvalWidgets';
import type { ModuleDef } from './types';

export const m6: ModuleDef = {
  id: 'm6',
  number: 6,
  title: 'Calibration: can you trust the number?',
  summary: 'Reading calibration plots, the calibration hierarchy, what breaks calibration (overfitting, shift, rebalancing) and how to repair it.',
  minutes: 25,
  objectives: [
    'Read a calibration plot and interpret calibration-in-the-large, slope and O/E.',
    'Explain why poorly calibrated risks harm decisions even when AUROC is high.',
    'Identify overfitting, case-mix and prevalence shift, and rebalancing as causes of miscalibration.',
    'Choose between intercept updating, logistic recalibration and model revision.',
  ],
  sections: [
    {
      id: 'why',
      title: 'Why calibration is the Achilles heel',
      body: (
        <>
          <p>
            Decisions use absolute risk: start a statin above 10% ten-year risk, escalate sepsis care above 10% risk. If a model says 30% when the truth is 15%, patients are
            over-treated, however well it ranks them. Calibration is the most often neglected property of published models <Cite id="vancalster2019" />.
          </p>
          <ul>
            <li>
              <strong>Mean calibration (calibration-in-the-large):</strong> is the average predicted risk equal to the observed rate? Measured by the intercept with the
              logit(p) offset (ideal 0) or by the O/E ratio (ideal 1).
            </li>
            <li>
              <strong>Weak calibration:</strong> intercept 0 and slope 1. A slope below 1 means predictions are too extreme; above 1, too modest.
            </li>
            <li>
              <strong>Moderate calibration:</strong> the calibration curve follows the diagonal. Strong calibration (correct for every covariate pattern) is unattainable in
              practice <Cite id="vancalster2016" />.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'plot',
      title: 'Reading the calibration plot',
      body: (
        <>
          <p>
            Points <strong>above</strong> the diagonal mean observed risk exceeds predicted risk (under-prediction). Points <strong>below</strong> mean over-prediction. Prefer
            flexible (loess or spline) curves with confidence bands to a handful of bins. Show the distribution of predictions as well, because calibration in regions with few
            patients is uncertain.
          </p>
          <CalibrationWidget />
          <Callout kind="pitfall">
            The Hosmer–Lemeshow test is not a calibration assessment. Its result depends on sample size and binning, and it says nothing about the direction or size of
            miscalibration. Show the plot, slope and intercept instead <Cite id="vancalster2019" />.
          </Callout>
        </>
      ),
    },
    {
      id: 'imbalance',
      title: 'Rebalancing the data breaks calibration',
      body: <ImbalanceWidget />,
    },
    {
      id: 'repair',
      title: 'Repairing calibration',
      body: (
        <>
          <ol>
            <li>
              <strong>Re-estimate the intercept</strong> when only the baseline risk differs, for example a new site with higher prevalence.
            </li>
            <li>
              <strong>Logistic recalibration</strong> (re-estimate intercept and slope; Platt scaling is the same idea) when predictions are too extreme or too modest.
            </li>
            <li>
              <strong>Model revision</strong>: re-estimate selected coefficients or refit the model when predictor effects have changed. Isotonic regression is flexible but needs
              large samples <Cite id="janssen2008" />.
            </li>
          </ol>
          <p>Always use local data that the model has not seen, and validate again after updating.</p>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm6q1',
      stem: 'Across the whole risk range, calibration points lie above the diagonal. What does this mean?',
      options: ['The model over-estimates risk', 'The model under-estimates risk', 'Discrimination is poor', 'The model is overfitted'],
      answer: 1,
      rationale: 'Observed (y) exceeds predicted (x): the model under-predicts. A uniform offset suggests updating the intercept.',
    },
    {
      id: 'm6q2',
      stem: 'A model has calibration slope 0.6 at validation. What is the most likely cause?',
      options: ['The outcome was rarer at validation', 'Overfitting at development: predictions are too extreme', 'The model is too simple', 'AUROC is too high'],
      answer: 1,
      rationale: 'A slope below 1 means the spread of predicted log-odds is too wide, the signature of overfitting. Shrinkage and a larger development sample prevent it.',
    },
    {
      id: 'm6q3',
      stem: 'At a new hospital the AUROC is unchanged, but mean predicted risk is 10% versus an observed 18%. What is the most proportionate fix?',
      options: ['Refit a new deep-learning model', 'Re-estimate the intercept (calibration-in-the-large) with local data', 'Lower the threshold to 5% without recalibration', 'Ignore it, since AUROC is unchanged'],
      answer: 1,
      rationale: 'Ranking is preserved and only the baseline is off. Intercept updating is the simplest effective correction (Janssen et al. 2008).',
    },
    {
      id: 'm6q4',
      stem: 'A model was trained after randomly undersampling non-events to a 1:1 ratio, and real prevalence is 15%. What happens to its predicted risks?',
      options: ['They are calibrated', 'They are systematically too high', 'They are systematically too low', 'Only AUROC is affected'],
      answer: 1,
      rationale: 'The model learned an event rate of 50% instead of 15%, so every prediction is inflated. AUROC is essentially unchanged (van den Goorbergh et al. 2022).',
    },
    {
      id: 'm6q5',
      stem: 'Why is the Hosmer–Lemeshow test a poor primary assessment of calibration?',
      options: ['It is too computationally intensive', 'Its p-value depends on sample size and binning and does not show the direction or size of miscalibration', 'It only works for neural networks', 'It measures discrimination'],
      answer: 1,
      rationale: 'In large samples it flags trivial miscalibration; in small samples it misses important miscalibration. Plots plus slope and intercept are informative.',
    },
  ],
  refs: ['vancalster2019', 'vancalster2016', 'vandengoorbergh2022', 'janssen2008'],
};
