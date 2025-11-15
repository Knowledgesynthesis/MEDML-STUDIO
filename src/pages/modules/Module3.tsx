import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';

export function Module3() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Button variant="ghost" className="mb-4" onClick={() => window.location.hash = 'learning'}>
          ← Back to Modules
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary">Module 3</Badge>
          <Badge>Beginner</Badge>
          <span className="text-sm text-muted-foreground">75 minutes</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Interpretable Models: Logistic Regression</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Deep dive into logistic regression - the most interpretable baseline model for binary classification in clinical settings.
        </p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Understand how logistic regression transforms linear combinations into probabilities</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Interpret model coefficients and translate them into odds ratios</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Recognize key assumptions and limitations of logistic regression</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Determine when logistic regression is appropriate for clinical prediction</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Logistic Regression Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Logistic regression is a statistical method for predicting binary outcomes (yes/no, diseased/healthy, readmitted/not readmitted).
            Despite its name, it's used for <strong>classification</strong>, not regression.
          </p>

          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold mb-2">The Logistic Function</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Logistic regression uses the sigmoid (logistic) function to transform a linear combination of features into a probability between 0 and 1:
            </p>
            <div className="bg-background p-3 rounded font-mono text-sm">
              P(Y=1) = 1 / (1 + e^-(β₀ + β₁X₁ + β₂X₂ + ... + βₙXₙ))
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Where β₀ is the intercept, β₁...βₙ are coefficients, and X₁...Xₙ are features
            </p>
          </div>

          <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-4">
            <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Clinical Example: Sepsis Prediction</h3>
            <p className="text-sm mb-2">Model: P(Sepsis) = 1 / (1 + e^-(logit))</p>
            <p className="text-sm mb-2">Where logit = -5.0 + 0.8×(Fever) + 1.2×(High_WBC) + 0.05×(Age)</p>
            <p className="text-sm mt-2">For a 60-year-old patient with fever and high WBC:</p>
            <p className="text-sm">logit = -5.0 + 0.8×1 + 1.2×1 + 0.05×60 = -0.0</p>
            <p className="text-sm">P(Sepsis) = 1 / (1 + e^0) = 0.50 or 50%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interpreting Coefficients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            The coefficients (β values) tell us how much each feature influences the log-odds of the outcome.
            This can be translated into more clinically meaningful <strong>odds ratios</strong>.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">From Coefficients to Odds Ratios</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Odds Ratio = e^β
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• β = 0 → OR = 1 (no effect)</li>
                <li>• β &gt; 0 → OR &gt; 1 (increases odds)</li>
                <li>• β &lt; 0 → OR &lt; 1 (decreases odds)</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Clinical Interpretation Example</h3>
              <p className="text-sm mb-2">If β for "Diabetes" = 0.69:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• OR = e^0.69 ≈ 2.0</li>
                <li>• Interpretation: "Having diabetes doubles the odds of the outcome"</li>
                <li>• More precisely: "The odds of readmission are 2 times higher in diabetic patients vs non-diabetic, holding all other variables constant"</li>
              </ul>
            </div>
          </div>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-sm">Important Distinction: Odds vs Probability</h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• <strong>Probability:</strong> P = 0.20 means "20% chance"</li>
                <li>• <strong>Odds:</strong> Odds = P/(1-P) = 0.20/0.80 = 0.25 or "1:4"</li>
                <li>• Don't confuse "2x the odds" with "2x the probability"!</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Like all statistical models, logistic regression makes assumptions that should be checked:
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1 text-sm">1. Linear relationship (in the log-odds)</h3>
              <p className="text-xs text-muted-foreground">
                The relationship between continuous predictors and the log-odds must be approximately linear.
                Non-linear relationships may need transformation (e.g., age-squared).
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1 text-sm">2. Independence of observations</h3>
              <p className="text-xs text-muted-foreground">
                Each patient should be independent. Multiple measurements from the same patient violate this
                (use mixed-effects models instead).
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1 text-sm">3. No perfect multicollinearity</h3>
              <p className="text-xs text-muted-foreground">
                Predictor variables shouldn't be perfectly correlated. High correlation makes coefficients
                unstable and hard to interpret.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-1 text-sm">4. Sufficient sample size</h3>
              <p className="text-xs text-muted-foreground">
                Rule of thumb: At least 10 events (outcomes) per predictor variable. Fewer events lead to
                overfitting and unreliable estimates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">What Logistic Regression Cannot Do</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Complex non-linear relationships:</strong> Assumes linear log-odds; may miss intricate patterns</li>
              <li>• <strong>Automatic feature interactions:</strong> Needs manual specification (e.g., Age × Comorbidity)</li>
              <li>• <strong>Handle high-dimensional sparse data well:</strong> Can overfit with too many predictors</li>
              <li>• <strong>Capture temporal dynamics:</strong> Doesn't model how risk changes over time without feature engineering</li>
            </ul>
          </div>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-sm">When More Complex Models May Be Needed</h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Highly non-linear relationships in the data</li>
                <li>• Complex interactions between many variables</li>
                <li>• Need for maximum predictive accuracy (at cost of interpretability)</li>
                <li>• Very high-dimensional feature space</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When to Use Logistic Regression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-4">
            <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">Ideal Scenarios</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>When interpretability is paramount (regulatory approval, clinical trust)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>As a strong baseline to compare more complex models against</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>When relationships are approximately linear in log-odds</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>For risk prediction models that need to be explained to patients</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>When you have moderate sample sizes and limited features</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">1</div>
              <p className="text-sm">Logistic regression is highly interpretable: each coefficient has a clear meaning as a log-odds or odds ratio.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">2</div>
              <p className="text-sm">Coefficients tell you the direction and magnitude of each feature's effect on the outcome.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">3</div>
              <p className="text-sm">The model assumes linear relationships in log-odds space and independence of observations.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">4</div>
              <p className="text-sm">Use logistic regression when interpretability is crucial, as a baseline, or when relationships are approximately linear.</p>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => window.location.hash = 'module-2'}>
          ← Previous: Clinical Data
        </Button>
        <Button onClick={() => window.location.hash = 'module-4'}>
          Next: Decision Trees
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
