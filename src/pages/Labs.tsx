import { useState } from 'react';
import { Link } from '@/components/Link';
import { Card, CardBody, Segmented, Badge } from '@/components/ui';
import { ModelComparisonWidget, OddsRatioWidget, TreeDepthWidget, NonlinearityWidget } from '@/components/widgets/ModelWidgets';
import { CalibrationWidget, DcaWidget, ImbalanceWidget, ThresholdWidget } from '@/components/widgets/EvalWidgets';
import { ImportanceWidget, LimeWidget, PdpWidget, ShapWidget } from '@/components/widgets/ExplainWidgets';
import { FairnessWidget, LabelBiasWidget } from '@/components/widgets/FairnessWidgets';
import { ShiftWidget } from '@/components/widgets/DeployWidgets';
import { LeakageWidget, MissingnessWidget } from '@/components/widgets/DataWidgets';
import { getCohort } from '@/lib/lab';
import { MODEL_INFO, type ModelKind } from '@/lib/ml/pipeline';
import { quantile } from '@/lib/ml/stats';
import { cn, pct } from '@/lib/utils';
import type { DatasetId } from '@/lib/data/datasets';

const TABS = [
  { id: '', label: 'Data & models' },
  { id: 'evaluate', label: 'Evaluate' },
  { id: 'explain', label: 'Explain' },
  { id: 'fairness', label: 'Fairness' },
  { id: 'deploy', label: 'Deploy' },
];

function DatasetExplorer() {
  const [id, setId] = useState<DatasetId>('sepsis');
  const c = getCohort(id);
  const { ds } = c;
  const prev = ds.y.reduce((s, v) => s + v, 0) / ds.y.length;
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Synthetic cohorts</h2>
          <Segmented
            label="Dataset"
            value={id}
            onChange={setId}
            options={[
              { value: 'sepsis', label: 'ED sepsis' },
              { value: 'diabetes', label: 'Incident T2D' },
            ]}
          />
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-fg">Population</dt>
            <dd>{ds.setting}</dd>
          </div>
          <div>
            <dt className="text-muted-fg">Outcome</dt>
            <dd>{ds.outcome}</dd>
          </div>
          <div>
            <dt className="text-muted-fg">Prediction time</dt>
            <dd>{ds.predictionTime}</dd>
          </div>
          <div>
            <dt className="text-muted-fg">Size</dt>
            <dd>
              {ds.y.length.toLocaleString()} patients · {pct(prev, 1)} with the outcome · train {c.train.length.toLocaleString()} / test {c.test.length.toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-fg">
                <th className="py-1.5">Predictor</th>
                <th className="py-1.5 text-right">Median (IQR) or %</th>
                <th className="py-1.5 text-right">Missing</th>
                <th className="py-1.5 pl-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {ds.features.map((f, j) => {
                const col = ds.X.map((r) => r[j]);
                const obs = col.filter((v) => !Number.isNaN(v));
                const miss = 1 - obs.length / col.length;
                const d = f.decimals ?? 1;
                const summary =
                  f.type === 'binary'
                    ? pct(obs.reduce((s, v) => s + v, 0) / obs.length)
                    : `${quantile(obs, 0.5).toFixed(d)} (${quantile(obs, 0.25).toFixed(d)}–${quantile(obs, 0.75).toFixed(d)})${f.unit ? ` ${f.unit}` : ''}`;
                return (
                  <tr key={f.key} className="border-b">
                    <td className="py-1.5 font-medium">{f.label}</td>
                    <td className="num py-1.5 text-right font-mono text-xs">{summary}</td>
                    <td className={cn('num py-1.5 text-right font-mono text-xs', miss > 0 && 'text-warn')}>{pct(miss)}</td>
                    <td className="py-1.5 pl-3 text-xs text-muted-fg">{f.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">Known data-generating process</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-fg">
            {ds.dgp.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}

function ModelCatalog() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(MODEL_INFO) as ModelKind[]).map((k) => (
        <div key={k} className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">{MODEL_INFO[k].name}</div>
            <Badge>{MODEL_INFO[k].short}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-fg">{MODEL_INFO[k].summary}</p>
        </div>
      ))}
    </div>
  );
}

export function Labs({ tab = '' }: { tab?: string }) {
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Labs</h1>
        <p className="text-muted-fg">
          Every lab trains real models in your browser on the same synthetic cohorts and the same held-out test patients used in the course. Results are deterministic, so you
          and a colleague will see identical numbers.
        </p>
      </header>
      <nav aria-label="Lab sections" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            to={t.id ? `/lab/${t.id}` : '/lab'}
            aria-current={current.id === t.id ? 'page' : undefined}
            className={cn('rounded-md px-3 py-1.5 text-sm', current.id === t.id ? 'bg-card font-medium shadow-sm' : 'text-muted-fg hover:text-fg')}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {current.id === '' && (
        <>
          <DatasetExplorer />
          <ModelCatalog />
          <ModelComparisonWidget />
          <OddsRatioWidget />
          <NonlinearityWidget />
          <TreeDepthWidget />
        </>
      )}
      {current.id === 'evaluate' && (
        <>
          <ThresholdWidget />
          <CalibrationWidget />
          <DcaWidget />
          <ImbalanceWidget />
        </>
      )}
      {current.id === 'explain' && (
        <>
          <ShapWidget />
          <LimeWidget />
          <PdpWidget />
          <ImportanceWidget />
        </>
      )}
      {current.id === 'fairness' && (
        <>
          <FairnessWidget />
          <LabelBiasWidget />
        </>
      )}
      {current.id === 'deploy' && (
        <>
          <ShiftWidget />
          <LeakageWidget />
          <MissingnessWidget />
        </>
      )}
    </div>
  );
}
