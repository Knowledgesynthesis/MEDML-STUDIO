import { ModuleTemplate } from './ModuleTemplate';

const module7Content = {
  id: '7',
  title: 'Uncertainty and Calibration',
  level: 'Intermediate',
  duration: '60 min',
  description: 'Learn to assess model confidence, understand calibration, and recognize when models are overconfident.',
  objectives: [
    'Distinguish between model confidence and predicted probability',
    'Interpret calibration curves and reliability diagrams',
    'Calculate and understand the Brier score',
    'Recognize risks of overconfident predictions in clinical settings',
  ],
  sections: [
    {
      title: 'Confidence vs Probability',
      content: 'A model might predict 80% risk with high or low confidence. Understanding this distinction is crucial for clinical decision-making.',
      subsections: [
        {
          title: 'Predicted Probability',
          points: [
            'The model\'s estimate: "This patient has 70% chance of readmission"',
            'Based on patterns in training data',
            'NOT the same as model confidence',
          ],
        },
        {
          title: 'Model Confidence',
          points: [
            'How certain the model is about its prediction',
            'Affected by: training data quality, model complexity, similarity to training cases',
            'High confidence doesn\'t mean correct prediction!',
          ],
        },
      ],
    },
    {
      title: 'Calibration: Do Probabilities Match Reality?',
      content: 'A well-calibrated model\'s predicted probabilities match observed frequencies. If a model predicts 70% risk for 100 patients, roughly 70 should experience the outcome.',
      subsections: [
        {
          title: 'What is Calibration?',
          points: [
            'Agreement between predicted probabilities and observed frequencies',
            'Perfect calibration: predicted = observed across all risk levels',
            'Example: Of 100 patients with predicted 30% risk, ~30 should have outcome',
          ],
        },
        {
          title: 'Why Calibration Matters Clinically',
          points: [
            'Guides treatment decisions based on risk thresholds',
            'Enables shared decision-making with patients',
            'Essential for cost-effectiveness analyses',
            'Required for calculating expected outcomes',
          ],
        },
      ],
    },
    {
      title: 'Calibration Curves',
      content: 'Visualize calibration by plotting predicted vs observed probabilities.',
      subsections: [
        {
          title: 'Reading Calibration Plots',
          points: [
            'X-axis: Predicted probability (model output)',
            'Y-axis: Observed frequency (actual outcomes)',
            'Perfect calibration: points fall on 45° diagonal line',
            'Above line: Under-prediction (too low)',
            'Below line: Over-prediction (too high)',
          ],
        },
        {
          title: 'Common Calibration Problems',
          points: [
            'Overconfidence: Predictions too extreme (too close to 0 or 1)',
            'Underconfidence: Predictions too moderate (clustered near 0.5)',
            'Systematic bias: Always too high or too low',
          ],
        },
      ],
    },
    {
      title: 'Brier Score',
      content: 'Brier score measures the accuracy of probabilistic predictions, combining calibration and discrimination.',
      subsections: [
        {
          title: 'Calculating Brier Score',
          points: [
            'Brier = average of (predicted probability - actual outcome)²',
            'Range: 0 (perfect) to 1 (worst possible)',
            'Lower is better',
            'Example: Predict 0.7, outcome = 1 → (0.7-1)² = 0.09',
          ],
        },
        {
          title: 'Interpreting Brier Score',
          points: [
            'Brier < 0.15: Generally good',
            'Brier < 0.10: Excellent',
            'Compare to baseline (always predict prevalence)',
            'Sensitive to both calibration and discrimination',
          ],
        },
      ],
    },
    {
      title: 'Overconfidence Risks in Clinical Decision Support',
      content: 'Overconfident models can lead to inappropriate clinical actions.',
      subsections: [
        {
          title: 'Dangers of Overconfidence',
          points: [
            'False certainty in uncertain situations',
            'Inappropriate treatment escalation or de-escalation',
            'Reduced clinician vigilance ("the computer says low risk")',
            'Patient harm from missed diagnoses',
          ],
        },
        {
          title: 'Detecting Overconfidence',
          points: [
            'Check calibration curves for predictions bunched at extremes',
            'Compare to human expert confidence',
            'Test on diverse, out-of-distribution populations',
            'Monitor real-world performance continuously',
          ],
        },
        {
          title: 'Mitigation Strategies',
          points: [
            'Apply calibration methods (Platt scaling, isotonic regression)',
            'Report confidence intervals, not just point estimates',
            'Use ensemble methods to quantify uncertainty',
            'Train clinicians to interpret and question predictions',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'Calibration measures whether predicted probabilities match observed frequencies—essential for clinical decision-making.',
    'Calibration curves visualize agreement between predictions and reality.',
    'Brier score quantifies both calibration and discrimination in a single metric.',
    'Overconfident models pose clinical risks; always validate calibration on diverse populations.',
  ],
  prevModule: '6',
  nextModule: '8',
};

export function Module7() {
  return <ModuleTemplate module={module7Content} />;
}
