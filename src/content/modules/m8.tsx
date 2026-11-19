import { Callout, Formula } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { ImportanceWidget, LimeWidget, PdpWidget, ShapWidget } from '@/components/widgets/ExplainWidgets';
import type { ModuleDef } from './types';

export const m8: ModuleDef = {
  id: 'm8',
  number: 8,
  title: 'Explainability: SHAP, LIME, PDP and their limits',
  summary: 'Compute exact SHAP values, stress-test LIME, read PDP/ICE curves and three importance measures, and learn what explanations can and cannot justify.',
  minutes: 35,
  objectives: [
    'Distinguish intrinsically interpretable models from post-hoc explanations.',
    'Interpret SHAP values: base value, additivity, output scale, background data.',
    'Explain how LIME works and demonstrate its instability.',
    'Use PDP/ICE and permutation importance; recognise impurity-importance bias.',
    'State why explanations are not causal and cannot certify that a model is safe.',
  ],
  sections: [
    {
      id: 'interpretable',
      title: 'Interpretable by design versus explained after the fact',
      body: (
        <>
          <p>
            An <strong>interpretable</strong> model is its own explanation: an additive score, a short rule list, a logistic model with splines. A <strong>post-hoc explanation</strong>{' '}
            is a second model or approximation describing a first one, and it can be wrong about it. For high-stakes decisions, prefer interpretable models whenever performance is
            comparable <Cite id="rudin2019" />, and on tabular data it usually is (Module 4).
          </p>
          <Callout kind="evidence">
            An intelligible additive model of pneumonia mortality made the “asthma is protective” artefact visible, so it could be removed before deployment. The equally accurate
            neural network hid it <Cite id="caruana2015" />.
          </Callout>
        </>
      ),
    },
    {
      id: 'shap',
      title: 'SHAP: fair credit assignment from game theory',
      body: (
        <>
          <p>
            Shapley values split the gap between this patient’s prediction and the average prediction among the features. Each feature’s value is its average marginal
            contribution over all possible orders of adding features <Cite id="lundberg2017" />:
          </p>
          <Formula>f(x) = φ₀ + Σⱼ φⱼ   where φ₀ = E[f(X)] (base value over the background data)</Formula>
          <ul>
            <li>
              <strong>Efficiency:</strong> contributions sum exactly to f(x) − φ₀. <strong>Dummy:</strong> a feature the model ignores gets 0. <strong>Symmetry</strong> and{' '}
              <strong>additivity</strong> complete the axioms.
            </li>
            <li>
              <strong>“Absent” features are filled from background patients</strong> (interventional SHAP). The explanation therefore depends on the background you choose, and
              with correlated features it evaluates impossible patients <Cite ids={['janzing2020', 'kumar2020']} />.
            </li>
            <li>
              <strong>Scale matters:</strong> contributions in probability units are not additive in log-odds, and vice versa. Always state the scale.
            </li>
            <li>
              Exact computation needs 2ᵖ coalitions. TreeSHAP is exact and fast for trees <Cite id="lundberg2020" />, and KernelSHAP approximates by sampling. This app enumerates
              all coalitions exactly.
            </li>
          </ul>
          <ShapWidget />
          <Callout kind="pitfall">SHAP explains the model, not the patient. “Lactate pushed the risk up by 9 points” describes model behaviour. It does not mean lowering this patient's lactate would lower their risk.</Callout>
        </>
      ),
    },
    {
      id: 'lime',
      title: 'LIME: a local linear surrogate',
      body: (
        <>
          <p>
            LIME perturbs the patient’s features, scores the perturbed points with the model, weights them by closeness to the patient, and fits a weighted linear model whose
            coefficients form the explanation <Cite id="ribeiro2016" />. The answer depends on sampling, kernel width and discretisation, so explanations of the same prediction
            can differ between runs <Cite id="alvarezmelis2018" />. A model can even be built to look fair to LIME and SHAP while discriminating on real inputs{' '}
            <Cite id="slack2020" />.
          </p>
          <LimeWidget />
        </>
      ),
    },
    {
      id: 'global',
      title: 'Global views: response curves and importance',
      body: (
        <>
          <p>
            <strong>Partial dependence</strong> shows the average prediction as one feature varies <Cite id="friedman2001" />. <strong>ICE</strong> curves show it per patient, and
            curves that fan out reveal interactions <Cite id="goldstein2015" />. With correlated predictors, prefer accumulated local effects <Cite id="apley2020" />.
          </p>
          <PdpWidget />
          <p>
            <strong>Permutation importance</strong> measures how much held-out performance drops when a feature is shuffled <Cite id="fisher2019" />. Impurity-based importance from
            trees is computed on training data and favours continuous variables with many split points <Cite id="strobl2007" />.
          </p>
          <ImportanceWidget />
        </>
      ),
    },
    {
      id: 'limits',
      title: 'What explanations can and cannot do',
      body: (
        <>
          <p>
            Current local explanation methods cannot reliably tell a clinician whether <em>this</em> prediction is right. Rigorous validation, not explanation, is what earns trust{' '}
            <Cite id="ghassemi2021" />. Explanations also failed to protect clinicians from biased models in a randomised study <Cite id="jabbour2023" />.
          </p>
          <table>
            <thead>
              <tr>
                <th>Good uses</th>
                <th>Not valid uses</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Debugging and detecting shortcuts. COVID-19 radiograph models were found to rely on text markers and laterality tokens <Cite id="degrave2021" />.</td>
                <td>Inferring causal effects or choosing a treatment for an individual</td>
              </tr>
              <tr>
                <td>Checking that global behaviour matches clinical knowledge</td>
                <td>Certifying that a model is safe or fair</td>
              </tr>
              <tr>
                <td>Auditing subgroup behaviour and model updates</td>
                <td>Reassuring a clinician that an individual prediction is correct</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm8q1',
      stem: 'Base value is 18% (probability scale). For one patient, SHAP gives lactate +9 points, age −2 points, and all other features together +3 points. What is the model’s prediction?',
      options: ['18%', '27%', '28%', '30%'],
      answer: 2,
      rationale: 'Efficiency: f(x) = φ₀ + Σφ = 18 + 9 − 2 + 3 = 28%.',
    },
    {
      id: 'm8q2',
      stem: 'Which property is guaranteed by SHAP’s efficiency axiom?',
      options: ['Contributions are causal effects', 'Contributions sum to the prediction minus the base value', 'Contributions are stable across background datasets', 'Correlated features get equal credit'],
      answer: 1,
      rationale: 'Efficiency (local accuracy) guarantees additivity to f(x) − E[f(X)]. It guarantees nothing about causality or robustness to background choice.',
    },
    {
      id: 'm8q3',
      stem: 'LIME’s top feature for the same patient changes across runs with different random seeds. What follows?',
      options: ['LIME is working as intended; pick the run you like', 'The explanation is unstable and cannot be relied on for this patient without robustness checks', 'The model is miscalibrated', 'Increase the threshold'],
      answer: 1,
      rationale: 'Instability across seeds or kernel widths is a known failure mode (Alvarez-Melis & Jaakkola 2018). Report sensitivity analyses or use exact or intrinsic methods.',
    },
    {
      id: 'm8q4',
      stem: 'A random forest’s impurity importance ranks a pure-noise continuous variable highly. Why?',
      options: ['The variable is secretly causal', 'Impurity importance is computed on training data and favours variables with many possible split points; use permutation importance on held-out data', 'The forest has too few trees', 'SHAP was not used'],
      answer: 1,
      rationale: 'Strobl et al. (2007) documented this bias. Held-out permutation importance does not reward fitting noise.',
    },
    {
      id: 'm8q5',
      stem: 'SHAP shows that “lactate not measured” lowers predicted sepsis risk. What is the right interpretation?',
      options: ['Avoid ordering lactate to keep risk low', 'The model has learned clinician ordering behaviour as a proxy for concern; check robustness to practice changes', 'Lactate is irrelevant to sepsis', 'SHAP is broken'],
      answer: 1,
      rationale: 'The model is reporting that untested patients were usually less sick. That is a proxy for clinician judgement, not a modifiable risk factor, and it will break if ordering practices change.',
    },
  ],
  refs: ['rudin2019', 'caruana2015', 'lundberg2017', 'janzing2020', 'kumar2020', 'lundberg2020', 'ribeiro2016', 'alvarezmelis2018', 'slack2020', 'friedman2001', 'goldstein2015', 'apley2020', 'fisher2019', 'strobl2007', 'ghassemi2021', 'jabbour2023', 'degrave2021'],
};
