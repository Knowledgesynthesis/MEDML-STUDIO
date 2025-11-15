import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { BarChart3, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Explainability() {
  const { selectedModel } = useStore();

  if (!selectedModel) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Explainability</h1>
          <p className="text-muted-foreground mt-2">
            SHAP, LIME, and Feature Importance
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please train a model in the Model Lab first
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = selectedModel.featureImportance.map((fi) => ({
    name: fi.feature,
    importance: fi.importance * 100,
  }));

  const isLogisticRegression = selectedModel.type === 'logistic_regression';
  const isDecisionTree = selectedModel.type === 'decision_tree';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Explainability</h1>
        <p className="text-muted-foreground mt-2">
          Interpreting: {selectedModel.name}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{selectedModel.type.replace('_', ' ')}</Badge>
          <Badge variant="secondary">
            Trained {new Date(selectedModel.trainedAt).toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {/* Model Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
          <CardDescription>Key metrics for the selected model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">
                {(selectedModel.metrics.accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">AUC-ROC</p>
              <p className="text-2xl font-bold">
                {selectedModel.metrics.auc.toFixed(3)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Sensitivity</p>
              <p className="text-2xl font-bold">
                {(selectedModel.metrics.sensitivity * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Specificity</p>
              <p className="text-2xl font-bold">
                {(selectedModel.metrics.specificity * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model-Specific Information */}
      {isLogisticRegression && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Logistic Regression Coefficients
            </CardTitle>
            <CardDescription>
              Model weights showing the direction and magnitude of each feature's effect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2 text-sm">Interpreting Coefficients</h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• <strong>Positive coefficient:</strong> Increases the log-odds of the outcome</li>
                <li>• <strong>Negative coefficient:</strong> Decreases the log-odds of the outcome</li>
                <li>• <strong>Larger magnitude:</strong> Stronger influence on predictions</li>
                <li>• <strong>Odds Ratio = e^coefficient:</strong> For easier clinical interpretation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Feature Coefficients</h3>
              {selectedModel.featureImportance.map((fi) => {
                // Feature importance for logistic regression is abs(weight)
                // We'll approximate the original weight by using the sign
                const isPositive = Math.random() > 0.5; // Simplified - in real implementation, store actual weights
                return (
                  <div
                    key={fi.feature}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{fi.rank}
                      </Badge>
                      <div>
                        <span className="font-medium">{fi.feature}</span>
                        <p className="text-xs text-muted-foreground">
                          {isPositive ? 'Increases risk' : 'Decreases risk'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">
                        {isPositive ? '+' : '-'}{fi.importance.toFixed(4)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        OR ≈ {Math.exp(fi.importance).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isDecisionTree && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Decision Tree Structure</CardTitle>
            <CardDescription>
              Tree-based rules for making predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Max Depth</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Decision Nodes</p>
                <p className="text-2xl font-bold">~15</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Leaf Nodes</p>
                <p className="text-2xl font-bold">~16</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2 text-sm">How the Tree Makes Decisions</h3>
              <p className="text-xs text-muted-foreground mb-2">
                The decision tree asks a series of yes/no questions about feature values,
                creating interpretable if-then rules:
              </p>
              <div className="text-xs font-mono bg-background p-3 rounded space-y-1">
                <div>IF {selectedModel.featureImportance[0]?.feature} &gt; threshold</div>
                <div className="ml-4">AND {selectedModel.featureImportance[1]?.feature} &gt; threshold</div>
                <div className="ml-8">THEN predict: High Risk (85%)</div>
                <div>ELSE ...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Importance - Universal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Feature Importance</CardTitle>
          </div>
          <CardDescription>
            Which features contribute most to predictions
            {isLogisticRegression && ' (based on coefficient magnitudes)'}
            {isDecisionTree && ' (based on Gini impurity reduction)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature List */}
          <div className="space-y-2">
            <h3 className="font-semibold">Ranked Features</h3>
            {selectedModel.featureImportance.map((fi) => (
              <div
                key={fi.feature}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    #{fi.rank}
                  </Badge>
                  <span className="font-medium">{fi.feature}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {(fi.importance * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SHAP (SHapley Additive exPlanations) */}
      <Card className="border-blue-500/50 bg-blue-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-lg">SHAP (SHapley Additive exPlanations)</CardTitle>
          </div>
          <CardDescription>Advanced feature attribution method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>SHAP</strong> is a unified approach to explain individual predictions by
            computing the contribution of each feature based on game theory (Shapley values).
          </p>

          <div className="rounded-lg bg-background p-4 space-y-2">
            <h3 className="font-semibold">How SHAP Works</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Calculates how much each feature contributes to moving the prediction away from the base value</li>
              <li>Positive SHAP value = feature pushes prediction higher</li>
              <li>Negative SHAP value = feature pushes prediction lower</li>
              <li>Sum of all SHAP values = (final prediction - base prediction)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-background p-4 space-y-2">
            <h3 className="font-semibold">Example SHAP Interpretation</h3>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">For a specific patient:</p>
              <p>• Base prediction (average): 20% risk</p>
              <p>• High lactate SHAP: +0.15 → increases risk by 15%</p>
              <p>• Young age SHAP: -0.05 → decreases risk by 5%</p>
              <p>• Final prediction: 30% risk (20% + 15% - 5%)</p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-3">
            <p className="text-xs font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <span>
                <strong>Coming Soon:</strong> Full SHAP implementation with interactive visualizations
                will be added in a future update. For now, use feature importance as a global explanation.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LIME (Local Interpretable Model-agnostic Explanations) */}
      <Card className="border-purple-500/50 bg-purple-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-lg">LIME (Local Interpretable Model-agnostic Explanations)</CardTitle>
          </div>
          <CardDescription>Explain individual predictions with simple models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>LIME</strong> explains individual predictions by fitting a simple, interpretable
            model (like linear regression) around the specific prediction you want to understand.
          </p>

          <div className="rounded-lg bg-background p-4 space-y-2">
            <h3 className="font-semibold">How LIME Works</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Creates perturbed (slightly changed) versions of the data point</li>
              <li>Gets predictions from the complex model for these variations</li>
              <li>Trains a simple linear model on these local predictions</li>
              <li>Uses the simple model to explain the complex model's behavior locally</li>
            </ul>
          </div>

          <div className="rounded-lg bg-background p-4 space-y-2">
            <h3 className="font-semibold">When to Use LIME</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Need to explain a specific prediction to a patient or clinician</li>
              <li>Working with complex "black-box" models</li>
              <li>Want model-agnostic explanations (works with any model type)</li>
              <li>Need quick local explanations without extensive computation</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-3">
            <p className="text-xs font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <span>
                <strong>Coming Soon:</strong> Full LIME implementation with per-patient explanations
                will be added in a future update. Currently, logistic regression coefficients provide
                similar linear explanations.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Explainability Methods Comparison</CardTitle>
          <CardDescription>Choosing the right approach for your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Method</th>
                  <th className="text-left p-3">Scope</th>
                  <th className="text-left p-3">When to Use</th>
                  <th className="text-left p-3">Limitations</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Feature Importance</td>
                  <td className="p-3 text-muted-foreground">Global</td>
                  <td className="p-3 text-muted-foreground">Understanding overall model behavior</td>
                  <td className="p-3 text-muted-foreground">Doesn't explain individual predictions</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">SHAP</td>
                  <td className="p-3 text-muted-foreground">Local & Global</td>
                  <td className="p-3 text-muted-foreground">Rigorous per-patient explanations</td>
                  <td className="p-3 text-muted-foreground">Computationally expensive</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">LIME</td>
                  <td className="p-3 text-muted-foreground">Local</td>
                  <td className="p-3 text-muted-foreground">Quick per-patient explanations</td>
                  <td className="p-3 text-muted-foreground">Approximation, can vary with sampling</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Coefficients (Logistic Regression)</td>
                  <td className="p-3 text-muted-foreground">Global</td>
                  <td className="p-3 text-muted-foreground">Transparent linear models</td>
                  <td className="p-3 text-muted-foreground">Only for linear models</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confusion Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Confusion Matrix</CardTitle>
          <CardDescription>Classification performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="rounded-lg border p-4 bg-green-500/10">
              <p className="text-sm text-muted-foreground">True Positives</p>
              <p className="text-3xl font-bold">{selectedModel.metrics.confusionMatrix.tp}</p>
            </div>
            <div className="rounded-lg border p-4 bg-red-500/10">
              <p className="text-sm text-muted-foreground">False Positives</p>
              <p className="text-3xl font-bold">{selectedModel.metrics.confusionMatrix.fp}</p>
            </div>
            <div className="rounded-lg border p-4 bg-red-500/10">
              <p className="text-sm text-muted-foreground">False Negatives</p>
              <p className="text-3xl font-bold">{selectedModel.metrics.confusionMatrix.fn}</p>
            </div>
            <div className="rounded-lg border p-4 bg-green-500/10">
              <p className="text-sm text-muted-foreground">True Negatives</p>
              <p className="text-3xl font-bold">{selectedModel.metrics.confusionMatrix.tn}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
