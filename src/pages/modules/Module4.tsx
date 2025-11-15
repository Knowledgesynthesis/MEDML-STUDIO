import { ModuleTemplate } from './ModuleTemplate';

const module4Content = {
  id: '4',
  title: 'Decision Trees and Rule-Based Models',
  level: 'Intermediate',
  duration: '60 min',
  description: 'Learn how tree-based models create interpretable rules and visualize decision-making processes.',
  objectives: [
    'Understand how decision trees split data to make predictions',
    'Calculate and interpret Gini impurity and information gain',
    'Visualize decision paths and extract clinical rules',
    'Recognize overfitting in decision trees and apply pruning strategies',
  ],
  sections: [
    {
      title: 'How Decision Trees Work',
      content: 'Decision trees make predictions by asking a series of yes/no questions about features, splitting the data at each node until reaching a final prediction (leaf node). Each split is chosen to best separate the classes.',
      subsections: [
        {
          title: 'Tree Structure Components',
          points: [
            'Root node: Starting point with all data',
            'Internal nodes: Decision points based on feature values',
            'Branches: Paths following yes/no answers',
            'Leaf nodes: Final predictions',
          ],
        },
        {
          title: 'Clinical Example: Sepsis Risk Tree',
          points: [
            'Root: Is temperature > 38°C?',
            'If Yes → Is WBC > 12,000? → If Yes → High Risk',
            'If No → Is lactate > 2.0? → If Yes → Medium Risk',
            'This creates transparent, auditable rules',
          ],
        },
      ],
    },
    {
      title: 'Splitting Criteria: Gini Impurity',
      content: 'Gini impurity measures how "mixed" a node is. A pure node (all one class) has Gini = 0. The tree chooses splits that minimize weighted average Gini impurity of child nodes.',
      subsections: [
        {
          title: 'Calculating Gini Impurity',
          points: [
            'Gini = 1 - Σ(p_i)² where p_i is proportion of class i',
            'Example: 80 positive, 20 negative → Gini = 1 - (0.8² + 0.2²) = 0.32',
            'Lower Gini = more pure = better split',
          ],
        },
        {
          title: 'Information Gain Alternative',
          points: [
            'Information gain uses entropy instead of Gini',
            'Both methods usually give similar results',
            'Gini is computationally faster',
          ],
        },
      ],
    },
    {
      title: 'Overfitting and Tree Depth',
      content: 'Deep trees can memorize training data, creating overly specific rules that don\'t generalize. This is overfitting.',
      subsections: [
        {
          title: 'Signs of Overfitting',
          points: [
            'Perfect accuracy on training data, poor on test data',
            'Very deep trees with many specific rules',
            'Leaf nodes with very few samples',
            'Rules that don\'t make clinical sense',
          ],
        },
        {
          title: 'Preventing Overfitting',
          points: [
            'Limit maximum tree depth (e.g., depth ≤ 5)',
            'Set minimum samples per leaf (e.g., ≥ 10)',
            'Prune trees by removing unhelpful branches',
            'Use cross-validation to select hyperparameters',
          ],
        },
      ],
    },
    {
      title: 'Clinical Interpretation',
      content: 'Decision trees produce human-readable rules that clinicians can understand and audit.',
      subsections: [
        {
          title: 'Advantages for Clinical Use',
          points: [
            'Transparent decision logic',
            'Can handle non-linear relationships naturally',
            'No need to normalize/scale features',
            'Automatically captures interactions',
            'Easy to explain to patients and stakeholders',
          ],
        },
        {
          title: 'Limitations',
          points: [
            'Single trees are unstable (small data changes → big tree changes)',
            'Can overfit easily without proper constraints',
            'May not achieve highest possible accuracy',
            'Biased toward features with many categories',
          ],
        },
      ],
    },
  ],
  takeaways: [
    'Decision trees create interpretable if-then rules by recursively splitting data based on feature values.',
    'Gini impurity and information gain measure how pure each split is; trees minimize weighted impurity.',
    'Overfitting occurs when trees grow too deep; prevent with max depth limits, minimum samples, and pruning.',
    'Trees are highly interpretable and handle non-linearities, but single trees can be unstable.',
  ],
  prevModule: '3',
  nextModule: '5',
};

export function Module4() {
  return <ModuleTemplate module={module4Content} />;
}
