import { Callout, Formula } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { SigmoidWidget } from '@/components/widgets/Foundations';
import { NonlinearityWidget, OddsRatioWidget } from '@/components/widgets/ModelWidgets';
import type { ModuleDef } from './types';

export const m3: ModuleDef = {
  id: 'm3',
  number: 3,
  title: 'Logistic regression done well',
  summary: 'The workhorse of clinical prediction: probability, odds and log-odds; odds ratios with confidence intervals; non-linear effects without categorising; shrinkage.',
  minutes: 30,
  objectives: [
    'Convert between probability, odds and log-odds and interpret odds ratios per unit and per SD.',
    'Explain why a constant odds ratio implies a non-constant absolute risk difference.',
    'Model non-linear effects with splines or polynomials instead of categorising.',
    'Explain overfitting, shrinkage and why apparent performance is optimistic.',
    'Avoid causal interpretation of prediction-model coefficients.',
  ],
  sections: [
    {
      id: 'model',
      title: 'The model',
      body: (
        <>
          <p>Logistic regression is a regression model for risk. It models the log-odds of the outcome as a weighted sum of predictors:</p>
          <Formula>log(p / (1 − p)) = β₀ + β₁x₁ + β₂x₂ + … + βₖxₖ ⟺ p = 1 / (1 + e^−(β₀ + Σβⱼxⱼ))</Formula>
          <table>
            <thead>
              <tr>
                <th>Probability p</th>
                <th>Odds p/(1−p)</th>
                <th>Log-odds</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>0.11 (1:9)</td>
                <td>−2.20</td>
              </tr>
              <tr>
                <td>20%</td>
                <td>0.25 (1:4)</td>
                <td>−1.39</td>
              </tr>
              <tr>
                <td>50%</td>
                <td>1 (1:1)</td>
                <td>0</td>
              </tr>
              <tr>
                <td>80%</td>
                <td>4 (4:1)</td>
                <td>+1.39</td>
              </tr>
            </tbody>
          </table>
          <SigmoidWidget />
          <Callout kind="pitfall">An odds ratio of 2 is not “twice the risk”. At a baseline risk of 50%, OR 2 gives 67%, not 100%. ORs approximate risk ratios only when the outcome is rare.</Callout>
        </>
      ),
    },
    {
      id: 'coefficients',
      title: 'Reading coefficients',
      body: (
        <>
          <ul>
            <li>
              <strong>Per unit:</strong> e<sup>β</sup> is the odds ratio for a one-unit difference, holding the other predictors fixed. For a k-unit difference it is e<sup>kβ</sup>.
            </li>
            <li>
              <strong>Per SD:</strong> on standardised predictors, ORs are comparable across variables measured in different units.
            </li>
            <li>
              <strong>Uncertainty:</strong> report 95% CIs (here Wald, exp(β ± 1.96·SE)). Wide CIs signal too little data.
            </li>
            <li>
              <strong>Not causal:</strong> each OR is adjusted for the other predictors chosen for prediction, not for the confounders of that predictor’s effect. Reading them as
              treatment effects is the Table 2 fallacy <Cite id="westreich2013" />.
            </li>
          </ul>
          <OddsRatioWidget />
        </>
      ),
    },
    {
      id: 'nonlinear',
      title: 'Do not categorise. Model the curve.',
      body: (
        <>
          <p>
            Splitting a continuous predictor at a cut-off (“fever ≥ 38 °C”) throws away information. It assumes risk is flat within each category and jumps at the boundary{' '}
            <Cite id="altman2006" />. Linearity in the log-odds is an assumption you should check. Restricted cubic splines or fractional polynomials let the data show the shape, for
            example the U-shaped risk of both hypothermia and fever in sepsis.
          </p>
          <NonlinearityWidget />
          <Callout kind="pearl">
            Logistic regression with squared terms recovers the U-shape and matches or beats gradient boosting here, while every term stays inspectable. Flexibility does not
            require a black box.
          </Callout>
        </>
      ),
    },
    {
      id: 'overfitting',
      title: 'Overfitting, optimism and shrinkage',
      body: (
        <>
          <p>
            Maximum-likelihood coefficients fitted on a finite sample are too extreme on average: they fit noise. The result is optimistic apparent performance and, at validation,
            a <strong>calibration slope below 1</strong>, meaning high risks are over-estimated and low risks under-estimated <Cite id="steyerberg2019" />.
          </p>
          <ul>
            <li>Penalised regression (ridge, lasso, elastic net) shrinks coefficients toward zero. This course uses a light ridge penalty.</li>
            <li>
              Penalisation is not a cure for small samples. The amount of shrinkage is itself estimated imprecisely when n is small <Cite id="riley2021pen" />. Collect enough data
              (Module 2).
            </li>
            <li>Choose candidate predictors from clinical knowledge and the literature. Data-driven stepwise selection inflates optimism.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'assumptions',
      title: 'Assumptions that matter for prediction',
      body: (
        <ul>
          <li>
            <strong>Functional form:</strong> non-linear effects and any plausible, pre-specified interactions.
          </li>
          <li>
            <strong>Independence:</strong> repeated encounters per patient or clustering by hospital need patient-level splits and cluster-aware validation, or mixed models.
          </li>
          <li>
            <strong>Separation:</strong> a predictor that perfectly predicts the outcome gives infinite coefficients. Often a sign of leakage.
          </li>
          <li>
            <strong>Collinearity</strong> makes individual coefficients unstable but barely affects predictions. It matters for interpretation, not much for accuracy.
          </li>
        </ul>
      ),
    },
  ],
  quiz: [
    {
      id: 'm3q1',
      stem: 'The coefficient for lactate is 0.4 per mmol/L. What is the odds ratio comparing two patients whose lactate differs by 2 mmol/L (other predictors equal)?',
      options: ['0.8', '1.49', '2.23', '4.0'],
      answer: 2,
      rationale: 'For a k-unit difference the OR is e^(kβ) = e^0.8 ≈ 2.23. e^0.4 ≈ 1.49 is the per-unit OR.',
    },
    {
      id: 'm3q2',
      stem: 'A patient’s baseline risk is 50%. A predictor with OR 2 is present. What is the new risk?',
      options: ['100%', '67%', '75%', '52%'],
      answer: 1,
      rationale: 'Odds go from 1 to 2, so p = 2/(1+2) = 67%. ORs do not multiply probabilities.',
    },
    {
      id: 'm3q3',
      stem: 'Risk of sepsis is higher with both hypothermia and fever. How should temperature enter a logistic model?',
      options: ['As fever yes/no at 38 °C', 'As a single linear term', 'With a flexible form such as a restricted cubic spline (or quadratic) term', 'Excluded, because it is non-linear'],
      answer: 2,
      rationale: 'A linear term cannot represent a U-shape, and dichotomising loses information and misclassifies hypothermia. Splines or polynomials capture it while staying transparent.',
    },
    {
      id: 'm3q4',
      stem: 'At external validation the calibration slope is 0.70. What does this mean?',
      options: ['Predictions are too extreme; this is typical of overfitting', 'Predictions are too moderate', 'The model under-predicts everyone equally', 'Discrimination is 70%'],
      answer: 0,
      rationale: 'A slope below 1 means the spread of predicted log-odds is too wide: high risks are too high and low risks too low. Shrinkage at development and more data help.',
    },
    {
      id: 'm3q5',
      stem: 'In a prognostic model for myocardial infarction, the adjusted OR for “on a statin” is 0.6. What is the correct interpretation?',
      options: [
        'Statins reduce MI odds by 40%',
        'Statin users have lower predicted odds given the other predictors; this is not a causal estimate of statin efficacy',
        'Statins should be removed from the model',
        'The model is miscalibrated',
      ],
      answer: 1,
      rationale: 'Prediction-model coefficients are associational and adjusted for a set of predictors chosen for prediction, not for confounding by indication (the Table 2 fallacy). Efficacy comes from trials.',
    },
  ],
  refs: ['westreich2013', 'altman2006', 'steyerberg2019', 'riley2021pen'],
};
