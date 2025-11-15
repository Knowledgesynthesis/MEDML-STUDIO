import { ModuleTemplate } from './ModuleTemplate';

const module5Content = {
  id: '5',
  title: 'Ensemble Methods',
  level: 'Intermediate',
  duration: '90 min',
  description: 'Understand random forests and gradient boosting - balancing accuracy with interpretability.',
  objectives: [
    'Understand how ensemble methods combine multiple models',
    'Distinguish between bagging (random forests) and boosting',
    'Analyze the accuracy-interpretability tradeoff',
    'Interpret feature importance in ensemble models',
  ],
  sections: [
    {
      title: 'Ensemble Learning Fundamentals',
      content: 'Ensemble methods combine multiple "weak" models to create a stronger overall model. The wisdom of crowds: many mediocre models together outperform a single complex model.',
      subsections: [
        {
          title: 'Why Ensembles Work',
          points: [
            'Reduces variance by averaging multiple models',
            'Different models make different errors; averaging cancels them out',
            'More robust to outliers and noise',
            'Can capture more complex patterns than single models',
          ],
        },
      ],
    },
    {
      title: 'Random Forests',
      content: 'Random forests train many decision trees on random subsets of data and features, then average their predictions.',
      subsections: [
        {
          title: 'How Random Forests Work',
          points: [
            'Bootstrap sampling: Each tree trained on random sample (with replacement)',
            'Feature randomness: Each split considers random subset of features',
            'Voting: Classification uses majority vote; regression uses average',
            'Typical forest size: 100-1000 trees',
          ],
        },
        {
          title: 'Advantages',
          points: [
            'Generally more accurate than single trees',
            'Less prone to overfitting',
            'Handles high-dimensional data well',
            'Provides feature importance metrics',
          ],
        },
        {
          title: 'Disadvantages',
          points: [
            'Less interpretable than single decision trees',
            'Slower to train and predict',
            'Harder to explain to clinical stakeholders',
            'Black box compared to logistic regression',
          ],
        },
      ],
    },
    {
      title: 'Gradient Boosting',
      content: 'Boosting builds trees sequentially, with each new tree correcting errors of previous trees.',
      subsections: [
        {
          title: 'How Gradient Boosting Works',
          points: [
            'Starts with simple model (often just mean prediction)',
            'Each subsequent tree predicts residual errors',
            'Trees added sequentially, each correcting previous mistakes',
            'Final prediction: weighted sum of all trees',
          ],
        },
        {
          title: 'Key Hyperparameters',
          points: [
            'Learning rate: How much each tree contributes',
            'Number of trees: More trees = better fit (but risk overfitting)',
            'Tree depth: Usually shallow trees (depth 3-6)',
            'Requires careful tuning to avoid overfitting',
          ],
        },
      ],
    },
    {
      title: 'Accuracy vs Interpretability Tradeoff',
      content: 'Ensembles typically achieve higher accuracy but at the cost of interpretability.',
      subsections: [
        {
          title: 'When to Use Ensembles',
          points: [
            'Maximum accuracy is priority',
            'High-dimensional or complex patterns in data',
            'Can supplement with explainability tools (SHAP, LIME)',
            'Regulatory approval doesn\'t require full transparency',
          ],
        },
        {
          title: 'When to Prefer Simpler Models',
          points: [
            'Need to explain predictions to patients/clinicians',
            'Regulatory requirement for interpretability',
            'Building initial baseline model',
            'Limited training data (risk of overfitting)',
          ],
        },
      ],
    },
    {
      title: 'Feature Importance in Ensembles',
      content: 'While individual predictions are hard to interpret, ensemble methods can identify which features are most important overall.',
      subsections: [
        {
          title: 'Types of Feature Importance',
          points: [
            'Gini importance: Based on total impurity decrease',
            'Permutation importance: Drop in accuracy when feature shuffled',
            'SHAP values: Game-theoretic approach (covered in Module 6)',
          ],
        },
        {
          title: 'Clinical Application',
          points: [
            'Identifies most predictive risk factors',
            'Guides which variables to collect in practice',
            'Highlights potential areas for intervention',
            'Can reveal unexpected predictive relationships',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'Ensemble methods combine multiple models to improve accuracy and reduce overfitting.',
    'Random forests use bagging (parallel trees with randomness); boosting uses sequential error correction.',
    'Ensembles trade interpretability for accuracy—use them when maximum performance is needed.',
    'Feature importance metrics help understand what drives ensemble predictions.',
  ],
  prevModule: '4',
  nextModule: '6',
};

export function Module5() {
  return <ModuleTemplate module={module5Content} />;
}
