import { Callout, Formula } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { ThresholdWidget } from '@/components/widgets/EvalWidgets';
import type { ModuleDef } from './types';

export const m5: ModuleDef = {
  id: 'm5',
  number: 5,
  title: 'Discrimination and thresholds',
  summary: 'What AUROC means and what it ignores, how to choose a threshold from consequences, precision–recall without myths, and why accuracy and F1 mislead.',
  minutes: 25,
  objectives: [
    'Interpret AUROC as a concordance probability and state what it cannot tell you.',
    'Derive a threshold from the relative harms of false positives and false negatives.',
    'Compute sensitivity, specificity, PPV, NPV and alerts per true case at a threshold.',
    'Explain when precision–recall curves help and why “AUPRC for imbalance” is a myth.',
    'Recognise improper headline measures such as accuracy and F1.',
  ],
  sections: [
    {
      id: 'auroc',
      title: 'AUROC is a ranking measure',
      body: (
        <>
          <p>
            AUROC (the c-statistic) is the probability that a randomly chosen patient with the outcome receives a higher predicted risk than a randomly chosen patient without it.
            Ties count one half. It does not change with prevalence or with any monotone transformation of the scores, so it is <strong>blind to calibration</strong>. Multiply
            every risk by 3 and the AUROC stays the same.
          </p>
          <ul>
            <li>
              Verbal labels (“0.8 = excellent”) are arbitrary. Judge AUROC against existing tools and the clinical task, and always report its CI <Cite id="dehond2022" />.
            </li>
            <li>A higher AUROC does not guarantee better decisions at the threshold you will use (Module 7).</li>
          </ul>
        </>
      ),
    },
    {
      id: 'threshold',
      title: 'Thresholds come from consequences',
      body: (
        <>
          <p>If treating a patient who will not have the outcome costs H and missing a patient who will costs B, decision theory says treat when risk exceeds:</p>
          <Formula>pₜ = H / (H + B)   e.g. missing sepsis judged 9× worse than an unnecessary work-up → pₜ = 1/(1+9) = 10%</Formula>
          <p>
            Youden's index (max sensitivity + specificity − 1) ignores both prevalence and consequences, so it is rarely the right clinical threshold. Workload is equally concrete:
            <strong> alerts per true case</strong> (1/PPV) and the share of patients flagged determine alert fatigue.
          </p>
          <ThresholdWidget />
          <Callout kind="evidence">
            At the threshold used in practice, an external validation of a widely deployed sepsis model found sensitivity of 33% and PPV of 12%, roughly 8 alerts per true case,
            while it alerted on 18% of hospitalisations <Cite id="wong2021" />.
          </Callout>
        </>
      ),
    },
    {
      id: 'pr',
      title: 'Precision–recall curves without the myth',
      body: (
        <>
          <p>
            Precision is PPV and recall is sensitivity. The PR curve shows how many alerts are true as you try to catch more cases, which is useful when the workload of positives
            is what matters. Its baseline is the prevalence, so AUPRC cannot be compared across populations with different prevalence.
          </p>
          <p>
            The claim that “AUPRC is better than AUROC for imbalanced data” does not hold. The choice should follow the use case, not the class ratio, and optimising AUPRC can favour
            subgroups with higher prevalence and widen performance gaps <Cite id="mcdermott2024" />.
          </p>
        </>
      ),
    },
    {
      id: 'improper',
      title: 'Measures to avoid as headline results',
      body: (
        <>
          <ul>
            <li>
              <strong>Accuracy</strong>: at 2% prevalence, predicting “no event” for everyone is 98% accurate and clinically useless.
            </li>
            <li>
              <strong>F1</strong>: ignores true negatives and weighs false positives and false negatives equally regardless of their clinical cost.
            </li>
          </ul>
          <Callout kind="rule">
            Recommended core reporting <Cite id="vancalster2025" />: AUROC (with CI), a calibration plot, net benefit with a decision curve over the plausible threshold range, and the
            distribution of predicted risks by outcome, as in the mirrored histogram above.
          </Callout>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm5q1',
      stem: 'What does AUROC = 0.80 mean?',
      options: ['80% of predictions are correct', 'A random patient with the outcome has an 80% chance of a higher predicted risk than a random patient without it', 'Sensitivity is 80%', 'The model is well calibrated'],
      answer: 1,
      rationale: 'AUROC is the concordance probability. It says nothing about accuracy at a threshold or about calibration.',
    },
    {
      id: 'm5q2',
      stem: 'A model is moved to a unit where prevalence falls from 20% to 5%; score distributions within cases and non-cases are unchanged. Which changes?',
      options: ['AUROC', 'Sensitivity at a fixed threshold', 'PPV at a fixed threshold', 'Specificity at a fixed threshold'],
      answer: 2,
      rationale: 'Sensitivity, specificity and AUROC are conditional on true status and do not depend on prevalence. PPV depends on prevalence and will fall sharply.',
    },
    {
      id: 'm5q3',
      stem: 'Your team judges missing a case of sepsis to be 9 times worse than an unnecessary work-up. What threshold probability is consistent with that judgement?',
      options: ['9%', '10%', '50%', '90%'],
      answer: 1,
      rationale: 'pₜ = H/(H+B) = 1/(1+9) = 10%. At this threshold the odds pₜ/(1−pₜ) = 1/9 is the accepted exchange rate of false to true positives.',
    },
    {
      id: 'm5q4',
      stem: 'At 2% prevalence, a model that labels every patient “no event” has 98% accuracy. What should you conclude?',
      options: ['The model is excellent', 'Accuracy is uninformative here; report discrimination, calibration and net benefit', 'Use F1 instead and the model is fine', 'Lower the threshold to 0.5'],
      answer: 1,
      rationale: 'Accuracy rewards predicting the majority class. Van Calster et al. (2025) classify classification-accuracy measures as improper for clinically relevant thresholds.',
    },
    {
      id: 'm5q5',
      stem: '“Because sepsis is rare we must use AUPRC, not AUROC.” Best response?',
      options: ['Correct; AUROC is invalid under imbalance', 'Class imbalance alone does not make AUPRC superior. Choose measures by use case, and note AUPRC depends on prevalence and can favour high-prevalence subgroups', 'Use accuracy instead', 'Balance the data with SMOTE first'],
      answer: 1,
      rationale: 'McDermott et al. (NeurIPS 2024) showed the AUPRC-for-imbalance claim is usually unsupported and that AUPRC can amplify subgroup disparities.',
    },
  ],
  refs: ['dehond2022', 'wong2021', 'mcdermott2024', 'vancalster2025'],
};
