import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { Brain, Play, Trash2, BarChart } from 'lucide-react';
import { LogisticRegression } from '@/lib/ml/logistic-regression';
import { DecisionTree } from '@/lib/ml/decision-tree';
import type { ModelType, TrainedModel, PerformanceMetrics } from '@/types';

export function ModelLab() {
  const { selectedDataset, models, addModel, removeModel, setSelectedModel } = useStore();
  const [training, setTraining] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState<ModelType>('logistic_regression');

  const modelTypes = [
    { type: 'logistic_regression' as ModelType, name: 'Logistic Regression', description: 'Linear, highly interpretable' },
    { type: 'decision_tree' as ModelType, name: 'Decision Tree', description: 'Rule-based, visual interpretation' },
  ];

  const trainModel = async () => {
    if (!selectedDataset) {
      alert('Please select a dataset first');
      return;
    }

    setTraining(true);

    // Simulate async training
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const featureNames = selectedDataset.features
        .filter(f => f.type === 'continuous' || f.type === 'binary')
        .map(f => f.name);

      let model: LogisticRegression | DecisionTree;
      let predictions: number[];

      if (selectedModelType === 'logistic_regression') {
        model = new LogisticRegression(0.01, 1000);
        model.fit(selectedDataset.data, featureNames);
        predictions = model.predictBatch(selectedDataset.data);
      } else {
        model = new DecisionTree(5, 10);
        model.fit(selectedDataset.data, featureNames);
        predictions = model.predictBatch(selectedDataset.data);
      }

      // Calculate performance metrics
      const predicted = predictions.map(p => (p >= 0.5 ? 1 : 0));
      const actual = selectedDataset.data.map(d => d.outcome);

      let tp = 0, tn = 0, fp = 0, fn = 0;
      for (let i = 0; i < predicted.length; i++) {
        if (predicted[i] === 1 && actual[i] === 1) tp++;
        else if (predicted[i] === 0 && actual[i] === 0) tn++;
        else if (predicted[i] === 1 && actual[i] === 0) fp++;
        else fn++;
      }

      const accuracy = (tp + tn) / (tp + tn + fp + fn);
      const sensitivity = tp / (tp + fn) || 0;
      const specificity = tn / (tn + fp) || 0;
      const ppv = tp / (tp + fp) || 0;
      const npv = tn / (tn + fn) || 0;

      // Simple AUC calculation
      const sorted = predictions.map((score, i) => ({ score, label: actual[i] }))
        .sort((a, b) => b.score - a.score);
      let auc = 0;
      let tpr = 0, fpr = 0;
      const positives = actual.filter(l => l === 1).length;
      const negatives = actual.length - positives;
      let prevFpr = 0;

      for (const item of sorted) {
        if (item.label === 1) {
          tpr += 1 / positives;
        } else {
          fpr += 1 / negatives;
          auc += tpr * (fpr - prevFpr);
          prevFpr = fpr;
        }
      }

      // Brier score
      const brier = predictions.reduce((sum, prob, i) => {
        return sum + Math.pow(prob - actual[i], 2);
      }, 0) / predictions.length;

      const metrics: PerformanceMetrics = {
        accuracy,
        sensitivity,
        specificity,
        ppv,
        npv,
        auc,
        brier,
        f1Score: 2 * (ppv * sensitivity) / (ppv + sensitivity) || 0,
        confusionMatrix: { tp, tn, fp, fn },
      };

      const trainedModel: TrainedModel = {
        id: `model_${Date.now()}`,
        name: `${modelTypes.find(m => m.type === selectedModelType)?.name} - ${selectedDataset.name}`,
        type: selectedModelType,
        config: {
          type: selectedModelType,
          hyperparameters: {},
        },
        datasetId: selectedDataset.id,
        trainedAt: new Date().toISOString(),
        metrics,
        featureImportance: model.getFeatureImportance(),
      };

      addModel(trainedModel);
      setSelectedModel(trainedModel);
    } catch (error) {
      console.error('Training error:', error);
      alert('Error training model');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Laboratory</h1>
        <p className="text-muted-foreground mt-2">
          Train and compare machine learning models
        </p>
      </div>

      {/* Model Training */}
      <Card>
        <CardHeader>
          <CardTitle>Train New Model</CardTitle>
          <CardDescription>
            Select a model type and train on the currently selected dataset
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDataset ? (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Selected Dataset:</p>
                <Badge variant="secondary">{selectedDataset.name}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Model Type:</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {modelTypes.map((modelType) => (
                    <div
                      key={modelType.type}
                      onClick={() => setSelectedModelType(modelType.type)}
                      className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                        selectedModelType === modelType.type ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <h3 className="font-semibold">{modelType.name}</h3>
                      <p className="text-sm text-muted-foreground">{modelType.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={trainModel}
                disabled={training}
                className="w-full"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {training ? 'Training...' : 'Train Model'}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Please select a dataset from the Datasets page first
              </p>
              <Button variant="outline" className="mt-4">
                Go to Datasets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trained Models */}
      {models.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Trained Models</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Brain className="h-8 w-8 text-primary" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeModel(model.id)}
                      aria-label="Delete model"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <CardTitle className="mt-2">{model.name}</CardTitle>
                  <CardDescription>
                    Trained {new Date(model.trainedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="text-2xl font-bold">
                        {(model.metrics.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AUC</p>
                      <p className="text-2xl font-bold">
                        {model.metrics.auc.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sensitivity</p>
                      <p className="text-lg font-semibold">
                        {(model.metrics.sensitivity * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Specificity</p>
                      <p className="text-lg font-semibold">
                        {(model.metrics.specificity * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium mb-2">Top Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {model.featureImportance.slice(0, 3).map((fi) => (
                        <Badge key={fi.feature} variant="secondary" className="text-xs">
                          {fi.feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedModel(model)}
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
