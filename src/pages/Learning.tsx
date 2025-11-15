import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  locked?: boolean;
  completed?: boolean;
}

const modules: Module[] = [
  {
    id: '1',
    title: 'Foundations of ML in Healthcare',
    description: 'Learn what ML can and cannot do in clinical contexts, understand prediction vs causation, and explore CDS categories.',
    duration: '45 min',
    level: 'Beginner',
    topics: [
      'What is Machine Learning?',
      'ML vs Traditional Statistical Methods',
      'Prediction vs Causation in Medicine',
      'Clinical Decision Support Categories',
      'Regulatory Oversight (FDA, EU AI Act)',
    ],
    completed: false,
  },
  {
    id: '2',
    title: 'Understanding Clinical Data',
    description: 'Explore EHR data structure, preprocessing techniques, handling missingness, and feature engineering for clinical datasets.',
    duration: '60 min',
    level: 'Beginner',
    topics: [
      'EHR Data Structure',
      'Variable Types in Clinical Data',
      'Handling Missing Values',
      'Feature Engineering',
      'Data Quality Considerations',
    ],
    completed: false,
  },
  {
    id: '3',
    title: 'Interpretable Models: Logistic Regression',
    description: 'Deep dive into logistic regression - the most interpretable baseline model for binary classification in clinical settings.',
    duration: '75 min',
    level: 'Beginner',
    topics: [
      'Logistic Regression Fundamentals',
      'Interpreting Coefficients',
      'Odds Ratios in Clinical Context',
      'Model Assumptions and Limitations',
      'When to Use Logistic Regression',
    ],
    completed: false,
  },
  {
    id: '4',
    title: 'Decision Trees and Rule-Based Models',
    description: 'Learn how tree-based models create interpretable rules and visualize decision-making processes.',
    duration: '60 min',
    level: 'Intermediate',
    topics: [
      'How Decision Trees Work',
      'Gini Impurity and Information Gain',
      'Visualizing Decision Paths',
      'Overfitting and Tree Depth',
      'Clinical Interpretation of Rules',
    ],
    completed: false,
  },
  {
    id: '5',
    title: 'Ensemble Methods',
    description: 'Understand random forests and gradient boosting - balancing accuracy with interpretability.',
    duration: '90 min',
    level: 'Intermediate',
    topics: [
      'Random Forests Overview',
      'Gradient Boosting Machines',
      'Accuracy vs Interpretability Tradeoff',
      'Feature Importance in Ensembles',
      'When to Use Ensemble Methods',
    ],
    completed: false,
  },
  {
    id: '6',
    title: 'Model Explainability Tools',
    description: 'Master SHAP, LIME, and other explainability techniques to interpret complex models.',
    duration: '90 min',
    level: 'Advanced',
    topics: [
      'Global vs Local Explanations',
      'Feature Importance Methods',
      'SHAP (SHapley Additive exPlanations)',
      'LIME (Local Interpretable Model-agnostic Explanations)',
      'Partial Dependence Plots',
    ],
    completed: false,
  },
  {
    id: '7',
    title: 'Uncertainty and Calibration',
    description: 'Learn to assess model confidence, understand calibration, and recognize when models are overconfident.',
    duration: '60 min',
    level: 'Intermediate',
    topics: [
      'Confidence vs Probability',
      'Calibration Curves',
      'Brier Score',
      'Reliability Diagrams',
      'Overconfidence Risks in CDS',
    ],
    completed: false,
  },
  {
    id: '8',
    title: 'Model Evaluation and Trust',
    description: 'Develop frameworks to assess when and whether to trust ML predictions in clinical practice.',
    duration: '75 min',
    level: 'Advanced',
    topics: [
      'ROC Curves and AUC',
      'Sensitivity vs Specificity Tradeoffs',
      'Decision Thresholds',
      'Clinical Trust Frameworks',
      'When NOT to Use a Model',
    ],
    completed: false,
  },
  {
    id: '9',
    title: 'Bias, Fairness, and Ethics',
    description: 'Critically evaluate bias, fairness metrics, and ethical implications of ML in clinical settings.',
    duration: '90 min',
    level: 'Advanced',
    topics: [
      'Types of Bias in Healthcare ML',
      'Fairness Metrics',
      'Algorithmic Fairness',
      'Ethical Considerations',
      'Health Equity and AI',
    ],
    completed: false,
  },
  {
    id: '10',
    title: 'Integrated Model Evaluation',
    description: 'Apply everything you\'ve learned in a comprehensive model evaluation exercise.',
    duration: '120 min',
    level: 'Advanced',
    topics: [
      'End-to-End Model Assessment',
      'Comparing Multiple Models',
      'Clinical Case Studies',
      'Stakeholder Communication',
      'Implementation Considerations',
    ],
    completed: false,
  },
];

export function Learning() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Modules</h1>
        <p className="text-muted-foreground mt-2">
          Structured curriculum for mastering interpretable ML in clinical decision support
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your progress through the curriculum</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0/10</div>
              <p className="text-sm text-muted-foreground mt-1">Modules Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0h</div>
              <p className="text-sm text-muted-foreground mt-1">Time Spent Learning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Beginner</div>
              <p className="text-sm text-muted-foreground mt-1">Current Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Course Modules</h2>
        <div className="grid gap-6">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="transition-all hover:shadow-lg cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {module.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle>{module.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={
                          module.level === 'Beginner' ? 'secondary' :
                          module.level === 'Intermediate' ? 'default' :
                          'outline'
                        }>
                          {module.level}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Topics */}
                <div>
                  <p className="text-sm font-medium mb-2">Topics Covered:</p>
                  <ul className="space-y-1">
                    {module.topics.map((topic, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={module.completed ? 'outline' : 'default'}
                  onClick={() => window.location.hash = `module-${module.id}`}
                >
                  {module.completed ? 'Review Module' : 'Start Module'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>Supplementary materials to enhance your learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-1">Interactive Exercises</h3>
            <p className="text-sm text-muted-foreground">
              Practice with hands-on exercises in the Model Lab and Datasets sections
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-1">Glossary</h3>
            <p className="text-sm text-muted-foreground">
              Quick reference for ML, statistical, and clinical terms
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-1">Case Studies</h3>
            <p className="text-sm text-muted-foreground">
              Real-world scenarios demonstrating ML application in clinical settings (coming soon)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
