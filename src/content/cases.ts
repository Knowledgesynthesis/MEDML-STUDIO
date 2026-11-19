import type { Question } from '@/components/learn/Quiz';

export interface CaseFile {
  id: string;
  title: string;
  tag: 'Failure' | 'Mixed' | 'Success' | 'Bias';
  setting: string;
  refs: string[];
  what: string;
  numbers: string[];
  lessons: string[];
  module: string;
  question: Question;
}

/** Every number below is taken from the cited primary publication. */
export const CASES: CaseFile[] = [
  {
    id: 'esm',
    title: 'A widely deployed sepsis model under external validation',
    tag: 'Failure',
    setting: 'Michigan Medicine, 38,455 hospitalisations (2018–2019); proprietary EHR-vendor sepsis model',
    refs: ['wong2021', 'kamran2024', 'wong2021covid'],
    what: 'Investigators validated a proprietary sepsis model, already used by hundreds of hospitals, against Sepsis-3-style outcomes at their own institution. A later study asked how well the same model performed before clinicians had already recognised sepsis.',
    numbers: [
      'AUROC 0.63, far below the developer-reported figures.',
      'At the threshold in use: sensitivity 33%, PPV 12%; alerts fired for 18% of all hospitalised patients, and 67% of sepsis cases were missed.',
      'Restricting to predictions made before sepsis criteria were met reduced AUROC from ≈ 0.87 to ≈ 0.62, and to ≈ 0.47 before the first treatment indicator (Kamran 2024).',
      'At COVID-19 onset, daily alerts rose by 43% while hospital census fell by 35% across 24 hospitals.',
    ],
    lessons: [
      'Developer performance rarely transfers: validate locally, silently, before go-live.',
      'Measure performance at the moment of the decision. Predictions made after clinicians acted inflate accuracy.',
      'Monitor alert volume continuously: case-mix shocks change burden overnight.',
    ],
    module: 'm2',
    question: {
      id: 'case-esm',
      stem: 'Your hospital plans to switch on this model. Which single step most directly addresses the failures above?',
      options: ['Ask the vendor for a higher-AUROC version', 'Run it silently for several months and measure discrimination, calibration and alerts per true case for predictions made before clinician recognition', 'Lower the threshold to raise sensitivity', 'Add SHAP explanations'],
      answer: 1,
      rationale: 'The problems were transportability and timing. Only local prospective evaluation at the true decision point reveals them before patients are affected.',
    },
  },
  {
    id: 'trews',
    title: 'TREWS: a sepsis alert with clinician confirmation',
    tag: 'Mixed',
    setting: 'Five hospitals, 590,736 monitored patients; prospective multi-site cohort',
    refs: ['adams2022'],
    what: 'A machine-learning early-warning system required clinicians to evaluate and confirm each alert in the EHR. Outcomes were compared between sepsis patients whose alerts were confirmed within 3 hours and those whose alerts were not.',
    numbers: [
      '6,877 patients with sepsis identified by the alert before antibiotics were analysed.',
      'Confirmation within 3 h was associated with a 3.3-percentage-point adjusted absolute (18.7% relative) reduction in in-hospital mortality.',
    ],
    lessons: [
      'Design the workflow around the alert (evaluation, confirmation, action), not only the model.',
      'This was not randomised: clinicians who respond quickly may differ systematically. A cluster or stepped-wedge trial would be needed to establish causality.',
    ],
    module: 'm7',
    question: {
      id: 'case-trews',
      stem: 'What is the main limitation in concluding that TREWS caused the mortality reduction?',
      options: ['The sample was too small', 'Comparison groups were defined by clinician behaviour, not randomisation, so confounding is possible', 'AUROC was not reported', 'The outcome was a surrogate'],
      answer: 1,
      rationale: 'Patients whose alerts were confirmed promptly may have differed in presentation, unit or staffing. Adjustment reduces but cannot exclude this confounding.',
    },
  },
  {
    id: 'aam',
    title: 'Advance Alert Monitor: model plus a staffed response',
    tag: 'Success',
    setting: '21 Kaiser Permanente Northern California hospitals, staggered deployment 2016–2019',
    refs: ['escobar2020'],
    what: 'A deterioration score was computed hourly. Alerts went to remote nurses, who reviewed the chart and activated rapid-response and palliative-care workflows on the ward. Staggered roll-out allowed comparison with hospitals that had not yet deployed it.',
    numbers: [
      '43,949 hospitalisations reached the alert threshold (15,487 intervention, 28,462 comparison).',
      '30-day mortality after an alert was 15.8% versus 20.4% (adjusted relative risk 0.84), with lower ICU admission and shorter length of stay.',
    ],
    lessons: [
      'The intervention was the system: model, a dedicated team, standardised responses and palliative-care integration.',
      'A staggered roll-out is a practical quasi-experimental design when individual randomisation is impossible.',
    ],
    module: 'm7',
    question: {
      id: 'case-aam',
      stem: 'A hospital licenses the same score but sends alerts to busy bedside nurses without extra staffing. What should it expect?',
      options: ['The same mortality reduction', 'Any benefit is uncertain, because the published effect belongs to the model-plus-workflow intervention', 'Better results, because bedside nurses know the patients', 'Higher AUROC'],
      answer: 1,
      rationale: 'Impact evidence applies to the whole intervention. Changing the response pathway changes what is being tested.',
    },
  },
  {
    id: 'obermeyer',
    title: 'Cost as a proxy for need: racial bias in population health management',
    tag: 'Bias',
    setting: 'A widely used commercial care-management algorithm (this class of tool is applied to an estimated 200 million people in the US each year); one academic health system analysed',
    refs: ['obermeyer2019'],
    what: 'Patients above a risk-score percentile were auto-enrolled or referred to care-management programmes. The score predicted future healthcare cost. At the same score, Black patients had more uncontrolled chronic illness than White patients, because less money is spent on Black patients with the same level of need.',
    numbers: ['Race was not an input.', 'Re-labelling with a health-based target would raise the share of Black patients receiving additional help from 17.7% to 46.5%.'],
    lessons: ['An accurate model of the wrong label can be systematically unfair.', 'Audit label choice: does the outcome mean the same thing in every group?'],
    module: 'm9',
    question: {
      id: 'case-obermeyer',
      stem: 'Which change most directly fixes this mechanism?',
      options: ['Remove race-correlated inputs', 'Train on a direct measure of health need (e.g. active chronic conditions) instead of cost', 'Use a deeper neural network', 'Raise the enrolment threshold'],
      answer: 1,
      rationale: 'The bias came from the label. Changing the target to a health measure removed most of the disparity; the inputs were not the problem.',
    },
  },
  {
    id: 'pulseox',
    title: 'Pulse oximetry: a biased measurement inside every model that uses it',
    tag: 'Bias',
    setting: 'University of Michigan and 178-hospital multicentre cohort; paired SpO₂ and arterial SaO₂',
    refs: ['sjoding2020'],
    what: 'Investigators compared pulse-oximeter readings with simultaneous arterial blood gases.',
    numbers: ['Among readings of 92–96%, occult hypoxaemia (SaO₂ < 88%) occurred in 11.7% of Black versus 3.6% of White patients (Michigan cohort).'],
    lessons: ['Measurement bias propagates silently into scores, triage rules and ML models.', 'Ask how each input was measured and whether accuracy differs by group.'],
    module: 'm9',
    question: {
      id: 'case-pulseox',
      stem: 'A deterioration model uses SpO₂. What is the expected effect of this measurement bias?',
      options: ['None: models correct measurement error automatically', 'Under-estimated risk for patients whose saturation is over-read, so fewer alerts for them at the same true severity', 'Higher AUROC for all patients', 'It only affects calibration-in-the-large overall'],
      answer: 1,
      rationale: 'If SpO₂ reads falsely high, the model sees a healthier patient than is really there and under-alerts, a group-specific error.',
    },
  },
  {
    id: 'cxr',
    title: 'Shortcut learning in chest radiograph models',
    tag: 'Failure',
    setting: '158,323 radiographs from three US hospital systems; later, COVID-19 detectors',
    refs: ['zech2018', 'degrave2021'],
    what: 'A pneumonia CNN learned to recognise which hospital produced an image (scanner, markers, patient population), and pneumonia prevalence differed by hospital. COVID-19 radiograph detectors were later shown to rely on text markers and patient positioning rather than lung findings.',
    numbers: ['The hospital system was identifiable with 99.95% (NIH) and 99.98% (Mount Sinai) accuracy.', 'The best internal AUROC of 0.931 fell to 0.815 at an external hospital.'],
    lessons: ['Internal validation cannot detect site confounding: test externally.', 'Saliency and attribution methods are useful for debugging shortcuts, not for certifying correctness.'],
    module: 'm10',
    question: {
      id: 'case-cxr',
      stem: 'Which evaluation would most likely have revealed the shortcut before deployment?',
      options: ['A larger internal test set from the same hospitals', 'External validation at a new site plus checks of what image regions drive predictions', 'Reporting F1', 'Training longer'],
      answer: 1,
      rationale: 'Site-specific shortcuts survive any amount of internal testing. A new site breaks the spurious association, and attribution analysis can show the model looking outside the lungs.',
    },
  },
  {
    id: 'asthma',
    title: 'The asthma paradox: interpretability as a safety check',
    tag: 'Success',
    setting: 'Pneumonia mortality data (Cost-Effective HealthCare project), 1990s; re-analysed with intelligible models',
    refs: ['caruana2015'],
    what: 'A rule-based model learned that asthma lowered pneumonia mortality, because asthmatic patients were admitted directly to intensive care. An intelligible additive model (GA²M) made such effects visible to clinicians, who could inspect and edit them.',
    numbers: ['Asthma appeared to lower pneumonia mortality risk, an artefact of the more aggressive care asthmatic patients received.'],
    lessons: ['Prediction models learn care patterns, not biology.', 'Interpretable models let clinicians catch dangerous associations before deployment.'],
    module: 'm8',
    question: {
      id: 'case-asthma',
      stem: 'The model will be used to decide who can be treated as an outpatient. What should be done about the asthma effect?',
      options: ['Keep it, since it is predictive', 'Remove or constrain it, because using it would steer high-risk patients away from the care that produced the low mortality', 'Add more asthma patients', 'Switch to a neural network'],
      answer: 1,
      rationale: 'The effect exists because of treatment. Acting on it would withdraw that treatment from the patients it protected.',
    },
  },
  {
    id: 'idxdr',
    title: 'Autonomous diabetic retinopathy screening: trial versus clinic',
    tag: 'Mixed',
    setting: 'Pivotal trial in 10 US primary-care sites (900 enrolled); deployment study in 11 Thai clinics',
    refs: ['abramoff2018', 'beede2020'],
    what: 'An autonomous AI system that grades retinal images without a clinician was evaluated in a prospective pivotal trial against a reading-centre reference standard, leading to the first FDA authorisation of an autonomous AI diagnostic system (2018). A separate system deployed in Thailand was studied ethnographically.',
    numbers: [
      'Pivotal trial: sensitivity 87.2%, specificity 90.7%, imageability 96.1% for more-than-mild diabetic retinopathy.',
      'In Thailand, lighting, image quality, internet connectivity and referral logistics determined real-world value; ungradable images were initially referred automatically, frustrating patients and nurses, and the protocol was changed.',
    ],
    lessons: ['Pre-registered prospective trials against a strong reference standard are achievable for AI.', 'Socio-technical factors such as lighting, bandwidth and workflow decide whether accuracy becomes benefit.'],
    module: 'm7',
    question: {
      id: 'case-idxdr',
      stem: 'Before deploying an autonomous screening system in a new network of clinics, which issue is most likely to reduce real-world benefit?',
      options: ['AUROC below 0.95', 'Image quality, workflow and referral completion in the local setting', 'Lack of SHAP values', 'Too many training images'],
      answer: 1,
      rationale: 'The Thai deployment showed that environment and workflow, not algorithm accuracy, limited benefit. Pilot locally with usability and referral outcomes.',
    },
  },
  {
    id: 'covid',
    title: 'The COVID-19 model flood',
    tag: 'Failure',
    setting: 'Living systematic reviews of COVID-19 prediction and imaging ML models, 2020–2021',
    refs: ['wynants2020', 'roberts2021'],
    what: 'Hundreds of diagnostic and prognostic models were published within months. Systematic appraisal with PROBAST rated nearly all at high risk of bias.',
    numbers: ['Of 2,212 imaging ML studies screened, 62 met criteria for detailed review, and none was judged of potential clinical use.', 'Common flaws: tiny or duplicated datasets, “Frankenstein” datasets combining sources, leakage, no external validation, no calibration.'],
    lessons: ['Urgency does not lower the bar for validation.', 'Use PROBAST+AI before trusting any published model.'],
    module: 'm10',
    question: {
      id: 'case-covid',
      stem: 'A COVID-19 CT model reports AUROC 0.99 using a public dataset that combined COVID images from one source and non-COVID images from another. The main concern?',
      options: ['Overfitting due to too many epochs', 'Source confounding: the model may detect the dataset, not the disease', 'Low prevalence', 'Lack of explainability'],
      answer: 1,
      rationale: 'When classes come from different sources, any source signature perfectly separates them, which is exactly what Roberts et al. warned about.',
    },
  },
  {
    id: 'uti',
    title: 'Antibiotic stewardship for uncomplicated UTI',
    tag: 'Success',
    setting: '>13,000 women with uncomplicated UTI at two Boston hospitals (2007–2016); retrospective counterfactual evaluation',
    refs: ['kanjilal2020'],
    what: 'Models predicted resistance to each antibiotic from EHR data, and a decision algorithm recommended the narrowest antibiotic likely to work. Recommendations were compared with clinicians’ actual prescriptions in a held-out cohort.',
    numbers: ['The algorithm recommended second-line agents (ciprofloxacin or levofloxacin) in 11% of specimens, 67% less than clinicians.', 'Inappropriate therapy (organism resistant) fell to 9.8%, an 18% relative reduction.'],
    lessons: ['Optimising a decision, not just a prediction, is where ML helps stewardship.', 'Retrospective counterfactual evaluation is promising but still needs prospective trials and validation in more diverse populations.'],
    module: 'm7',
    question: {
      id: 'case-uti',
      stem: 'What is the most important next step before routine use?',
      options: ['Publish the code', 'A prospective (ideally randomised) evaluation of patient outcomes and resistance in diverse settings', 'Increase AUROC', 'Remove all clinician input'],
      answer: 1,
      rationale: 'Counterfactual comparisons assume outcomes under the recommended drug can be inferred from susceptibility; prospective trials test real outcomes and generalisability.',
    },
  },
];
