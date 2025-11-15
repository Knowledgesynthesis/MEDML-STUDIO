import { AlertTriangle, BookOpen, Brain, Database, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to MedML Studio
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn Interpretable Machine Learning for Clinical Decision Support
            </p>
          </div>
        </div>

        {/* Safety Warning */}
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Educational Use Only</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This platform uses <strong>synthetic datasets only</strong> and is designed exclusively
              for educational purposes. It should <strong>never be used for actual clinical
              decision-making</strong>. All models, predictions, and analyses are simulations
              meant to teach ML concepts in a healthcare context.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Quick Start Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Database className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Explore Datasets</CardTitle>
            <CardDescription>
              Browse synthetic clinical datasets simulating real-world scenarios like sepsis
              risk and diabetes prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.hash = 'datasets'}>
              View Datasets
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Brain className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Build Models</CardTitle>
            <CardDescription>
              Train and compare different ML models: logistic regression, decision trees,
              random forests, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.hash = 'model-lab'}>
              Model Lab
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Learn Concepts</CardTitle>
            <CardDescription>
              Follow structured modules covering ML fundamentals, explainability tools,
              and ethical considerations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.hash = 'learning'}>
              Start Learning
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Key Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">What You'll Learn</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interpretable ML Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Logistic Regression</Badge>
                <Badge variant="secondary">Decision Trees</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Random Forests</Badge>
                <Badge variant="secondary">Gradient Boosting</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Understand how different models make predictions and their clinical applicability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Explainability Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">SHAP Values</Badge>
                <Badge variant="secondary">LIME</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Feature Importance</Badge>
                <Badge variant="secondary">Calibration</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Learn to interpret and explain model predictions to clinical stakeholders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ethics & Fairness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Critically evaluate bias, fairness, and ethical implications of ML models in
                clinical settings. Understand regulatory considerations and trust frameworks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Trust Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Develop frameworks to assess when and whether to trust ML predictions in
                clinical practice. Balance accuracy with explainability and safety.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Learning Path */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Recommended Learning Path</h2>
        <Card>
          <CardContent className="pt-6">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold">Foundations of ML in Healthcare</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn what ML can and cannot do, prediction vs causation, and CDS categories
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold">Explore Synthetic Datasets</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand EHR data structure, preprocessing, and feature engineering
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  3
                </span>
                <div>
                  <h3 className="font-semibold">Train & Compare Models</h3>
                  <p className="text-sm text-muted-foreground">
                    Build interpretable models and understand accuracy vs interpretability tradeoffs
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  4
                </span>
                <div>
                  <h3 className="font-semibold">Master Explainability Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Use SHAP, LIME, and other tools to interpret model behavior
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  5
                </span>
                <div>
                  <h3 className="font-semibold">Evaluate Bias & Fairness</h3>
                  <p className="text-sm text-muted-foreground">
                    Identify potential biases and assess fairness across different populations
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
