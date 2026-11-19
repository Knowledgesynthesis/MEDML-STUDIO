import { Callout, Formula } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { ModelComparisonWidget, TreeDepthWidget } from '@/components/widgets/ModelWidgets';
import type { ModuleDef } from './types';

export const m4: ModuleDef = {
  id: 'm4',
  number: 4,
  title: 'Trees, ensembles and neural networks',
  summary: 'How CART, random forests, gradient boosting and neural nets learn, what each trades away, and a fair head-to-head against regression on held-out patients.',
  minutes: 30,
  objectives: [
    'Compute Gini impurity and explain how a tree chooses splits.',
    'Explain why deep trees overfit and how bagging and boosting address variance and bias.',
    'Run a fair comparison on held-out data: discrimination, calibration and the train–test gap.',
    'Identify settings where flexible models are worth their opacity.',
  ],
  sections: [
    {
      id: 'trees',
      title: 'Decision trees (CART)',
      body: (
        <>
          <p>
            A tree repeatedly splits patients on one predictor at a time. It chooses the split that most reduces impurity. For binary outcomes, Gini impurity of a node with event
            proportion p is:
          </p>
          <Formula>Gini = 1 − p² − (1 − p)² = 2p(1 − p)   e.g. 30 events in 100: 1 − 0.09 − 0.49 = 0.42</Formula>
          <p>
            Each leaf predicts its event proportion, so risk estimates are <strong>step functions</strong>. Trees capture interactions automatically and are readable when shallow.
            They are also <strong>unstable</strong>: small changes in the data can produce a different tree.
          </p>
          <TreeDepthWidget />
        </>
      ),
    },
    {
      id: 'forest',
      title: 'Random forests: average many noisy trees',
      body: (
        <p>
          A random forest grows hundreds of deep trees, each on a bootstrap sample and considering a random subset of predictors (√p) at each split. Averaging decorrelated,
          high-variance trees reduces variance <Cite id="breiman2001" />. The price is that no single rule set explains a prediction. Forest probabilities are often too moderate
          (calibration slope &gt; 1), and impurity-based importance is biased toward continuous predictors <Cite id="strobl2007" />.
        </p>
      ),
    },
    {
      id: 'boosting',
      title: 'Gradient boosting: add small trees that fix the residual error',
      body: (
        <>
          <p>
            Boosting starts from the overall log-odds and adds shallow trees one at a time. Each tree fits the gradient of the log-loss of the current model, scaled by a learning
            rate <Cite ids={['friedman2001', 'chen2016']} />. It is the strongest general-purpose learner for tabular data <Cite id="grinsztajn2022" />. It is also easy to overfit:
            too many rounds produce over-confident risks (slope &lt; 1). Early stopping on validation data is essential.
          </p>
        </>
      ),
    },
    {
      id: 'nn',
      title: 'Neural networks',
      body: (
        <p>
          Layers of weighted sums with non-linear activations can approximate almost any function, given enough data. They dominate for images, waveforms and text; diabetic
          retinopathy grading from fundus photographs is a landmark example <Cite id="gulshan2016" />. On small tabular datasets they rarely beat regression or boosting, need
          careful scaling and tuning, and have no intrinsic interpretability.
        </p>
      ),
    },
    {
      id: 'compare',
      title: 'A fair head-to-head',
      body: (
        <>
          <p>All models below were trained on the same 70% of patients and evaluated on the same untouched 30%. Look at three things:</p>
          <ol>
            <li>the gap between training and test AUROC, which is optimism;</li>
            <li>whether test-set differences exceed their confidence intervals;</li>
            <li>calibration slope and intercept, not only AUROC.</li>
          </ol>
          <ModelComparisonWidget />
          <Callout kind="rule">
            Prefer the simplest model whose held-out discrimination, calibration and net benefit are within noise of the best. Report every model you tried, not only the winner.
            Selective reporting is a recognised source of bias in PROBAST+AI <Cite id="probastai2025" />.
          </Callout>
          <Callout kind="evidence">
            These synthetic results mirror the literature. Well-specified regression matches flexible learners on tabular clinical data <Cite id="christodoulou2019" />, and the
            flexible models show much larger train–test gaps.
          </Callout>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm4q1',
      stem: 'A tree node contains 100 patients, 30 with the outcome. What is its Gini impurity?',
      options: ['0.30', '0.42', '0.21', '0.58'],
      answer: 1,
      rationale: 'Gini = 1 − 0.3² − 0.7² = 1 − 0.09 − 0.49 = 0.42, equivalently 2 × 0.3 × 0.7.',
    },
    {
      id: 'm4q2',
      stem: 'A random forest has training AUROC 0.97 and test AUROC 0.74. What is the main issue?',
      options: ['Underfitting', 'Overfitting: apparent performance is heavily optimistic', 'Label noise only in the test set', 'The test set is too large'],
      answer: 1,
      rationale: 'Deep trees memorise training patients. Only held-out (or optimism-corrected) estimates are meaningful.',
    },
    {
      id: 'm4q3',
      stem: 'How does a random forest mainly improve on a single deep tree?',
      options: ['It removes bias by fitting residuals', 'Averaging many decorrelated high-variance trees reduces variance', 'It makes every prediction interpretable', 'It requires fewer data'],
      answer: 1,
      rationale: 'Bagging plus random feature subsets decorrelates the trees, and averaging them reduces variance. Boosting is the method that reduces bias by fitting residual gradients.',
    },
    {
      id: 'm4q4',
      stem: 'Which task most favours a deep neural network over logistic regression?',
      options: ['30-day readmission from 12 tabular variables in 2,000 patients', 'Detecting diabetic retinopathy from fundus photographs with >100,000 labelled images', 'Estimating stroke risk from CHA₂DS₂-VASc components', 'Predicting AKI from 5 laboratory values'],
      answer: 1,
      rationale: 'Neural networks excel with high-dimensional unstructured inputs and very large labelled datasets. Small tabular problems rarely benefit.',
    },
    {
      id: 'm4q5',
      stem: 'On held-out data: GBM AUROC 0.752 (95% CI 0.71–0.79), slope 0.80; LR AUROC 0.747 (0.70–0.79), slope 0.99. Which choice is most defensible?',
      options: ['GBM, because its AUROC is higher', 'LR, because discrimination is equivalent within noise and it is better calibrated and transparent', 'Neither model can be used', 'Average the two AUROCs'],
      answer: 1,
      rationale: 'A 0.005 AUROC difference is well within uncertainty. Calibration and transparency favour LR unless decision-curve analysis shows a clinically relevant advantage for GBM.',
    },
  ],
  refs: ['breiman2001', 'strobl2007', 'friedman2001', 'chen2016', 'grinsztajn2022', 'gulshan2016', 'probastai2025', 'christodoulou2019'],
};
