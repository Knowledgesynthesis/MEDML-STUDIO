import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

export function Module1() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => window.location.hash = 'learning'}
        >
          ← Back to Modules
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary">Module 1</Badge>
          <Badge>Beginner</Badge>
          <span className="text-sm text-muted-foreground">45 minutes</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Foundations of ML in Healthcare
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Learn what ML can and cannot do in clinical contexts, understand prediction vs causation, and explore CDS categories.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Define machine learning and distinguish it from traditional statistical methods</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Understand the fundamental difference between prediction and causation in medicine</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Identify different categories of clinical decision support systems</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Recognize regulatory frameworks governing ML in healthcare (FDA, EU AI Act)</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 1 */}
      <Card>
        <CardHeader>
          <CardTitle>What is Machine Learning?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            <strong>Machine Learning (ML)</strong> is a subset of artificial intelligence that enables
            computers to learn patterns from data without being explicitly programmed for every scenario.
            Instead of following rigid if-then rules, ML models identify relationships in training data
            and use those patterns to make predictions on new, unseen cases.
          </p>

          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold mb-2">Key Characteristics of ML</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                <span><strong>Data-Driven:</strong> Learns from examples rather than explicit rules</span>
              </li>
              <li className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                <span><strong>Pattern Recognition:</strong> Identifies complex relationships in data</span>
              </li>
              <li className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                <span><strong>Generalization:</strong> Applies learned patterns to new cases</span>
              </li>
              <li className="flex gap-2">
                <ChevronRight className="h-4 w-4 text-primary mt-0.5" />
                <span><strong>Continuous Improvement:</strong> Can be retrained with new data</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-4">
            <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Clinical Example</h3>
            <p className="text-sm">
              A traditional clinical decision rule for sepsis might state: "If temperature &gt; 38°C AND
              heart rate &gt; 90 bpm AND white blood cell count &gt; 12,000, flag as high risk."
            </p>
            <p className="text-sm mt-2">
              An ML model, in contrast, learns from thousands of patient cases to identify which
              combinations of vital signs, lab values, and demographics best predict sepsis—including
              subtle patterns that rigid rules might miss.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card>
        <CardHeader>
          <CardTitle>ML vs Traditional Statistical Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 text-primary">Traditional Statistics</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Hypothesis-driven</li>
                <li>• Emphasizes inference and interpretation</li>
                <li>• Typically linear relationships</li>
                <li>• Well-understood assumptions</li>
                <li>• Transparent and explainable</li>
                <li>• Example: Logistic regression</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 text-primary">Machine Learning</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Prediction-focused</li>
                <li>• Emphasizes accuracy</li>
                <li>• Can model complex, non-linear patterns</li>
                <li>• Black-box models common</li>
                <li>• Often requires explainability tools</li>
                <li>• Example: Random forests, neural networks</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> The distinction is not always clear-cut. Logistic regression, for instance,
            can be considered both a statistical model and a simple ML algorithm. What matters is the <em>approach</em>:
            traditional statistics focuses on understanding relationships, while ML focuses on making accurate predictions.
          </p>
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction vs Causation in Medicine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Critical Distinction</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Prediction:</strong> "Patients with these characteristics are likely to develop sepsis."<br />
                    <strong>Causation:</strong> "This intervention will prevent sepsis."
                  </p>
                  <p className="text-sm mt-2">
                    ML models identify <strong>correlations</strong> and make predictions based on patterns.
                    They do NOT establish causation or tell us what interventions will work.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold">Why This Matters in Clinical Practice</h3>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">What ML Can Do ✓</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Predict risk of readmission based on patient characteristics</li>
                <li>• Identify patients likely to develop complications</li>
                <li>• Estimate probability of disease given symptoms and test results</li>
                <li>• Flag high-risk cases for closer monitoring</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">What ML Cannot Do ✗</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Determine whether a specific treatment caused an outcome</li>
                <li>• Replace randomized controlled trials for intervention testing</li>
                <li>• Establish mechanism of disease</li>
                <li>• Make autonomous clinical decisions without human oversight</li>
              </ul>
            </div>
          </div>

          <p className="text-sm font-medium">
            Remember: An ML model can tell you a patient is high-risk, but it cannot tell you what
            intervention will definitively improve their outcome. Clinical judgment, evidence-based
            medicine, and causal inference methods remain essential.
          </p>
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Decision Support (CDS) Categories</CardTitle>
          <CardDescription>Understanding where ML fits in the CDS landscape</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">Type 1</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Knowledge-Based CDS</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Rule-based systems using clinical guidelines and evidence-based protocols.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Example: Alert when antibiotics are ordered for viral infection
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">Type 2</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Non-Knowledge-Based CDS (ML-Based)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Systems that learn patterns from data rather than following explicit rules.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Example: ML model predicting sepsis risk from vital signs and lab values
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">Type 3</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Hybrid Systems</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Combine rule-based logic with ML predictions for enhanced decision support.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Example: ML risk score that triggers rule-based clinical workflow
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5 */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Oversight</CardTitle>
          <CardDescription>Understanding the regulatory landscape for ML in healthcare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">FDA</Badge>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Software as a Medical Device (SaMD)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The FDA regulates ML-based CDS as medical devices when they meet certain criteria,
                  particularly if they influence clinical management directly.
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Class I: Low risk (e.g., some screening tools)</li>
                  <li>• Class II: Moderate risk (most ML-based CDS)</li>
                  <li>• Class III: High risk (life-sustaining devices)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">EU</Badge>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">EU AI Act</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  European Union classifies healthcare AI as <strong>high-risk</strong>, requiring:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Rigorous pre-market validation</li>
                  <li>• Transparency and explainability</li>
                  <li>• Human oversight mechanisms</li>
                  <li>• Post-market surveillance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h3 className="font-semibold mb-2 text-sm">Key Regulatory Principles</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Models must be validated on representative populations</li>
              <li>• Performance must be monitored continuously in real-world use</li>
              <li>• Clinicians must understand how the model makes predictions</li>
              <li>• There must be clear accountability for model failures</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <p className="text-sm">
                ML learns patterns from data to make predictions, not to establish causation or replace
                evidence-based clinical guidelines.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <p className="text-sm">
                The line between traditional statistics and ML is blurry—what matters is the approach
                (inference vs prediction).
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <p className="text-sm">
                Prediction ≠ Causation. ML can identify high-risk patients but cannot prove that
                interventions will work.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                4
              </div>
              <p className="text-sm">
                ML-based CDS systems fall under regulatory oversight (FDA, EU AI Act) and must meet
                rigorous validation, transparency, and monitoring requirements.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => window.location.hash = 'learning'}
        >
          Back to Modules
        </Button>
        <Button
          onClick={() => window.location.hash = 'module-2'}
        >
          Next Module: Understanding Clinical Data
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
