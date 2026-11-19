import { Callout } from '@/components/ui';
import { Cite } from '@/components/learn/Cite';
import { Link } from '@/components/Link';
import { ShiftWidget } from '@/components/widgets/DeployWidgets';
import type { ModuleDef } from './types';

export const m10: ModuleDef = {
  id: 'm10',
  number: 10,
  title: 'Deployment, monitoring and appraisal',
  summary: 'Dataset shift and updating, monitoring after go-live, a 10-question appraisal you can use tomorrow, the 2026 regulatory picture, and LLM-specific risks.',
  minutes: 35,
  objectives: [
    'Recognise covariate, prevalence, concept and practice shift, and predict their effect on discrimination and calibration.',
    'Choose an updating strategy and a monitoring plan.',
    'Appraise a model publication or vendor claim against TRIPOD+AI and PROBAST+AI.',
    'Summarise current FDA, ONC and EU AI Act requirements and LLM-specific evaluation needs.',
  ],
  sections: [
    {
      id: 'shift',
      title: 'Dataset shift: the model meets a new world',
      body: (
        <>
          <p>Performance is a property of a model <em>in a setting</em>. Shift comes in several forms <Cite id="finlayson2021" />:</p>
          <ul>
            <li>
              <strong>Case mix</strong> (covariate shift): older or sicker patients.
            </li>
            <li>
              <strong>Prevalence</strong> (label shift): different baseline risk or outcome definition.
            </li>
            <li>
              <strong>Concept</strong>: the predictor–outcome relationship changes, for example after a new treatment.
            </li>
            <li>
              <strong>Practice and measurement</strong>: new order sets, devices, documentation or coding.
            </li>
          </ul>
          <ShiftWidget />
          <Callout kind="evidence">
            <p>
              When COVID-19 arrived, daily alerts from a widely used sepsis model rose by 43% across 24 hospitals while total census fell by 35% <Cite id="wong2021covid" />.
            </p>
            <p>
              A chest-radiograph pneumonia CNN could identify the hospital system that produced an image with near-perfect accuracy. Its AUROC fell from 0.931 internally to 0.815 at
              an external site <Cite id="zech2018" />. Calibration drifts over time even without dramatic events <Cite id="davis2017" />.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'monitor',
      title: 'Monitoring and updating',
      body: (
        <>
          <ul>
            <li>
              <strong>Before go-live:</strong> run the model silently on local patients. Measure discrimination, calibration, alert rate and alerts per true case.
            </li>
            <li>
              <strong>After go-live:</strong> track input distributions, alert volume, override rates, calibration and outcomes, overall and by subgroup, on a fixed schedule with
              pre-agreed action limits.
            </li>
            <li>
              <strong>Updating:</strong> intercept update, then logistic recalibration, then model revision, always re-validated <Cite id="janssen2008" />. For regulated devices,
              planned modifications can be pre-authorised in a PCCP <Cite id="fda_pccp2024" />, consistent with Good Machine Learning Practice <Cite id="gmlp2021" />.
            </li>
            <li>
              <strong>Governance:</strong> keep a model inventory with a named clinical owner, intended use, a model-facts label <Cite id="sendak2020" />, and retirement criteria.
            </li>
          </ul>
          <Callout kind="pitfall">
            A model that changes care changes its own future training data. If alerts lead to early antibiotics that prevent sepsis, a naively retrained model learns that the alerted
            pattern is low risk.
          </Callout>
        </>
      ),
    },
    {
      id: 'appraise',
      title: 'Appraising a model in 10 questions',
      body: (
        <>
          <p>
            Built on TRIPOD+AI <Cite id="tripodai2024" /> and PROBAST+AI <Cite id="probastai2025" />. An interactive version that produces a summary is in the{' '}
            <Link to="/toolkit" className="text-primary underline">
              Toolkit
            </Link>
            .
          </p>
          <ol>
            <li>Do the population, setting and prediction time match my use?</li>
            <li>Were all predictors available at the prediction time, with no leakage?</li>
            <li>Is the outcome clinically meaningful and measured the same way for everyone, not a biased proxy?</li>
            <li>Were there enough events for the number of candidate parameters?</li>
            <li>How was missing data handled, and will the same handling work at deployment?</li>
            <li>Was performance validated externally, in another place and time, and by whom?</li>
            <li>Is calibration reported with a plot, slope and intercept, not only AUROC?</li>
            <li>Is clinical utility shown with net benefit at relevant thresholds?</li>
            <li>Is performance reported by relevant subgroups?</li>
            <li>Is there impact evidence, a monitoring plan, and a clear regulatory status?</li>
          </ol>
          <Callout kind="evidence">
            Of 2,212 COVID-19 imaging ML studies screened, 62 met quality criteria for review, and none was judged of potential clinical use because of methodological flaws or
            biases <Cite id="roberts2021" />. Systematic reviews of COVID-19 prediction models similarly rated almost all at high risk of bias <Cite id="wynants2020" />.
          </Callout>
        </>
      ),
    },
    {
      id: 'regulation',
      title: 'The regulatory picture (November 2026)',
      body: (
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>What it means for you</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>FDA CDS guidance (revised Jan 2026)</td>
              <td>
                Four statutory criteria decide device status. Some single-recommendation HCP tools now fall under enforcement discretion; image, signal and waveform analysis remains a
                device function <Cite id="fda_cds2026" />.
              </td>
            </tr>
            <tr>
              <td>FDA PCCP (final Dec 2024) and AI lifecycle draft (Jan 2025)</td>
              <td>
                Pre-specified updates with validation protocols; lifecycle documentation, including subgroup performance and transparency <Cite ids={['fda_pccp2024', 'fda_lifecycle2025']} />.
              </td>
            </tr>
            <tr>
              <td>ONC HTI-1 → HTI-5 (Oct 2026)</td>
              <td>
                Certified EHRs no longer have to expose DSI source attributes or intervention risk-management information <Cite id="hti5_2026" />. Ask vendors for model facts in
                contracts.
              </td>
            </tr>
            <tr>
              <td>HHS 45 CFR §92.210</td>
              <td>
                Identify and mitigate discrimination risk in decision-support tools you use <Cite id="sec1557" />.
              </td>
            </tr>
            <tr>
              <td>EU AI Act after the Digital Omnibus</td>
              <td>
                AI in MDR/IVDR devices is high-risk, with obligations from 2 Aug 2028 (stand-alone Annex III systems from 2 Dec 2027). AI literacy has been required since Feb 2025{' '}
                <Cite id="euaiact2024" />.
              </td>
            </tr>
          </tbody>
        </table>
      ),
    },
    {
      id: 'llm',
      title: 'Large language models: same principles, extra failure modes',
      body: (
        <>
          <p>
            Everything above applies: a defined task, population and prediction time, external evaluation, calibration of any probabilities, subgroup analysis and impact studies.
            LLMs add hallucinated content, sensitivity to prompt wording, non-deterministic output, silent vendor version changes, and new privacy risks.
          </p>
          <ul>
            <li>
              Evaluate on realistic tasks with clinicians in the loop. Access to an LLM did not improve physicians' diagnostic reasoning in a randomised trial{' '}
              <Cite id="goh2024" />.
            </li>
            <li>
              Report LLM studies with TRIPOD-LLM <Cite id="tripodllm2025" />. Pin the model version and prompt, and re-test after every update.
            </li>
          </ul>
        </>
      ),
    },
  ],
  quiz: [
    {
      id: 'm10q1',
      stem: 'A model is deployed at a hospital with higher prevalence. AUROC is unchanged; mean predicted risk is 12% versus an observed 20%. What is the first step?',
      options: ['Retire the model', 'Re-estimate the intercept with local data, then re-check calibration', 'Lower the threshold until alerts double', 'Add more trees'],
      answer: 1,
      rationale: 'A pure baseline shift calls for intercept updating. Ranking is preserved, so refitting is unnecessary.',
    },
    {
      id: 'm10q2',
      stem: 'After an ED introduces lactate for every patient with suspected infection, the sepsis model’s AUROC drops. What is the most likely reason?',
      options: ['Lactate became less prognostic biologically', 'The model relied partly on whether lactate was ordered; a practice change removed that signal', 'The thermometer changed', 'Random chance only'],
      answer: 1,
      rationale: 'Missingness carried clinician judgement. When everyone is tested, the indicator is always 0 and the information disappears.',
    },
    {
      id: 'm10q3',
      stem: 'A vendor reports AUROC 0.83 from its own development data. What is the most important step before local go-live?',
      options: ['Accept it, since it exceeds 0.8', 'Silent-mode local validation of discrimination, calibration and alert burden in your population', 'Ask for a higher AUROC', 'Compute F1'],
      answer: 1,
      rationale: 'Vendor development metrics rarely transfer (Wong 2021). Local prospective silent testing measures what will actually happen.',
    },
    {
      id: 'm10q4',
      stem: 'What does an FDA Predetermined Change Control Plan allow?',
      options: ['Unlimited unreviewed retraining', 'Pre-authorised, pre-specified modifications with defined methods and impact assessment, without a new submission for each', 'Exemption from validation', 'Use of LLMs without review'],
      answer: 1,
      rationale: 'A PCCP (final guidance December 2024) describes planned changes, the protocol for implementing and validating them, and an impact assessment. Changes outside the plan still need review.',
    },
    {
      id: 'm10q5',
      stem: 'What did Zech et al. (2018) demonstrate about a chest-radiograph pneumonia CNN?',
      options: ['Perfect generalisation', 'It could identify the source hospital system, and performance fell at an external site, showing confounding by site', 'It was better calibrated than radiologists', 'It needed no external validation'],
      answer: 1,
      rationale: 'Site-specific signals, such as scanners, markers and prevalence, acted as shortcuts, so internal performance overstated external performance.',
    },
  ],
  refs: ['finlayson2021', 'wong2021covid', 'zech2018', 'davis2017', 'janssen2008', 'fda_pccp2024', 'gmlp2021', 'sendak2020', 'tripodai2024', 'probastai2025', 'roberts2021', 'wynants2020', 'fda_cds2026', 'fda_lifecycle2025', 'hti5_2026', 'sec1557', 'euaiact2024', 'goh2024', 'tripodllm2025'],
};
