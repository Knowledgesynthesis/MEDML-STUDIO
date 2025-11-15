import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'ML' | 'Statistics' | 'Clinical' | 'Ethics' | 'Explainability';
  relatedTerms?: string[];
  example?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Accuracy',
    category: 'Statistics',
    definition: 'The proportion of correct predictions (both true positives and true negatives) among all predictions made.',
    example: 'If a model correctly predicts 85 out of 100 cases, its accuracy is 85%.',
    relatedTerms: ['Sensitivity', 'Specificity', 'Precision'],
  },
  {
    term: 'AUC (Area Under the Curve)',
    category: 'Statistics',
    definition: 'The area under the ROC curve, representing the model\'s ability to distinguish between positive and negative classes. Ranges from 0 to 1, with 0.5 indicating random chance.',
    example: 'An AUC of 0.85 means the model has an 85% chance of ranking a random positive case higher than a random negative case.',
    relatedTerms: ['ROC Curve', 'Sensitivity', 'Specificity'],
  },
  {
    term: 'Bias (Statistical)',
    category: 'Statistics',
    definition: 'Systematic error in predictions that causes the model to consistently over- or under-predict certain outcomes.',
    relatedTerms: ['Variance', 'Overfitting', 'Underfitting'],
  },
  {
    term: 'Bias (Fairness)',
    category: 'Ethics',
    definition: 'Unfair or discriminatory treatment of certain groups by an ML model, often reflecting historical inequities in data or society.',
    example: 'A model that systematically underestimates disease risk in certain demographic groups exhibits fairness bias.',
    relatedTerms: ['Algorithmic Fairness', 'Demographic Parity', 'Equalized Odds'],
  },
  {
    term: 'Brier Score',
    category: 'Statistics',
    definition: 'A measure of the accuracy of probabilistic predictions, calculated as the mean squared difference between predicted probabilities and actual outcomes. Lower is better.',
    example: 'A Brier score of 0.1 indicates better calibration than a score of 0.3.',
    relatedTerms: ['Calibration', 'Probability'],
  },
  {
    term: 'Calibration',
    category: 'Statistics',
    definition: 'The degree to which predicted probabilities match observed frequencies. A well-calibrated model predicting 70% risk should see the outcome occur about 70% of the time.',
    relatedTerms: ['Brier Score', 'Reliability Diagram', 'Probability'],
  },
  {
    term: 'Clinical Decision Support (CDS)',
    category: 'Clinical',
    definition: 'Health information technology that provides clinicians, patients, or other individuals with knowledge and person-specific information to help health and healthcare decisions.',
    relatedTerms: ['EHR', 'Machine Learning', 'Prediction'],
  },
  {
    term: 'Confusion Matrix',
    category: 'Statistics',
    definition: 'A table showing the counts of true positives, false positives, true negatives, and false negatives, used to evaluate classification model performance.',
    relatedTerms: ['Sensitivity', 'Specificity', 'Precision', 'Recall'],
  },
  {
    term: 'Decision Tree',
    category: 'ML',
    definition: 'A tree-structured model that makes predictions by following a series of if-then rules based on feature values. Highly interpretable.',
    example: 'If age > 65 AND systolic BP > 140, then predict high risk.',
    relatedTerms: ['Random Forest', 'Gini Impurity', 'Entropy'],
  },
  {
    term: 'Demographic Parity',
    category: 'Ethics',
    definition: 'A fairness criterion requiring that positive prediction rates are equal across different demographic groups.',
    relatedTerms: ['Fairness', 'Equalized Odds', 'Bias'],
  },
  {
    term: 'Ensemble Method',
    category: 'ML',
    definition: 'A technique that combines multiple models to improve overall performance. Examples include random forests and gradient boosting.',
    relatedTerms: ['Random Forest', 'Gradient Boosting', 'Bagging'],
  },
  {
    term: 'Equalized Odds',
    category: 'Ethics',
    definition: 'A fairness criterion requiring that true positive and false positive rates are equal across different demographic groups.',
    relatedTerms: ['Demographic Parity', 'Fairness', 'Sensitivity', 'Specificity'],
  },
  {
    term: 'Feature',
    category: 'ML',
    definition: 'An input variable or attribute used by a model to make predictions. Also called a predictor or independent variable.',
    example: 'In a sepsis prediction model, features might include temperature, heart rate, and white blood cell count.',
    relatedTerms: ['Feature Engineering', 'Feature Importance'],
  },
  {
    term: 'Feature Importance',
    category: 'Explainability',
    definition: 'A measure of how much each feature contributes to model predictions. Higher importance indicates stronger influence.',
    relatedTerms: ['SHAP', 'Permutation Importance', 'Partial Dependence'],
  },
  {
    term: 'False Negative',
    category: 'Statistics',
    definition: 'A case where the model incorrectly predicts the negative class when the true outcome is positive.',
    example: 'Missing a case of sepsis (predicting no sepsis when the patient actually has sepsis).',
    relatedTerms: ['False Positive', 'Sensitivity', 'Type II Error'],
  },
  {
    term: 'False Positive',
    category: 'Statistics',
    definition: 'A case where the model incorrectly predicts the positive class when the true outcome is negative.',
    example: 'Flagging a healthy patient as high-risk for a condition they don\'t have.',
    relatedTerms: ['False Negative', 'Specificity', 'Type I Error'],
  },
  {
    term: 'Gini Impurity',
    category: 'ML',
    definition: 'A measure of how often a randomly chosen element would be incorrectly classified. Used in decision tree algorithms to determine optimal splits.',
    relatedTerms: ['Decision Tree', 'Entropy', 'Information Gain'],
  },
  {
    term: 'Gradient Boosting',
    category: 'ML',
    definition: 'An ensemble method that builds models sequentially, with each new model correcting errors of the previous ones.',
    relatedTerms: ['Ensemble Method', 'Random Forest', 'XGBoost'],
  },
  {
    term: 'Interpretability',
    category: 'Explainability',
    definition: 'The degree to which a human can understand and explain how a model makes its predictions.',
    example: 'Logistic regression is more interpretable than deep neural networks.',
    relatedTerms: ['Explainability', 'Transparency', 'Black Box'],
  },
  {
    term: 'LIME (Local Interpretable Model-agnostic Explanations)',
    category: 'Explainability',
    definition: 'A technique that explains individual predictions by approximating the model locally with an interpretable model.',
    relatedTerms: ['SHAP', 'Explainability', 'Local Explanation'],
  },
  {
    term: 'Logistic Regression',
    category: 'ML',
    definition: 'A linear model for binary classification that predicts the probability of an outcome using a logistic (sigmoid) function.',
    example: 'Predicting probability of hospital readmission based on age, comorbidities, and length of stay.',
    relatedTerms: ['Linear Regression', 'Odds Ratio', 'Coefficient'],
  },
  {
    term: 'Negative Predictive Value (NPV)',
    category: 'Statistics',
    definition: 'The probability that a patient with a negative test result truly does not have the condition.',
    relatedTerms: ['Positive Predictive Value', 'Sensitivity', 'Specificity'],
  },
  {
    term: 'Overfitting',
    category: 'ML',
    definition: 'When a model learns the training data too well, including noise and random variations, leading to poor performance on new data.',
    example: 'A decision tree with too many branches that perfectly predicts training data but fails on test data.',
    relatedTerms: ['Underfitting', 'Generalization', 'Cross-validation'],
  },
  {
    term: 'Positive Predictive Value (PPV)',
    category: 'Statistics',
    definition: 'The probability that a patient with a positive test result truly has the condition. Also called precision.',
    relatedTerms: ['Negative Predictive Value', 'Precision', 'Sensitivity'],
  },
  {
    term: 'Precision',
    category: 'Statistics',
    definition: 'The proportion of positive predictions that are correct. Same as positive predictive value (PPV).',
    example: 'If a model predicts 100 cases of disease and 80 are correct, precision is 80%.',
    relatedTerms: ['Recall', 'Positive Predictive Value', 'F1 Score'],
  },
  {
    term: 'Random Forest',
    category: 'ML',
    definition: 'An ensemble method that combines multiple decision trees, each trained on a random subset of data and features.',
    relatedTerms: ['Decision Tree', 'Ensemble Method', 'Bagging'],
  },
  {
    term: 'Recall',
    category: 'Statistics',
    definition: 'The proportion of actual positive cases that are correctly identified. Same as sensitivity.',
    relatedTerms: ['Sensitivity', 'Precision', 'F1 Score'],
  },
  {
    term: 'ROC Curve (Receiver Operating Characteristic)',
    category: 'Statistics',
    definition: 'A plot of sensitivity (true positive rate) versus 1-specificity (false positive rate) across different classification thresholds.',
    relatedTerms: ['AUC', 'Sensitivity', 'Specificity'],
  },
  {
    term: 'Sensitivity',
    category: 'Statistics',
    definition: 'The proportion of actual positive cases that are correctly identified by the model. Also called recall or true positive rate.',
    example: 'If a model identifies 90 out of 100 actual sepsis cases, sensitivity is 90%.',
    relatedTerms: ['Specificity', 'Recall', 'True Positive Rate'],
  },
  {
    term: 'SHAP (SHapley Additive exPlanations)',
    category: 'Explainability',
    definition: 'A unified approach to explain individual predictions by computing the contribution of each feature based on game theory.',
    relatedTerms: ['LIME', 'Feature Importance', 'Shapley Values'],
  },
  {
    term: 'Specificity',
    category: 'Statistics',
    definition: 'The proportion of actual negative cases that are correctly identified by the model. Also called true negative rate.',
    example: 'If a model correctly identifies 85 out of 100 patients without disease, specificity is 85%.',
    relatedTerms: ['Sensitivity', 'False Positive Rate', 'True Negative Rate'],
  },
  {
    term: 'Training Data',
    category: 'ML',
    definition: 'The dataset used to build and fit a machine learning model, containing both features and known outcomes.',
    relatedTerms: ['Test Data', 'Validation Data', 'Overfitting'],
  },
  {
    term: 'True Negative',
    category: 'Statistics',
    definition: 'A case where the model correctly predicts the negative class and the true outcome is negative.',
    relatedTerms: ['True Positive', 'False Negative', 'False Positive'],
  },
  {
    term: 'True Positive',
    category: 'Statistics',
    definition: 'A case where the model correctly predicts the positive class and the true outcome is positive.',
    relatedTerms: ['True Negative', 'False Positive', 'False Negative'],
  },
  {
    term: 'Underfitting',
    category: 'ML',
    definition: 'When a model is too simple to capture the underlying patterns in the data, leading to poor performance on both training and test data.',
    relatedTerms: ['Overfitting', 'Bias', 'Variance'],
  },
];

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'ML', 'Statistics', 'Clinical', 'Ethics', 'Explainability'];

  const filteredTerms = glossaryTerms
    .filter((term) => {
      const matchesSearch =
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
        <p className="text-muted-foreground mt-2">
          Reference guide for ML, statistical, and clinical terms
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredTerms.length} of {glossaryTerms.length} terms
          </div>
        </CardContent>
      </Card>

      {/* Terms List */}
      <div className="grid gap-4">
        {filteredTerms.map((item) => (
          <Card key={item.term}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{item.term}</CardTitle>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">{item.definition}</p>

              {item.example && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium mb-1">Example:</p>
                  <p className="text-xs text-muted-foreground">{item.example}</p>
                </div>
              )}

              {item.relatedTerms && item.relatedTerms.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Related Terms:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.relatedTerms.map((relatedTerm) => (
                      <Badge key={relatedTerm} variant="outline" className="text-xs">
                        {relatedTerm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredTerms.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                No terms found matching your search.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
