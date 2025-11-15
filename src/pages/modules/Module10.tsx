import { ModuleTemplate } from './ModuleTemplate';

const module10Content = {
  id: '10',
  title: 'Integrated Model Evaluation',
  level: 'Advanced',
  duration: '120 min',
  description: 'Apply everything you\'ve learned in a comprehensive model evaluation exercise.',
  objectives: [
    'Conduct end-to-end evaluation of an ML model for clinical use',
    'Compare multiple models across performance, interpretability, and fairness dimensions',
    'Communicate model strengths and limitations to clinical stakeholders',
    'Make evidence-based recommendations for model deployment',
  ],
  sections: [
    {
      title: 'End-to-End Model Assessment Framework',
      content: 'A systematic checklist for comprehensive model evaluation.',
      subsections: [
        {
          title: 'Phase 1: Problem Definition',
          points: [
            'Clinical need: What problem does this model solve?',
            'Target population: Who will it be used for?',
            'Intended use: Screening, diagnosis, risk stratification, or treatment selection?',
            'Success criteria: What constitutes clinically meaningful improvement?',
          ],
        },
        {
          title: 'Phase 2: Data Quality Assessment',
          points: [
            'Representative of target population?',
            'Sufficient sample size and event rate?',
            'Missing data patterns and handling strategy',
            'Temporal applicability (data currency)',
          ],
        },
        {
          title: 'Phase 3: Model Performance',
          points: [
            'Discrimination: AUC, sensitivity, specificity',
            'Calibration: Calibration curve, Brier score',
            'Clinical utility: Decision curve analysis, net benefit',
            'Comparison to existing standards of care',
          ],
        },
        {
          title: 'Phase 4: Interpretability and Trust',
          points: [
            'Model transparency: Can predictions be explained?',
            'Feature importance: Do key drivers make clinical sense?',
            'Outlier analysis: How does model handle edge cases?',
            'Clinician confidence: Will providers trust and use it?',
          ],
        },
        {
          title: 'Phase 5: Fairness and Equity',
          points: [
            'Performance across demographic subgroups',
            'Fairness metrics across protected attributes',
            'Potential for unintended consequences',
            'Impact on healthcare disparities',
          ],
        },
        {
          title: 'Phase 6: Implementation Considerations',
          points: [
            'Integration with clinical workflow',
            'Computational requirements',
            'Monitoring and maintenance plan',
            'Regulatory and legal requirements',
          ],
        },
      ],
    },
    {
      title: 'Comparing Multiple Models',
      content: 'Models rarely excel on all dimensions—tradeoffs must be explicitly evaluated.',
      subsections: [
        {
          title: 'Performance Comparison',
          points: [
            'Create comparison table: AUC, calibration, PPV, NPV',
            'Statistical testing: Are differences significant?',
            'Clinical significance: Do differences matter in practice?',
            'Consider confidence intervals, not just point estimates',
          ],
        },
        {
          title: 'Interpretability vs Accuracy Tradeoff',
          points: [
            'Logistic regression: High interpretability, moderate accuracy',
            'Random forest: Moderate interpretability, high accuracy',
            'Neural network: Low interpretability, potentially highest accuracy',
            'Context determines acceptable tradeoff',
          ],
        },
        {
          title: 'Multi-Dimensional Assessment',
          points: [
            'No single "best" model—depends on priorities',
            'Create evaluation matrix across all dimensions',
            'Weight dimensions based on clinical context',
            'Involve stakeholders in final selection',
          ],
        },
      ],
    },
    {
      title: 'Clinical Case Studies',
      content: 'Apply framework to realistic scenarios.',
      subsections: [
        {
          title: 'Case 1: Sepsis Screening in ED',
          points: [
            'Priority: High sensitivity (don\'t miss cases)',
            'Acceptable: Lower specificity (false alarms manageable)',
            'Interpretability: Moderate (clinicians need to understand flags)',
            'Recommendation: Random forest with SHAP explanations',
          ],
        },
        {
          title: 'Case 2: 30-Day Readmission Risk',
          points: [
            'Priority: Calibration (resource allocation decisions)',
            'Need: Fairness across socioeconomic groups',
            'Interpretability: High (for patient discussions)',
            'Recommendation: Calibrated logistic regression with equity monitoring',
          ],
        },
        {
          title: 'Case 3: Diabetic Retinopathy Screening',
          points: [
            'Priority: Very high accuracy (replaces specialist)',
            'Population: Diverse, underserved communities',
            'Regulation: FDA approval required',
            'Recommendation: Deep learning with rigorous validation and monitoring',
          ],
        },
      ],
    },
    {
      title: 'Stakeholder Communication',
      content: 'Translating technical evaluations into actionable insights.',
      subsections: [
        {
          title: 'Communicating with Clinicians',
          points: [
            'Focus on clinical utility, not statistical metrics',
            'Show example predictions with explanations',
            'Discuss limitations openly',
            'Provide clear guidance on when to override model',
          ],
        },
        {
          title: 'Communicating with Administrators',
          points: [
            'Emphasize return on investment and efficiency',
            'Address regulatory and liability concerns',
            'Present implementation timeline and resources needed',
            'Highlight quality improvement and equity outcomes',
          ],
        },
        {
          title: 'Communicating with Patients',
          points: [
            'Use plain language, avoid jargon',
            'Explain how model helps, not replaces, clinical judgment',
            'Discuss data privacy and security',
            'Emphasize patient rights and autonomy',
          ],
        },
      ],
    },
    {
      title: 'Making Deployment Recommendations',
      content: 'The final decision: deploy, revise, or reject.',
      subsections: [
        {
          title: 'Recommendation Categories',
          points: [
            'Deploy: Evidence supports clinical benefit, risks manageable',
            'Pilot: Promising but needs prospective validation',
            'Revise: Identified issues need addressing first',
            'Reject: Insufficient evidence or unacceptable risks',
          ],
        },
        {
          title: 'Deployment Readiness Checklist',
          points: [
            '✓ Strong performance on external validation',
            '✓ Acceptable fairness across subgroups',
            '✓ Interpretability suitable for context',
            '✓ Clinical workflow integration planned',
            '✓ Monitoring and maintenance strategy',
            '✓ Stakeholder buy-in achieved',
            '✓ Regulatory requirements met',
          ],
        },
        {
          title: 'Conditions for Deployment',
          points: [
            'Specify target population carefully',
            'Define required human oversight',
            'Establish performance monitoring metrics',
            'Create feedback mechanisms for users',
            'Plan regular model audits and updates',
            'Document all assumptions and limitations',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'Comprehensive evaluation requires assessing performance, interpretability, fairness, and implementation simultaneously.',
    'No model excels on all dimensions—tradeoffs must be explicit and contextually appropriate.',
    'Different stakeholders need different communication approaches—tailor messages to audience.',
    'Deployment decisions require evidence of clinical benefit, manageable risks, and robust monitoring plans.',
  ],
  prevModule: '9',
};

export function Module10() {
  return <ModuleTemplate module={module10Content} />;
}
