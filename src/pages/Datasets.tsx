import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store';
import { Database, TrendingUp, Users } from 'lucide-react';

export function Datasets() {
  const { datasets, selectedDataset, setSelectedDataset, initialize } = useStore();

  useEffect(() => {
    if (datasets.length === 0) {
      initialize();
    }
  }, [datasets, initialize]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Synthetic Datasets</h1>
        <p className="text-muted-foreground mt-2">
          Explore synthetic clinical datasets designed for ML education
        </p>
      </div>

      {/* Datasets Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {datasets.map((dataset) => (
          <Card
            key={dataset.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedDataset?.id === dataset.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedDataset(dataset)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <Database className="h-8 w-8 text-primary" />
                {selectedDataset?.id === dataset.id && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
              <CardTitle className="mt-2">{dataset.name}</CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Clinical Context */}
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-foreground">{dataset.clinicalContext}</p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Samples</span>
                  </div>
                  <p className="text-2xl font-bold">{dataset.size}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Prevalence</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {(dataset.prevalence * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Features</div>
                  <p className="text-2xl font-bold">{dataset.features.length}</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="text-sm font-medium mb-2">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {dataset.features.slice(0, 5).map((feature) => (
                    <Badge key={feature.name} variant="secondary">
                      {feature.name}
                    </Badge>
                  ))}
                  {dataset.features.length > 5 && (
                    <Badge variant="outline">+{dataset.features.length - 5} more</Badge>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                variant={selectedDataset?.id === dataset.id ? 'default' : 'outline'}
              >
                {selectedDataset?.id === dataset.id ? 'Explore Dataset' : 'Select Dataset'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Dataset Details */}
      {selectedDataset && (
        <Card>
          <CardHeader>
            <CardTitle>Dataset Details: {selectedDataset.name}</CardTitle>
            <CardDescription>Feature descriptions and characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDataset.features.map((feature) => (
                <div
                  key={feature.name}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{feature.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {feature.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {feature.description}
                    </p>
                    {feature.normalRange && (
                      <p className="text-xs text-muted-foreground">
                        Normal range: {feature.normalRange.min} - {feature.normalRange.max}
                        {feature.unit && ` ${feature.unit}`}
                      </p>
                    )}
                    {feature.categories && (
                      <p className="text-xs text-muted-foreground">
                        Categories: {feature.categories.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Outcome Variable</h3>
              <p className="text-sm text-muted-foreground">{selectedDataset.outcomeLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Prevalence: {(selectedDataset.prevalence * 100).toFixed(1)}% ({' '}
                {Math.round(selectedDataset.size * selectedDataset.prevalence)} positive cases
                out of {selectedDataset.size} total samples)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
