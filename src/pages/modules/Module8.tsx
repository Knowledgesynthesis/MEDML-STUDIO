import { ModuleTemplate } from './ModuleTemplate';

const module8Content = {
  id: '8',
  title: 'Model Evaluation and Trust',
  level: 'Advanced',
  duration: '75 min',
  description: 'Develop frameworks to assess when and whether to trust ML predictions in clinical practice.',
  objectives: [
    'Interpret ROC curves and understand the AUC metric',
    'Analyze sensitivity vs specificity tradeoffs',
    'Select appropriate decision thresholds for clinical contexts',
    'Apply clinical trust frameworks to evaluate ML models',
  ],
  sections: [
    {
      title: 'ROC Curves and AUC',
      content: 'ROC (Receiver Operating Characteristic) curves visualize model performance across all possible decision thresholds.',
      subsections: [
        {
          title: 'Understanding ROC Curves',
          points: [
            'X-axis: False Positive Rate (1 - Specificity)',
            'Y-axis: True Positive Rate (Sensitivity)',
            'Each point represents a different classification threshold',
            'Better models curve toward upper-left corner',
          ],
        },
        {
          title: 'AUC: Area Under the Curve',
          points: [
            'Single number summarizing ROC performance',
            'Range: 0.5 (random) to 1.0 (perfect)',
            'Interpretation: Probability model ranks random positive case higher than random negative',
            'AUC > 0.7: Acceptable, > 0.8: Excellent, > 0.9: Outstanding',
          ],
        },
        {
          title: 'Limitations of AUC',
          points: [
            'Doesn\'t tell you optimal threshold to use',
            'Insensitive to calibration problems',
            'Can be misleading with imbalanced datasets',
            'Doesn\'t capture clinical utility',
          ],
        },
      ],
    },
    {
      title: 'Sensitivity vs Specificity Tradeoffs',
      content: 'No perfect threshold—must balance missing cases (low sensitivity) against false alarms (low specificity).',
      subsections: [
        {
          title: 'The Fundamental Tradeoff',
          points: [
            'Increasing sensitivity decreases specificity (and vice versa)',
            'Lower threshold: More positives flagged (higher sensitivity, lower specificity)',
            'Higher threshold: Fewer positives flagged (lower sensitivity, higher specificity)',
            'Optimal point depends on clinical context',
          ],
        },
        {
          title: 'Clinical Context Determines Priority',
          points: [
            'High-stakes screening (sepsis, PE): Prioritize sensitivity (don\'t miss cases)',
            'Resource-limited settings: Balance both (can\'t afford too many false positives)',
            'Low-risk conditions: May prioritize specificity (avoid unnecessary interventions)',
          ],
        },
      ],
    },
    {
      title: 'Decision Thresholds',
      content: 'Choosing where to draw the line between positive and negative predictions.',
      subsections: [
        {
          title: 'Common Threshold Selection Methods',
          points: [
            'Maximize Youden\'s Index: Sensitivity + Specificity - 1',
            'Cost-sensitive: Weight false positives/negatives by clinical consequences',
            'Fixed sensitivity or specificity: Set minimum acceptable level',
            'Clinical consensus: Involve stakeholders in threshold selection',
          ],
        },
        {
          title: 'Example: Sepsis Screening',
          points: [
            'Threshold 0.3 (30% risk): High sensitivity (95%), low specificity (60%)',
            'Catches most sepsis cases, many false alarms',
            'Threshold 0.7 (70% risk): Lower sensitivity (70%), high specificity (90%)',
            'Misses some cases, fewer false alarms',
            'Choice depends on resources, risk tolerance, intervention availability',
          ],
        },
      ],
    },
    {
      title: 'Clinical Trust Frameworks',
      content: 'Systematic approach to deciding whether to trust and deploy an ML model.',
      subsections: [
        {
          title: 'Validation Hierarchy',
          points: [
            'Level 1: Internal validation (same institution, held-out data)',
            'Level 2: Temporal validation (later time period)',
            'Level 3: External validation (different institutions)',
            'Level 4: Prospective validation (real-world deployment)',
          ],
        },
        {
          title: 'Trust Evaluation Checklist',
          points: [
            '✓ Performance validated on diverse, external populations',
            '✓ Model is calibrated, not just discriminative',
            '✓ Predictions are explainable and clinically sensible',
            '✓ Bias and fairness assessed across subgroups',
            '✓ Clear plan for monitoring and updating',
            '✓ Human oversight mechanisms in place',
          ],
        },
      ],
    },
    {
      title: 'When NOT to Use a Model',
      content: 'Sometimes the right answer is not to deploy ML at all.',
      subsections: [
        {
          title: 'Red Flags',
          points: [
            'Model fails external validation',
            'Significant performance disparities across subgroups',
            'Predictions not explainable or don\'t match clinical knowledge',
            'No plan for continuous monitoring',
            'Insufficient evidence of clinical benefit',
            'Regulatory or ethical concerns',
          ],
        },
        {
          title: 'Alternatives to Consider',
          points: [
            'Evidence-based clinical guidelines',
            'Simple rule-based decision support',
            'Structured clinical assessment tools',
            'Consultation with specialists',
            'Further model development and validation',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'ROC curves and AUC measure discrimination but don\'t determine optimal thresholds or assess calibration.',
    'Sensitivity vs specificity tradeoffs require clinical context to resolve.',
    'Decision thresholds must be chosen based on clinical consequences, not just statistical criteria.',
    'Trust frameworks demand rigorous external validation, fairness assessment, and continuous monitoring.',
  ],
  prevModule: '7',
  nextModule: '9',
};

export function Module8() {
  return <ModuleTemplate module={module8Content} />;
}
