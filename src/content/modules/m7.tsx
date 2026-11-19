import { Callout, Formula } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { DcaWidget } from '@/components/widgets/EvalWidgets';
import type { ModuleDef } from './types';

export const m7: ModuleDef = {
  id: 'm7',
  number: 7,
  title: 'Clinical utility and real-world impact',
  summary: 'Net benefit and decision curves link a model to a decision; impact studies link the decision to patient outcomes; human factors decide whether the link holds.',
  minutes: 25,
  objectives: [
    'Compute net benefit and read a decision curve against treat-all and treat-none.',
    'Translate a threshold probability into an explicit harm–benefit trade-off.',
    'Distinguish accuracy studies from impact studies and rank evidence designs.',
    'Describe automation bias and what does and does not mitigate it.',
  ],
  sections: [
    {
      id: 'nb',
      title: 'Net benefit',
      body: (
        <>
          <p>Net benefit counts true positives and charges each false positive at the exchange rate implied by the threshold probability pₜ <Cite id="vickers2006" />:</p>
          <Formula>NB = TP/n − FP/n × pₜ/(1 − pₜ)   Treat all: NB = prevalence − (1 − prevalence) × pₜ/(1 − pₜ)   Treat none: NB = 0</Formula>
          <p>
            A model is useful at pₜ only if its net benefit exceeds both default strategies. A decision curve plots NB across the range of thresholds that clinicians would
            plausibly use. Only that range matters <Cite id="vickers2019" />.
          </p>
          <DcaWidget />
        </>
      ),
    },
    {
      id: 'impact',
      title: 'Accuracy is not impact',
      body: (
        <>
          <p>A model improves outcomes only if its alerts change actions and those actions help. Evidence typically builds in stages:</p>
          <ol>
            <li>retrospective development and external validation (TRIPOD+AI) <Cite id="tripodai2024" />;</li>
            <li>silent prospective running, with no alerts shown, to check performance and alert burden locally;</li>
            <li>early live clinical evaluation of usability, safety and workflow (DECIDE-AI) <Cite id="decideai2022" />;</li>
            <li>comparative impact studies: cluster or stepped-wedge randomised trials where feasible (CONSORT-AI) <Cite id="consortai2020" />.</li>
          </ol>
          <Callout kind="evidence" title="Evidence from deployed deterioration and sepsis systems">
            <p>
              <strong>Kaiser Permanente Advance Alert Monitor</strong> (21 hospitals, staggered roll-out). Alerts went to remote nurses who activated rapid-response workflows.
              30-day mortality after an alert was 15.8% versus 20.4% in comparison patients (adjusted relative risk 0.84) <Cite id="escobar2020" />. The intervention was the
              model plus a staffed workflow.
            </p>
            <p>
              <strong>TREWS</strong> (5 hospitals, 590,736 monitored patients). Among sepsis patients whose alert was confirmed by a clinician within 3 h, adjusted in-hospital
              mortality was 3.3 percentage points lower (18.7% relative) than when it was not <Cite id="adams2022" />. This was an observational comparison. Clinicians who act
              promptly may differ in other ways.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'human',
      title: 'Human factors: automation bias',
      body: (
        <>
          <ul>
            <li>
              In a randomised vignette study of 457 hospital clinicians, systematically biased model predictions reduced diagnostic accuracy by 11.3 percentage points from a
              73% baseline. Image-based explanations did not significantly mitigate the harm <Cite id="jabbour2023" />.
            </li>
            <li>
              In mammography, incorrect AI BI-RADS suggestions lowered the accuracy of inexperienced readers from about 80% to 20%. Even very experienced readers fell to about
              46% <Cite id="dratsch2023" />.
            </li>
            <li>
              In a randomised trial, giving physicians a large language model did not significantly improve diagnostic reasoning (76% vs 74%) <Cite id="goh2024" />. Access to a
              tool is not the same as benefit from it.
            </li>
          </ul>
          <Callout kind="rule">
            Design for appropriate reliance. Show calibrated risk with its uncertainty, explain the model's intended use and known failure modes, train users, track overrides, and
            audit outcomes, not only clicks.
          </Callout>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm7q1',
      stem: 'At pₜ = 20%, a model in 100 patients yields 15 true positives and 20 false positives. What is its net benefit?',
      options: ['0.15', '0.10', '0.05', '0.35'],
      answer: 1,
      rationale: 'NB = 15/100 − 20/100 × (0.2/0.8) = 0.15 − 0.05 = 0.10, equivalent to finding 10 true cases per 100 patients with no false positives.',
    },
    {
      id: 'm7q2',
      stem: 'A decision curve shows the model below “treat all” for thresholds of 1–5%. What does that mean?',
      options: ['The model is miscalibrated', 'If your threshold is in that range, treating everyone is the better strategy', 'The model has low AUROC', 'Net benefit is always negative'],
      answer: 1,
      rationale: 'At low thresholds false positives are cheap. Treating all beats selective treatment unless the model is near-perfect.',
    },
    {
      id: 'm7q3',
      stem: 'Which design gives the strongest evidence that a sepsis alert system reduces mortality?',
      options: ['Retrospective AUROC in 1 million patients', 'A cluster or stepped-wedge randomised trial of the alert plus response workflow', 'Clinician satisfaction survey', 'A before–after comparison of a single ward'],
      answer: 1,
      rationale: 'Only a randomised comparison of the complete intervention protects against confounding and secular trends. Accuracy studies do not measure impact.',
    },
    {
      id: 'm7q4',
      stem: 'What did Jabbour et al. (JAMA 2023) find about explanations for systematically biased models?',
      options: ['Explanations fully prevented harm', 'Explanations did not significantly mitigate the drop in clinician accuracy', 'Clinicians ignored all AI predictions', 'Biased models improved accuracy'],
      answer: 1,
      rationale: 'Accuracy fell by about 11 points with biased predictions, and image-based explanations did not significantly reduce that harm.',
    },
    {
      id: 'm7q5',
      stem: 'Choosing a threshold probability of 25% implies you are willing to accept…',
      options: ['25 false positives per true positive', '3 unnecessary interventions per true case treated', '1 false positive per 4 patients', 'No false positives'],
      answer: 1,
      rationale: 'pₜ/(1−pₜ) = 0.25/0.75 = 1/3: one true positive is worth three false positives.',
    },
  ],
  refs: ['vickers2006', 'vickers2019', 'tripodai2024', 'decideai2022', 'consortai2020', 'escobar2020', 'adams2022', 'jabbour2023', 'dratsch2023', 'goh2024'],
};
