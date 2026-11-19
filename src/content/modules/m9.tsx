import { Callout } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { FairnessWidget, LabelBiasWidget } from '@/components/widgets/FairnessWidgets';
import type { ModuleDef } from './types';

export const m9: ModuleDef = {
  id: 'm9',
  number: 9,
  title: 'Bias, fairness and equity',
  summary: 'Where bias enters the pipeline, how to audit a model by group, why fairness criteria conflict, and how to reason about race and other group variables.',
  minutes: 30,
  objectives: [
    'Trace bias to representation, measurement, label choice, modelling and deployment.',
    'Audit group-wise calibration, TPR, FPR, PPV and selection rates.',
    'Explain the impossibility results and choose a criterion that fits the decision.',
    'Evaluate arguments for and against using race or ethnicity as a predictor.',
  ],
  sections: [
    {
      id: 'sources',
      title: 'Where bias enters',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Documented example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Representation</td>
                <td>
                  Dermatology AI performed worse on dark skin tones, which were under-represented in training images <Cite id="daneshjou2022" />.
                </td>
              </tr>
              <tr>
                <td>Measurement</td>
                <td>
                  At SpO₂ 92–96%, arterial saturation was &lt; 88% in 11.7% of Black and 3.6% of White patients <Cite id="sjoding2020" />. Any model using SpO₂ inherits this bias.
                </td>
              </tr>
              <tr>
                <td>Label choice</td>
                <td>
                  Using cost as a proxy for health need under-selected Black patients. Fixing the label would raise their share of programme referrals from 17.7% to 46.5%{' '}
                  <Cite id="obermeyer2019" />.
                </td>
              </tr>
              <tr>
                <td>Modelling</td>
                <td>Optimising average performance can hide poor calibration in smaller groups. Omitting a relevant factor shifts calibration by group.</td>
              </tr>
              <tr>
                <td>Deployment</td>
                <td>Who gets screened, who sees the alert, and how clinicians respond can differ by group and feed back into future training data.</td>
              </tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'label',
      title: 'Label choice: reproduce the Obermeyer mechanism',
      body: <LabelBiasWidget />,
    },
    {
      id: 'metrics',
      title: 'Auditing a model by group',
      body: (
        <>
          <ul>
            <li>
              <strong>Calibration within groups:</strong> a 20% predicted risk means 20% in every group. This is usually the first property to check.
            </li>
            <li>
              <strong>Demographic parity:</strong> equal selection rates. It is rarely appropriate when true need differs.
            </li>
            <li>
              <strong>Equal opportunity:</strong> equal sensitivity (TPR). <strong>Equalized odds:</strong> equal TPR and FPR <Cite id="hardt2016" />.
            </li>
            <li>
              <strong>Predictive parity:</strong> equal PPV, meaning an alert is equally reliable in each group.
            </li>
          </ul>
          <FairnessWidget />
          <p>
            When base rates differ and prediction is imperfect, calibration within groups and equal error rates cannot all hold at once <Cite ids={['kleinberg2017', 'chouldechova2017']} />.
            Decide which errors are most harmful for the specific action, for example missed prevention versus unnecessary intervention, and involve the affected communities.
          </p>
          <Callout kind="rule">Report performance stratified by clinically relevant groups, with CIs, as TRIPOD+AI requires <Cite id="tripodai2024" />. Small groups need enough events for the estimates to mean anything.</Callout>
        </>
      ),
    },
    {
      id: 'race',
      title: 'Race and other group variables in clinical algorithms',
      body: (
        <>
          <p>
            Race is a social construct that correlates with exposures, access and measurement artefacts. Many “race corrections” had weak justification and steered resources away
            from minoritised patients <Cite id="vyas2020" />. The 2021 CKD-EPI eGFR equations were refitted without race and are now recommended in the US{' '}
            <Cite id="inker2021" />.
          </p>
          <p>
            Removing a variable does not guarantee fairness: proxies remain, and calibration can worsen for the group the change was meant to protect. Ask what the variable stands
            for, whether a better-measured cause can replace it, and how each choice changes decisions and outcomes in each group. Then monitor after deployment.
          </p>
          <Callout kind="note" title="Regulatory hooks">
            US covered entities must make reasonable efforts to identify and mitigate the risk of discrimination from patient-care decision-support tools (45 CFR §92.210){' '}
            <Cite id="sec1557" />. The EU AI Act requires data governance that examines possible biases for high-risk systems <Cite id="euaiact2024" />. WHO lists inclusiveness and
            equity among its six principles for AI in health <Cite id="who2021" />.
          </Callout>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm9q1',
      stem: 'In Obermeyer et al. (2019), what was the primary mechanism of racial bias?',
      options: ['Race was used as an input', 'The label: future cost was used as a proxy for health need, and less is spent on Black patients with equal need', 'Too few trees', 'Poor discrimination overall'],
      answer: 1,
      rationale: 'The algorithm predicted cost accurately. Cost was the wrong target. Changing the label reduced the bias substantially.',
    },
    {
      id: 'm9q2',
      stem: 'A diabetes-risk model has O/E 1.0 in Group A and 1.4 in Group B. What does this mean, and what follows?',
      options: ['Group B risk is over-estimated; refer fewer of them', 'Group B risk is under-estimated, so Group B patients will be under-referred at a common threshold; investigate and recalibrate', 'The model is fair', 'Only AUROC matters'],
      answer: 1,
      rationale: 'O/E > 1 means more events occur than predicted. At a shared threshold, Group B patients with real need fall below the cut-off.',
    },
    {
      id: 'm9q3',
      stem: 'Base rates differ between groups and the model is calibrated within each group. Which pair of properties generally cannot also be achieved?',
      options: ['High AUROC in both groups', 'Equal false-positive rates and equal false-negative rates', 'A single threshold', 'Calibration-in-the-large'],
      answer: 1,
      rationale: 'Kleinberg et al. (2017) and Chouldechova (2017): with unequal base rates and imperfect prediction, within-group calibration and equal FPR and FNR are incompatible.',
    },
    {
      id: 'm9q4',
      stem: 'Pulse oximeters over-estimating saturation in patients with darker skin is an example of…',
      options: ['Label bias', 'Measurement bias', 'Sampling bias', 'Automation bias'],
      answer: 1,
      rationale: 'The recorded value systematically differs from the true value by group (Sjoding et al. NEJM 2020), so any model using SpO₂ inherits the error.',
    },
    {
      id: 'm9q5',
      stem: 'A team removes race from a model’s inputs and declares it fair. Best response?',
      options: ['Agree; without race the model cannot be biased', 'Removing a variable does not guarantee fair outcomes. Proxies remain and calibration may differ by group, so audit outcomes by group', 'Add race back in all cases', 'Fairness cannot be measured'],
      answer: 1,
      rationale: 'Fairness is a property of predictions and decisions in each group, not of the input list. Audit group-wise calibration and error rates.',
    },
  ],
  refs: ['daneshjou2022', 'sjoding2020', 'obermeyer2019', 'hardt2016', 'kleinberg2017', 'chouldechova2017', 'tripodai2024', 'vyas2020', 'inker2021', 'sec1557', 'euaiact2024', 'who2021'],
};
