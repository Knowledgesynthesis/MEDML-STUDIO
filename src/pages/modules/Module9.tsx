import { ModuleTemplate } from './ModuleTemplate';

const module9Content = {
  id: '9',
  title: 'Bias, Fairness, and Ethics',
  level: 'Advanced',
  duration: '90 min',
  description: 'Critically evaluate bias, fairness metrics, and ethical implications of ML in clinical settings.',
  objectives: [
    'Identify different types of bias in healthcare ML systems',
    'Calculate and interpret fairness metrics',
    'Apply ethical frameworks to ML deployment decisions',
    'Recognize health equity implications of algorithmic decision-making',
  ],
  sections: [
    {
      title: 'Types of Bias in Healthcare ML',
      content: 'Bias can enter at multiple stages: data collection, model training, deployment, and interpretation.',
      subsections: [
        {
          title: 'Data Collection Bias',
          points: [
            'Selection bias: Non-representative training data',
            'Measurement bias: Systematic errors in data collection',
            'Historical bias: Past inequities encoded in data',
            'Example: Training only on academic medical center data',
          ],
        },
        {
          title: 'Algorithmic Bias',
          points: [
            'Model optimizes for majority group performance',
            'Underrepresented groups have fewer training examples',
            'Different feature distributions across groups',
            'Example: Pulse oximetry less accurate for darker skin tones',
          ],
        },
        {
          title: 'Deployment and Use Bias',
          points: [
            'Differential access to ML-enhanced care',
            'Automation bias: Over-reliance on predictions',
            'Feedback loops: Biased predictions → biased data collection',
            'Example: High-risk flags trigger more testing → confirms bias',
          ],
        },
      ],
    },
    {
      title: 'Fairness Metrics',
      content: 'Mathematical definitions of fairness—but no single metric captures all ethical considerations.',
      subsections: [
        {
          title: 'Demographic Parity',
          points: [
            'Definition: P(ŷ=1|A=a) = P(ŷ=1|A=b) for protected attribute A',
            'Meaning: Equal positive prediction rates across groups',
            'Example: 30% flagged high-risk in both groups A and B',
            'Limitation: Ignores true outcome rates across groups',
          ],
        },
        {
          title: 'Equalized Odds',
          points: [
            'Definition: TPR and FPR equal across groups',
            'Meaning: Model errors distributed equally',
            'Stricter than demographic parity',
            'Limitation: May require accepting different accuracy across groups',
          ],
        },
        {
          title: 'Predictive Parity',
          points: [
            'Definition: P(Y=1|ŷ=1,A=a) = P(Y=1|ŷ=1,A=b)',
            'Meaning: Equal PPV (precision) across groups',
            'Relevant for resource allocation decisions',
            'Limitation: Can be incompatible with other fairness definitions',
          ],
        },
        {
          title: 'The Impossibility Theorem',
          points: [
            'Cannot simultaneously satisfy all fairness criteria',
            'Must choose based on clinical context and values',
            'No purely mathematical solution to fairness',
            'Requires stakeholder input and ethical deliberation',
          ],
        },
      ],
    },
    {
      title: 'Ethical Frameworks for ML in Healthcare',
      content: 'Structured approaches to ethical decision-making.',
      subsections: [
        {
          title: 'Principled Approach',
          points: [
            'Beneficence: Does the model improve patient outcomes?',
            'Non-maleficence: Does it avoid harm across all groups?',
            'Justice: Is access and benefit distributed fairly?',
            'Autonomy: Does it preserve patient and clinician agency?',
          ],
        },
        {
          title: 'Consequentialist Analysis',
          points: [
            'Assess overall outcomes: more good than harm?',
            'Consider both individual and population effects',
            'Account for short-term and long-term consequences',
            'Example: Sepsis model saves lives but creates alert fatigue',
          ],
        },
        {
          title: 'Rights-Based Approach',
          points: [
            'Right to explanation: Can patients understand decisions?',
            'Right to non-discrimination: Equal treatment regardless of protected attributes',
            'Right to appeal: Can predictions be questioned?',
            'Right to privacy: Is data use appropriate?',
          ],
        },
      ],
    },
    {
      title: 'Health Equity and AI',
      content: 'ML can either reduce or exacerbate healthcare disparities.',
      subsections: [
        {
          title: 'Risks to Health Equity',
          points: [
            'Amplifying existing disparities through biased data',
            'Creating new disparities through differential access',
            'Perpetuating historical inequities',
            'Reducing resources to underperforming groups (feedback loops)',
          ],
        },
        {
          title: 'Opportunities for Health Equity',
          points: [
            'Identifying underdiagnosed conditions in underserved populations',
            'Improving access to specialist-level insights',
            'Standardizing care quality across settings',
            'Detecting and measuring disparities systematically',
          ],
        },
        {
          title: 'Equity-Focused Development',
          points: [
            'Include diverse populations in training and validation',
            'Stratify performance metrics by demographic groups',
            'Engage affected communities in model development',
            'Monitor real-world impact on disparities',
            'Design interventions to reduce, not widen, gaps',
          ],
        },
      ],
    },
    {
      title: 'Practical Steps for Ethical ML',
      content: 'Actionable strategies for responsible development and deployment.',
      subsections: [
        {
          title: 'Development Phase',
          points: [
            'Audit training data for representativeness',
            'Test multiple fairness metrics across subgroups',
            'Document all design decisions and tradeoffs',
            'Involve ethicists and community stakeholders',
          ],
        },
        {
          title: 'Validation Phase',
          points: [
            'Validate on diverse, external populations',
            'Assess calibration and fairness across groups',
            'Conduct sensitivity analyses',
            'Solicit feedback from potential users',
          ],
        },
        {
          title: 'Deployment Phase',
          points: [
            'Establish monitoring for performance and equity',
            'Create clear escalation paths for concerns',
            'Provide training on interpreting predictions',
            'Maintain human oversight and intervention capability',
            'Plan for regular model audits and updates',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'Bias can enter at data collection, model training, and deployment stages—vigilance required throughout.',
    'No single fairness metric is universally correct; choice depends on clinical context and stakeholder values.',
    'Ethical frameworks (principlism, consequentialism, rights-based) guide but don\'t dictate ML deployment decisions.',
    'ML can either reduce or exacerbate health disparities—intentional equity-focused design is essential.',
  ],
  prevModule: '8',
  nextModule: '10',
};

export function Module9() {
  return <ModuleTemplate module={module9Content} />;
}
