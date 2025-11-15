import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Database, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export function Module2() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Button variant="ghost" className="mb-4" onClick={() => window.location.hash = 'learning'}>
          ← Back to Modules
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary">Module 2</Badge>
          <Badge>Beginner</Badge>
          <span className="text-sm text-muted-foreground">60 minutes</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Understanding Clinical Data</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Explore EHR data structure, preprocessing techniques, handling missingness, and feature engineering for clinical datasets.
        </p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Understand the structure and characteristics of Electronic Health Record (EHR) data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Identify different variable types in clinical data and their implications for ML</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Apply appropriate strategies for handling missing data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <span>Perform basic feature engineering relevant to clinical prediction tasks</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EHR Data Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Electronic Health Records contain rich, longitudinal patient information, but they present unique challenges for ML applications.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Key Characteristics of EHR Data</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Longitudinal:</strong> Multiple encounters over time</li>
                <li>• <strong>High-dimensional:</strong> Thousands of potential features</li>
                <li>• <strong>Sparse:</strong> Most tests/procedures not done for every patient</li>
                <li>• <strong>Heterogeneous:</strong> Mix of structured and unstructured data</li>
                <li>• <strong>Irregular timing:</strong> Measurements at non-uniform intervals</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-4">
            <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Example: Sepsis Prediction Dataset</h3>
            <p className="text-sm mb-2">A typical sepsis prediction model might include:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Demographics: age, sex</li>
              <li>• Vital signs: temperature, heart rate, blood pressure, respiratory rate</li>
              <li>• Lab values: white blood cell count, lactate, creatinine</li>
              <li>• Medical history: comorbidities, prior infections</li>
              <li>• Recent procedures: surgeries, catheter placement</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variable Types in Clinical Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 text-primary">Continuous</h3>
              <p className="text-sm text-muted-foreground mb-2">Numerical values on a scale</p>
              <p className="text-xs">Examples: Temperature (36.8°C), Heart rate (92 bpm), Age (54 years)</p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 text-primary">Categorical</h3>
              <p className="text-sm text-muted-foreground mb-2">Discrete categories</p>
              <p className="text-xs">Examples: Blood type (A/B/AB/O), Sex (M/F), Diagnosis codes</p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2 text-primary">Binary</h3>
              <p className="text-sm text-muted-foreground mb-2">Yes/No, Present/Absent</p>
              <p className="text-xs">Examples: Diabetes (yes/no), Smoker (yes/no), Fever present (yes/no)</p>
            </div>
          </div>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-sm">Why Variable Type Matters</h3>
              <p className="text-xs text-muted-foreground">
                Different ML algorithms handle different variable types differently. For example:
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground mt-2">
                <li>• Some models require numerical encoding of categorical variables</li>
                <li>• Continuous variables may need normalization or scaling</li>
                <li>• Ordinal variables (e.g., disease stage I-IV) preserve order information</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Handling Missing Values</CardTitle>
          <CardDescription>Missing data is ubiquitous in clinical datasets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Why Data is Missing in Healthcare</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tests not ordered because clinician didn't think they were necessary</li>
                    <li>• Patient declined procedure</li>
                    <li>• Technical failure or lab error</li>
                    <li>• Data entry errors or system issues</li>
                  </ul>
                  <p className="text-sm mt-2">
                    <strong>Critical insight:</strong> Missingness itself can be informative! Not ordering a test might indicate the clinician thought the patient was low-risk.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold">Strategies for Handling Missing Data</h3>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">1. Simple Imputation</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Replace with mean, median, or mode</li>
                <li>• Fast but ignores relationships between variables</li>
                <li>• Can introduce bias if data is not missing at random</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">2. Indicator Variables</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Create a binary "was missing" indicator</li>
                <li>• Allows model to learn if missingness is predictive</li>
                <li>• Example: "lactate_missing" variable alongside "lactate_value"</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-sm mb-2">3. Multiple Imputation</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Create multiple plausible complete datasets</li>
                <li>• More sophisticated, accounts for uncertainty</li>
                <li>• Computationally intensive</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Engineering</CardTitle>
          <CardDescription>Creating informative features from raw clinical data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Feature engineering is the process of transforming raw data into features that better represent
            the underlying problem to the ML model.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Common Feature Engineering Techniques</h3>

              <div className="space-y-3 mt-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Temporal Features</h4>
                  <p className="text-xs text-muted-foreground mb-1">Capture how values change over time</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Maximum heart rate in last 24 hours</li>
                    <li>• Trend in lactate (increasing/stable/decreasing)</li>
                    <li>• Time since last surgery</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Derived Clinical Scores</h4>
                  <p className="text-xs text-muted-foreground mb-1">Use established clinical risk scores as features</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• SOFA score (Sequential Organ Failure Assessment)</li>
                    <li>• NEWS score (National Early Warning Score)</li>
                    <li>• Charlson Comorbidity Index</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1">Interaction Features</h4>
                  <p className="text-xs text-muted-foreground mb-1">Combine multiple variables</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Shock index (heart rate / systolic blood pressure)</li>
                    <li>• Age × comorbidity count</li>
                    <li>• Fever + elevated WBC count (combined infection indicator)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-blue-500/50 bg-blue-500/10 p-4">
            <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Example: Sepsis Prediction</h3>
            <p className="text-sm">Raw features: Temperature = 38.5°C, Heart rate = 110 bpm</p>
            <p className="text-sm mt-2">Engineered features:</p>
            <ul className="text-xs space-y-1 mt-1">
              <li>• Fever present (binary): Yes</li>
              <li>• Tachycardia present (binary): Yes</li>
              <li>• SIRS criteria met: 2/4</li>
              <li>• Max temperature in last 6 hours: 39.1°C</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Quality Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Common Data Quality Issues</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Outliers:</strong> Impossible values (e.g., heart rate of 300) due to measurement errors</li>
              <li>• <strong>Inconsistencies:</strong> Conflicting information across different systems</li>
              <li>• <strong>Duplicate records:</strong> Same patient entered multiple times</li>
              <li>• <strong>Timing issues:</strong> Retrospective data entry causing incorrect timestamps</li>
              <li>• <strong>Unit mismatches:</strong> Temperature in Fahrenheit vs Celsius</li>
            </ul>
          </div>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-sm">Best Practice: Data Validation Pipeline</h3>
              <ol className="text-xs space-y-1 text-muted-foreground">
                <li>1. Check for impossible values (e.g., negative age)</li>
                <li>2. Verify units and convert if necessary</li>
                <li>3. Identify and handle duplicates</li>
                <li>4. Document all data transformations</li>
                <li>5. Maintain separate training and validation sets</li>
              </ol>
            </CardContent>
          </Card>
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
              <p className="text-sm">EHR data is longitudinal, high-dimensional, sparse, and heterogeneous—presenting unique challenges for ML.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">2</div>
              <p className="text-sm">Understanding variable types (continuous, categorical, binary) is crucial for appropriate preprocessing.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">3</div>
              <p className="text-sm">Missing data in healthcare is rarely random—missingness itself can be informative.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">4</div>
              <p className="text-sm">Feature engineering transforms raw clinical data into more informative representations for ML models.</p>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => window.location.hash = 'module-1'}>
          ← Previous: Foundations of ML
        </Button>
        <Button onClick={() => window.location.hash = 'module-3'}>
          Next: Logistic Regression
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
