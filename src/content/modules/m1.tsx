import { Callout } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { BayesWidget } from '@/components/widgets/Foundations';
import type { ModuleDef } from './types';

export const m1: ModuleDef = {
  id: 'm1',
  number: 1,
  title: 'Prediction in medicine: what models can and cannot do',
  summary: 'Define a prediction model precisely, separate prediction from causation, see why base rates dominate alerts, and place models in the 2026 regulatory landscape.',
  minutes: 25,
  objectives: [
    'Specify a model by population, prediction time, predictors, outcome, horizon and intended action.',
    'Distinguish predictive questions (“who is at risk?”) from causal ones (“what if we treat?”).',
    'Calculate PPV from sensitivity, specificity and prevalence, and predict alert burden.',
    'Summarise the evidence comparing machine learning with logistic regression on clinical tabular data.',
    'Decide whether a CDS tool is likely a regulated medical device in the US and EU.',
  ],
  sections: [
    {
      id: 'definition',
      title: 'What a clinical prediction model is',
      body: (
        <>
          <p>
            A clinical prediction model estimates the <strong>probability</strong> that an outcome is present now (diagnostic) or will occur within a stated time horizon
            (prognostic), for a defined population, using only predictors available at a defined <strong>prediction time</strong> <Cite id="steyerberg2019" />.
          </p>
          <p>Every model is fully specified by six answers. If a paper or vendor cannot give all six, you cannot judge whether the model applies to your patients.</p>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Example (ED sepsis model used in this course)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Population</td>
                <td>Adults in the ED with suspected infection</td>
              </tr>
              <tr>
                <td>Prediction time</td>
                <td>Triage: first vital signs and first laboratory results</td>
              </tr>
              <tr>
                <td>Predictors</td>
                <td>Age, temperature, heart rate, respiratory rate, systolic BP, WBC, lactate, altered mentation</td>
              </tr>
              <tr>
                <td>Outcome &amp; horizon</td>
                <td>Sepsis-3 (infection + acute SOFA rise ≥ 2) within 48 h</td>
              </tr>
              <tr>
                <td>Output</td>
                <td>A probability, e.g. 23%. Not a yes/no label.</td>
              </tr>
              <tr>
                <td>Intended action</td>
                <td>Early senior review, cultures and antibiotics above a chosen risk threshold</td>
              </tr>
            </tbody>
          </table>
          <Callout kind="rule">
            Keep estimation and decision separate. The model's job is an accurate probability. Converting it into an alert requires a threshold, and the threshold should come from
            the consequences of false positives and false negatives (Modules 5 and 7), not from the software default.
          </Callout>
        </>
      ),
    },
    {
      id: 'causation',
      title: 'Prediction is not causation',
      body: (
        <>
          <p>
            Prediction models exploit any association that is stable in the training data, whether or not it is causal. A predictor can be strongly predictive because it is a{' '}
            <em>marker</em> of disease, of clinician concern, or of treatment, and none of those tells you what happens if you intervene on it.
          </p>
          <ul>
            <li>
              <strong>The asthma paradox.</strong> In pneumonia data, a model learned that asthma <em>lowers</em> mortality, because asthmatic patients were routinely admitted to
              intensive care and treated aggressively. Using that model to triage asthmatic patients to outpatient care would have been dangerous <Cite id="caruana2015" />.
            </li>
            <li>
              <strong>Treatment paradox.</strong> If high-risk patients received effective treatment, the recorded outcomes reflect risk <em>under treatment</em>, and the model
              under-estimates untreated risk <Cite id="sperrin2018" />.
            </li>
            <li>
              <strong>Coefficients and feature importance are not effects of intervention.</strong> Interpreting adjusted coefficients in a prediction model as causal effects is the
              “Table 2 fallacy” <Cite id="westreich2013" />.
            </li>
          </ul>
          <Callout kind="pitfall">“The model says lactate is the most important feature, so lowering lactate will prevent sepsis.” No. Questions about what happens if you treat need causal designs, ideally randomised trials.</Callout>
        </>
      ),
    },
    {
      id: 'base-rates',
      title: 'Base rates: why the same model alerts differently in different places',
      body: (
        <>
          <p>
            Sensitivity and specificity describe the model. Positive predictive value also depends on prevalence, which changes from one unit to another. As prevalence falls, false
            alarms soon outnumber true alerts, and alert fatigue follows.
          </p>
          <BayesWidget />
          <Callout kind="evidence">
            In an external validation of a widely deployed proprietary sepsis model across 38,455 hospitalisations, the model generated alerts on 18% of all patients yet missed 67%
            of patients with sepsis <Cite id="wong2021" />.
          </Callout>
        </>
      ),
    },
    {
      id: 'ml-vs-lr',
      title: 'Does machine learning beat regression?',
      body: (
        <>
          <p>
            For structured tabular clinical data, usually not on average. A systematic review of 71 studies comparing ML with logistic regression found no difference in AUROC among
            comparisons at low risk of bias. Apparent ML advantages were concentrated in studies at high risk of bias <Cite id="christodoulou2019" />. Among flexible methods,
            gradient-boosted trees generally outperform deep neural networks on tabular benchmarks <Cite id="grinsztajn2022" />. Tabular foundation models such as TabPFN show strong
            results on small datasets <Cite id="hollmann2025" /> but still need the same clinical validation.
          </p>
          <p>
            Flexible models do outperform regression where the inputs are images, waveforms or text, or where there is very large data with strong interactions. Diabetic
            retinopathy grading from fundus photographs is the canonical example <Cite id="gulshan2016" />.
          </p>
          <Callout kind="rule">
            Start with a well-specified regression model that uses splines for continuous predictors. Add complexity only if it improves <em>held-out</em> discrimination{' '}
            <em>and</em> calibration <em>and</em> net benefit by a clinically meaningful margin. You will test this yourself in Module 4.
          </Callout>
        </>
      ),
    },
    {
      id: 'regulation',
      title: 'Where models live: CDS and regulation (status November 2026)',
      body: (
        <>
          <h3>United States</h3>
          <ul>
            <li>
              Software is a medical device unless it meets <strong>all four</strong> statutory non-device CDS criteria (FD&amp;C Act §520(o)(1)(E), from the 21st Century Cures
              Act). It must (1) not acquire, process or analyse medical images, IVD signals or physiological signal patterns, (2) display or analyse medical information, (3)
              support a health-care professional's recommendation, and (4) let that professional independently review the basis of the recommendation.
            </li>
            <li>
              FDA's <strong>revised CDS guidance (January 2026)</strong> supersedes the 2022 version. It relaxes enforcement for some HCP-facing software that offers a single
              recommendation and removes most of the language that automatically excluded time-critical tools. Software that analyses waveforms or images is still a device{' '}
              <Cite id="fda_cds2026" />.
            </li>
            <li>
              FDA lists more than 1,600 AI-enabled devices (September 2026), about three-quarters of them in radiology <Cite id="fda_ai_list" />. Autonomous AI exists: in 2018 an
              autonomous diabetic-retinopathy system became the first FDA-authorised AI that gives a diagnostic result without clinician interpretation{' '}
              <Cite id="abramoff2018" />.
            </li>
            <li>
              Model updates can be pre-authorised through a <strong>Predetermined Change Control Plan</strong> (final guidance December 2024) <Cite id="fda_pccp2024" />. Lifecycle
              recommendations for AI-enabled devices remain in draft (January 2025) <Cite id="fda_lifecycle2025" />.
            </li>
            <li>
              The ONC HTI-1 rule required certified EHRs to expose 31 “source attributes” for predictive decision-support interventions <Cite id="hti1_2024" />. The{' '}
              <strong>HTI-5 final rule (published October 2026, effective 28 December 2026) removes those requirements</strong> <Cite id="hti5_2026" />, so transparency will depend on what you demand from vendors.
            </li>
            <li>
              HHS rule 45 CFR §92.210 requires covered entities to make reasonable efforts to identify and mitigate the risk of discrimination from patient-care decision-support tools{' '}
              <Cite id="sec1557" />.
            </li>
          </ul>
          <h3>European Union</h3>
          <ul>
            <li>
              Under the MDR (Rule 11), most diagnostic or therapeutic decision software is class IIa or higher. AI that is, or is part of, a medical device requiring notified-body
              assessment is <strong>high-risk</strong> under the AI Act. That brings requirements for risk management, data governance, logging, transparency, human oversight and
              accuracy <Cite id="euaiact2024" />.
            </li>
            <li>
              After the 2026 <strong>Digital Omnibus</strong> amendment, high-risk obligations apply from <strong>2 December 2027</strong> for stand-alone (Annex III) systems and{' '}
              <strong>2 August 2028</strong> for AI in regulated products such as medical devices. Prohibited practices and AI-literacy duties have applied since February 2025.
            </li>
          </ul>
          <Callout kind="pitfall">Regulatory clearance is not evidence of clinical benefit. Most authorisations rest on retrospective performance data, not on outcome trials.</Callout>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm1q1',
      stem: 'A sepsis alert has sensitivity 85% and specificity 85%. It moves from the ED (prevalence 18%) to general wards (prevalence 4%). Approximately what is its PPV on the wards?',
      options: ['55%', '19%', '85%', '4%'],
      answer: 1,
      rationale: 'Per 1,000 ward patients: 34 true positives (40 × 0.85) and 144 false positives (960 × 0.15), so PPV = 34/178 ≈ 19%. In the ED it was about 55%. Sensitivity and specificity did not change; prevalence did.',
    },
    {
      id: 'm1q2',
      stem: 'A pneumonia mortality model assigns lower risk to patients with asthma. What is the best explanation and response?',
      options: [
        'Asthma is biologically protective; the model should be deployed as is.',
        'The data reflect that asthmatic patients received more intensive care. The model must not be used to de-escalate their care.',
        'The coefficient is a random error and should be ignored.',
        'The model needs more trees.',
      ],
      answer: 1,
      rationale: 'This is the classic finding of Caruana et al. (2015). The association reflects treatment patterns, not biology. Prediction models encode how care was delivered, and acting on them as if they were causal can harm patients.',
    },
    {
      id: 'm1q3',
      stem: 'Which statement about ML versus logistic regression for tabular clinical prediction is best supported by evidence?',
      options: [
        'Deep neural networks consistently outperform regression.',
        'Random forests are always better calibrated than regression.',
        'In low risk-of-bias comparisons, ML showed no average AUROC advantage over logistic regression.',
        'Logistic regression cannot model non-linear effects.',
      ],
      answer: 2,
      rationale: 'Christodoulou et al. (J Clin Epidemiol 2019) reviewed 71 studies and found no performance benefit for ML in low risk-of-bias comparisons. Regression can model non-linearity with splines or polynomials.',
    },
    {
      id: 'm1q4',
      stem: 'Under the US statutory CDS criteria, which software is most clearly a regulated medical device?',
      options: [
        'A tool that displays the relevant guideline section with references for the clinician to review',
        'A drug–drug interaction lookup',
        'Software that analyses continuous ECG waveforms to predict deterioration and alerts nurses',
        'A calculator that shows the inputs and published formula for a risk score',
      ],
      answer: 2,
      rationale: 'Criterion 1 excludes software that acquires, processes or analyses physiological signal patterns. Waveform analysis therefore remains a device function even under the 2026 revised guidance.',
    },
    {
      id: 'm1q5',
      stem: 'What should the primary output of a clinical prediction model be?',
      options: ['A binary high/low-risk label', 'A calibrated probability, with action thresholds chosen separately', 'A rank among today’s patients', 'The single most important feature'],
      answer: 1,
      rationale: 'A probability supports decisions under different harms and resources. A label hides uncertainty and fixes a threshold that may be wrong for your setting.',
    },
  ],
  refs: ['steyerberg2019', 'caruana2015', 'sperrin2018', 'westreich2013', 'wong2021', 'christodoulou2019', 'grinsztajn2022', 'hollmann2025', 'gulshan2016', 'fda_cds2026', 'fda_ai_list', 'abramoff2018', 'fda_pccp2024', 'fda_lifecycle2025', 'hti1_2024', 'hti5_2026', 'sec1557', 'euaiact2024'],
};
