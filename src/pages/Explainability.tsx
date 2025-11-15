import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Explainability() {
  const { selectedModel } = useStore();

  if (!selectedModel) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Explainability</h1>
          <p className="text-muted-foreground mt-2">
            Understand and interpret model predictions
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Explainability</h1>
        <p className="text-muted-foreground mt-2">
          Interpreting: {selectedModel.name}
        </p>
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

      {/* Feature Importance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Feature Importance</CardTitle>
          </div>
          <CardDescription>
            Which features contribute most to predictions
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

      {/* Educational Content */}
      <Card className="border-blue-500/50 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="text-lg">Understanding Feature Importance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Feature importance</strong> shows which variables have the strongest
            influence on the model's predictions.
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>
              For logistic regression: Based on the absolute magnitude of coefficients
            </li>
            <li>
              For tree-based models: Based on how much each feature reduces impurity
            </li>
            <li>
              Higher importance = stronger influence on predictions
            </li>
            <li>
              <strong>Important:</strong> Feature importance shows correlation, not causation
            </li>
          </ul>
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
