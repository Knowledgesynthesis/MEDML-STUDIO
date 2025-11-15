import { ModuleTemplate } from './ModuleTemplate';

const module6Content = {
  id: '6',
  title: 'Model Explainability Tools',
  level: 'Advanced',
  duration: '90 min',
  description: 'Master SHAP, LIME, and other explainability techniques to interpret complex models.',
  objectives: [
    'Distinguish between global and local explanations',
    'Understand how SHAP values work and interpret them',
    'Apply LIME to explain individual predictions',
    'Use partial dependence plots to visualize feature effects',
  ],
  sections: [
    {
      title: 'Global vs Local Explanations',
      content: 'Explanations can focus on the overall model behavior (global) or individual predictions (local).',
      subsections: [
        {
          title: 'Global Explanations',
          points: [
            'Describe model behavior across all predictions',
            'Example: "Age is the most important feature overall"',
            'Methods: Feature importance, partial dependence plots',
            'Useful for understanding general model patterns',
          ],
        },
        {
          title: 'Local Explanations',
          points: [
            'Explain a single prediction for one patient',
            'Example: "For this patient, high lactate drove the prediction"',
            'Methods: SHAP values, LIME',
            'Essential for clinical decision support',
          ],
        },
      ],
    },
    {
      title: 'SHAP (SHapley Additive exPlanations)',
      content: 'SHAP uses game theory to assign each feature a contribution value for a specific prediction.',
      subsections: [
        {
          title: 'How SHAP Works',
          points: [
            'Based on Shapley values from cooperative game theory',
            'Calculates how much each feature contributes to prediction',
            'Considers all possible feature combinations',
            'Properties: consistency, local accuracy, missingness',
          ],
        },
        {
          title: 'Interpreting SHAP Values',
          points: [
            'Positive SHAP value → increases predicted risk',
            'Negative SHAP value → decreases predicted risk',
            'Magnitude shows strength of effect',
            'Sum of SHAP values = (prediction - base value)',
          ],
        },
        {
          title: 'Clinical Example',
          points: [
            'Base prediction (average): 20% sepsis risk',
            'Lactate (high) SHAP: +0.15 → pushes risk up',
            'Age (young) SHAP: -0.05 → pushes risk down',
            'Final prediction: 30% (20% + 15% - 5%)',
          ],
        },
      ],
    },
    {
      title: 'LIME (Local Interpretable Model-agnostic Explanations)',
      content: 'LIME explains predictions by fitting a simple, interpretable model around the specific prediction.',
      subsections: [
        {
          title: 'How LIME Works',
          points: [
            'Creates perturbed samples near the prediction',
            'Trains simple model (e.g., linear) on these samples',
            'Uses simple model to explain complex model locally',
            'Works with any ML model (model-agnostic)',
          ],
        },
        {
          title: 'Advantages and Limitations',
          points: [
            'Advantage: Works with any black-box model',
            'Advantage: Creates human-readable explanations',
            'Limitation: Explanations can vary with sampling',
            'Limitation: Only approximates local behavior',
          ],
        },
      ],
    },
    {
      title: 'Partial Dependence Plots',
      content: 'PDPs show how predictions change as a single feature varies, averaging over all other features.',
      subsections: [
        {
          title: 'Reading PDP Plots',
          points: [
            'X-axis: Feature value (e.g., age)',
            'Y-axis: Average predicted outcome',
            'Shows marginal effect of feature',
            'Reveals non-linear relationships',
          ],
        },
        {
          title: 'Clinical Application',
          points: [
            'Identify threshold effects (risk jumps at age 65)',
            'Detect unexpected patterns',
            'Validate clinical knowledge',
            'Communicate model behavior to stakeholders',
          ],
        },
      ],
    },
    {
      title: 'Choosing the Right Explanation Method',
      content: 'Different methods suit different needs and audiences.',
      subsections: [
        {
          title: 'Use Feature Importance When',
          points: [
            'Need overall understanding of model',
            'Comparing models',
            'Identifying data collection priorities',
          ],
        },
        {
          title: 'Use SHAP When',
          points: [
            'Need rigorous, theoretically grounded explanations',
            'Explaining individual predictions to clinicians',
            'Regulatory requirement for explainability',
          ],
        },
        {
          title: 'Use LIME When',
          points: [
            'Working with any black-box model',
            'Need quick local explanations',
            'Model doesn\'t support SHAP efficiently',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'Global explanations describe overall model behavior; local explanations focus on individual predictions.',
    'SHAP provides theoretically grounded feature attributions using game theory.',
    'LIME approximates complex models locally with interpretable ones.',
    'Different explanation methods suit different clinical and regulatory needs.',
  ],
  prevModule: '5',
  nextModule: '7',
};

export function Module6() {
  return <ModuleTemplate module={module6Content} />;
}
