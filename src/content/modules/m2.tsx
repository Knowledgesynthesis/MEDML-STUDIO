import { Callout } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { LeakageWidget, MissingnessWidget, SampleSizeWidget } from '@/components/widgets/DataWidgets';
import type { ModuleDef } from './types';

export const m2: ModuleDef = {
  id: 'm2',
  number: 2,
  title: 'Data, outcomes and study design',
  summary: 'Most failed models fail before any algorithm runs. Fix the prediction time, avoid leakage, respect informative missingness, choose an honest outcome and enough data.',
  minutes: 30,
  objectives: [
    'Define prediction time and horizon, and detect target leakage.',
    'Explain why EHR missingness is informative and choose a strategy that works at deployment.',
    'Choose clinically valid outcome definitions and recognise proxy labels.',
    'Calculate a minimum development sample size with the Riley criteria.',
    'Rank validation designs from apparent to external and prospective.',
  ],
  sections: [
    {
      id: 'question',
      title: 'Start from the decision, not the data',
      body: (
        <>
          <p>Write the question before touching the data. The decision determines who is eligible, when the prediction is made, and what counts as the outcome:</p>
          <ul>
            <li>
              <strong>Population and setting:</strong> who receives a prediction. Exclude patients who already have the outcome at prediction time.
            </li>
            <li>
              <strong>Prediction time:</strong> the exact moment the model runs. Only information recorded <em>before</em> that moment may be used.
            </li>
            <li>
              <strong>Outcome and horizon:</strong> a clinically meaningful, consistently measured event. For sepsis, use Sepsis-3: suspected infection plus an acute SOFA rise of ≥ 2{' '}
              <Cite id="singer2016" />. SOFA-2 (JAMA 2025) updated the organ-dysfunction components for current practice <Cite id="ranzani2025" />. For diabetes, use the ADA
              criteria: HbA1c ≥ 6.5%, fasting glucose ≥ 126 mg/dL, 2-h OGTT ≥ 200 mg/dL, or random glucose ≥ 200 mg/dL with symptoms <Cite id="ada2026" />.
            </li>
          </ul>
          <Callout kind="evidence">
            The 2026 Surviving Sepsis Campaign guideline recommends <strong>against qSOFA as a single screening tool</strong> compared with SIRS, NEWS or MEWS, because of its
            low sensitivity <Cite id="ssc2026" />. A good model for a bad task is still a bad tool: be clear whether you are building a screen (high sensitivity) or a severity
            estimate.
          </Callout>
          <Callout kind="pitfall" title="A mistake this app used to make">
            Version 1 of MedML Studio predicted “type 2 diabetes diagnosis” from HbA1c and fasting glucose, the very tests that define the diagnosis. That is circular. The current
            cohort predicts <em>5-year incidence</em> among adults without diabetes at baseline.
          </Callout>
        </>
      ),
    },
    {
      id: 'leakage',
      title: 'Target leakage: information from the future',
      body: (
        <>
          <p>Leakage gives retrospectively excellent and prospectively useless models. The common forms are:</p>
          <ul>
            <li>predictors recorded after the prediction time, such as antibiotic orders, ICU transfer or diagnosis codes assigned at discharge;</li>
            <li>predictors that are part of the outcome definition;</li>
            <li>preprocessing (imputation, scaling, feature selection) fitted on all data before splitting;</li>
            <li>the same patient appearing in both training and test sets because the split was by encounter, not by patient;</li>
            <li>random splits of data with strong time trends. Use temporal validation instead.</li>
          </ul>
          <LeakageWidget />
        </>
      ),
    },
    {
      id: 'missingness',
      title: 'Missing data is information',
      body: (
        <>
          <p>
            In EHR data a test exists because a clinician decided to order it. The fact and timing of a test order often carry prognostic information independent of the result{' '}
            <Cite id="agniel2018" />.
          </p>
          <MissingnessWidget />
          <ul>
            <li>
              <strong>Complete-case analysis</strong> (dropping patients with any missing value) is the worst default. It biases estimates when missingness is informative, and the
              model cannot score the patients it excluded.
            </li>
            <li>
              <strong>Imputation</strong> must be reproducible at deployment. Fit it on training data only and apply the same rules to new patients. Multiple imputation is the
              standard for estimating effects, but deployed prediction models need a single deterministic imputation rule.
            </li>
            <li>
              <strong>Missing indicators</strong> capture informative missingness. They also tie performance to local ordering habits, so test robustness to practice changes.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'labels',
      title: 'Is the label the thing you care about?',
      body: (
        <>
          <p>
            EHR outcomes are often proxies: billing codes, “clinician diagnosed sepsis”, cost, or readmission to <em>this</em> hospital. Proxies inherit the biases of how care is
            delivered and recorded. The best-known example is a commercial population-health algorithm that predicted future <em>cost</em> as a proxy for health <em>need</em>.
            Because less was spent on Black patients with the same illness burden, the algorithm systematically under-selected them <Cite id="obermeyer2019" />. You will reproduce
            this mechanism in Module 9.
          </p>
        </>
      ),
    },
    {
      id: 'samplesize',
      title: 'How much data? Not “10 events per variable”',
      body: (
        <>
          <p>
            The 10-events-per-variable rule has no sound basis and can be far too lenient <Cite id="vansmeden2019" />. Riley et al. derived criteria that target the things that
            actually go wrong in small samples: overfitting (shrinkage), optimism, and an imprecise overall risk <Cite ids={['riley2020', 'riley2021c']} />.
          </p>
          <SampleSizeWidget />
          <p>
            External validation also needs a sample-size calculation. Precise estimates of calibration commonly require several hundred events, more than the older “100 events”
            rule of thumb <Cite id="riley2024b" />.
          </p>
        </>
      ),
    },
    {
      id: 'validation',
      title: 'Validation: from apparent to prospective',
      body: (
        <>
          <ol>
            <li>
              <strong>Apparent</strong> (same data): always optimistic. Never report it alone.
            </li>
            <li>
              <strong>Internal</strong>: bootstrap optimism correction or cross-validation. A single random split wastes data and gives unstable estimates when n is small{' '}
              <Cite id="collins2024" />. This app uses a single 70/30 stratified split so you can see the held-out patients directly.
            </li>
            <li>
              <strong>Temporal</strong>: train on earlier years, test on later ones.
            </li>
            <li>
              <strong>External</strong>: different hospitals or regions, ideally by independent investigators <Cite id="riley2024" />.
            </li>
            <li>
              <strong>Prospective / impact</strong>: silent deployment first, then a trial of the model plus the workflow (Module 7).
            </li>
          </ol>
          <Callout kind="rule">Report development and validation with TRIPOD+AI. Appraise others' models with PROBAST+AI, which now asks explicitly about leakage and dataset shift.</Callout>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm2q1',
      stem: 'A septic-shock model meant for triage includes “vasopressor started at any time during the encounter”. Its retrospective AUROC is 0.95. What is the problem?',
      options: ['Overfitting due to too many trees', 'Target leakage: the predictor is recorded after the prediction time and partly defines the outcome', 'Class imbalance', 'Nothing; vasopressors are a valid severity marker'],
      answer: 1,
      rationale: 'Vasopressor initiation occurs after, and is part of, septic shock. At triage the variable does not yet exist, so prospective performance will collapse, as Kamran et al. (2024) showed for antibiotic- and culture-related signals.',
    },
    {
      id: 'm2q2',
      stem: 'The indicator “lactate not measured” has an odds ratio of 0.5 in your model. What is the most important practical consequence?',
      options: [
        'Clinicians should stop ordering lactate to lower patients’ risk.',
        'The model partly encodes clinician ordering behaviour, so performance may change if lactate ordering becomes protocolised.',
        'Missing indicators are always invalid and must be removed.',
        'Lactate has no prognostic value.',
      ],
      answer: 1,
      rationale: 'Missingness is informative because sicker patients get tested. The indicator is legitimate for prediction, but it ties the model to local practice. Test robustness and monitor for practice changes.',
    },
    {
      id: 'm2q3',
      stem: 'Riley et al.’s sample-size criteria primarily ensure that…',
      options: ['the model reaches AUROC > 0.8', 'there are at least 10 events per variable', 'expected shrinkage is small (≥ 0.9), optimism in fit is limited, and overall risk is estimated precisely', 'the dataset is balanced 1:1'],
      answer: 2,
      rationale: 'The criteria target overfitting and precision directly. Events per parameter becomes an output of the calculation, not a rule.',
    },
    {
      id: 'm2q4',
      stem: 'Which evaluation gives the strongest evidence that a model will work in your hospital next year?',
      options: ['Apparent performance on the training data', '10-fold cross-validation at the development site', 'External validation in a different health system and later time period, ideally followed by local silent-mode testing', 'A larger number of trees'],
      answer: 2,
      rationale: 'Transportability needs evidence from different settings and times. Internal validation estimates optimism but not the effect of dataset shift.',
    },
    {
      id: 'm2q5',
      stem: 'A cross-sectional model predicts “type 2 diabetes diagnosis” from HbA1c and fasting glucose with AUROC 0.98. Why is this misleading?',
      options: ['AUROC cannot exceed 0.95', 'The outcome is defined by the predictors (circularity). Predict incident disease in people without diabetes at baseline instead.', 'HbA1c is not associated with diabetes', 'The model needed SMOTE'],
      answer: 1,
      rationale: 'ADA diagnostic criteria use HbA1c and fasting glucose. A model that re-detects the defining test result answers no clinical question.',
    },
  ],
  refs: ['singer2016', 'ranzani2025', 'ada2026', 'ssc2026', 'kamran2024', 'agniel2018', 'obermeyer2019', 'vansmeden2019', 'riley2020', 'riley2021c', 'riley2024b', 'collins2024', 'riley2024', 'tripodai2024', 'probastai2025'],
};
