import { useState } from 'react';
import { Segmented, Slider, Stat, Loading, Button, Legend, Toggle } from '@/components/ui';
import { Chart, Line } from '@/components/chart/Chart';
import { HBars, Waterfall } from '@/components/chart/HBars';
import { WidgetFrame } from './Frame';
import { fx, pct } from '@/lib/utils';
import { getCohort, getModel, getPreds, useComputed, STANDARD_SPECS, type Cohort } from '@/lib/lab';
import { MODEL_INFO, type FittedModel, type ModelKind } from '@/lib/ml/pipeline';
import { exactShap, lime, partialDependence, permutationImportance } from '@/lib/ml/explain';
import { LogisticRegression } from '@/lib/ml/models';
import { Rng, mean, sd } from '@/lib/ml/stats';
import type { DatasetId } from '@/lib/data/datasets';

const EXPLAIN_KINDS: ModelKind[] = ['logistic_quadratic', 'forest', 'boosting'];

function formatValue(c: Cohort, j: number, v: number): string {
  const f = c.ds.features[j];
  if (Number.isNaN(v)) return `${f.label}: not measured`;
  if (f.type === 'binary') return `${f.label}: ${v ? 'yes' : 'no'}`;
  return `${f.label} = ${v.toFixed(f.decimals ?? 1)}${f.unit ? ` ${f.unit}` : ''}`;
}

function background(c: Cohort, n = 50): number[][] {
  return new Rng(99).shuffle(c.Xtr).slice(0, n);
}

type PatientPick = 'high' | 'median' | 'missing' | 'low';

function choosePatient(ds: DatasetId, how: PatientPick): number {
  const c = getCohort(ds);
  const p = getPreds(ds, STANDARD_SPECS.logistic_quadratic, 'test');
  const order = p.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  if (how === 'high') return order[order.length - 3][1];
  if (how === 'low') return order[5][1];
  if (how === 'missing' && ds === 'sepsis') {
    const cand = order.filter(([, i]) => Number.isNaN(c.Xte[i][6]));
    return cand[Math.floor(cand.length * 0.9)][1];
  }
  return order[Math.floor(order.length / 2)][1];
}

function PatientPicker({ value, onChange, ds }: { value: PatientPick; onChange: (v: PatientPick) => void; ds: DatasetId }) {
  const opts: { value: PatientPick; label: string }[] = [
    { value: 'high', label: 'High-risk patient' },
    { value: 'median', label: 'Typical patient' },
    { value: 'low', label: 'Low-risk patient' },
  ];
  if (ds === 'sepsis') opts.splice(1, 0, { value: 'missing', label: 'High risk, no lactate' });
  return <Segmented label="Patient" value={value} onChange={onChange} options={opts} />;
}

/* ───────────── SHAP waterfall ───────────── */

export function ShapWidget() {
  const [ds, setDs] = useState<DatasetId>('sepsis');
  const [who, setWho] = useState<PatientPick>('high');
  const [kind, setKind] = useState<ModelKind>('boosting');
  const [scale, setScale] = useState<'probability' | 'log-odds'>('probability');
  const r = useComputed(() => {
    const c = getCohort(ds);
    const i = choosePatient(ds, who === 'missing' && ds !== 'sepsis' ? 'high' : who);
    const x = c.Xte[i];
    const bg = background(c);
    const runs = EXPLAIN_KINDS.map((k) => {
      const m = getModel(ds, STANDARD_SPECS[k]);
      return { k, shap: exactShap((X) => m.predict(X), x, bg, scale) };
    });
    return { c, x, outcome: c.yte[i], runs };
  }, [ds, who, scale]);
  const cur = r?.runs.find((q) => q.k === kind);
  const fmt = (v: number) => (scale === 'probability' ? `${(v * 100).toFixed(1)}%` : v.toFixed(2));
  return (
    <WidgetFrame title="SHAP: why did the model give this patient this risk?" tryThis="keep the same patient and switch between models. The explanation describes the model, so a different model gives a different explanation for the same patient.">
      <div className="flex flex-wrap gap-3">
        <Segmented
          label="Dataset"
          value={ds}
          onChange={(v) => {
            setDs(v);
            if (v !== 'sepsis' && who === 'missing') setWho('high');
          }}
          options={[
            { value: 'sepsis', label: 'ED sepsis' },
            { value: 'diabetes', label: 'Incident T2D' },
          ]}
        />
        <PatientPicker ds={ds} value={who} onChange={setWho} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Segmented label="Model" value={kind} onChange={setKind} options={EXPLAIN_KINDS.map((k) => ({ value: k, label: MODEL_INFO[k].short }))} />
        <Segmented
          label="Scale"
          value={scale}
          onChange={setScale}
          options={[
            { value: 'probability', label: 'Probability' },
            { value: 'log-odds', label: 'Log-odds' },
          ]}
        />
      </div>
      {!r || !cur ? (
        <Loading label="Computing exact Shapley values (all feature coalitions)…" />
      ) : (
        <>
          <Waterfall
            base={cur.shap.base}
            fx={cur.shap.fx}
            format={fmt}
            items={cur.shap.phi.map((v, j) => ({ label: r.c.ds.features[j].label, detail: formatValue(r.c, j, r.x[j]), value: v }))}
            outLabel={`This patient (${MODEL_INFO[kind].short})`}
          />
          <p className="text-xs text-muted-fg">
            Exact interventional Shapley values over 2<sup>{r.x.length}</sup> = {2 ** r.x.length} coalitions with 50 background patients. Base value + sum of contributions = model
            output, exactly. Actual outcome for this synthetic patient: <strong>{r.outcome ? 'event' : 'no event'}</strong>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-fg">
                  <th className="py-1.5">Same patient, different model</th>
                  <th className="py-1.5 text-right">Prediction</th>
                  <th className="py-1.5">Top 3 drivers</th>
                </tr>
              </thead>
              <tbody>
                {r.runs.map((q) => (
                  <tr key={q.k} className="border-b">
                    <td className="py-1.5">{MODEL_INFO[q.k].name}</td>
                    <td className="num py-1.5 text-right font-mono">{fmt(q.shap.fx)}</td>
                    <td className="py-1.5 text-xs">
                      {q.shap.phi
                        .map((v, j) => [v, j] as const)
                        .sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]))
                        .slice(0, 3)
                        .map(([v, j]) => `${r.c.ds.features[j].label} ${v >= 0 ? '↑' : '↓'}`)
                        .join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── LIME stability ───────────── */

export function LimeWidget() {
  const [who, setWho] = useState<PatientPick>('high');
  const [n, setN] = useState(300);
  const [width, setWidth] = useState(0.75);
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const i = choosePatient('sepsis', who);
    const x = c.Xte[i];
    const m = getModel('sepsis', STANDARD_SPECS.boosting);
    const p = x.length;
    const runs = Array.from({ length: 8 }, (_, s) =>
      lime((X) => m.predict(X), x, c.Xtr, {
        nSamples: n,
        seed: 100 + s,
        kernelWidth: width * Math.sqrt(p),
        labels: c.ds.features.map((f) => f.label),
        decimals: c.ds.features.map((f) => f.decimals ?? 1),
        binary: c.ds.features.map((f) => f.type === 'binary'),
      }),
    );
    const top = runs.map((run) => run.terms.slice().sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))[0].feature);
    const distinctTop = new Set(top).size;
    return { c, x, runs, distinctTop, pred: m.predictOne(x) };
  }, [who, n, width]);
  return (
    <WidgetFrame title="LIME: re-run the same explanation 8 times" tryThis="start at 100 samples, then increase to 5,000. Then change the kernel width. A stable explanation should not depend on the random seed or on a tuning knob you chose.">
      <PatientPicker ds="sepsis" value={who} onChange={setWho} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Perturbation samples per run" value={n} min={100} max={5000} step={100} onChange={setN} format={(v) => v.toLocaleString()} />
        <Slider label="Kernel width (× √p)" value={width} min={0.25} max={3} step={0.25} onChange={setWidth} format={(v) => fx(v, 2)} hint="Library default is 0.75 × √(number of features)." />
      </div>
      {!r ? (
        <Loading label="Running LIME with 8 random seeds…" />
      ) : (
        <>
          <div className="space-y-2">
            {r.c.ds.features.map((f, j) => {
              const ws = r.runs.map((run) => run.terms[j].weight);
              const all = r.runs.flatMap((run) => run.terms.map((t) => t.weight));
              const lo = Math.min(0, ...all);
              const hi = Math.max(0, ...all);
              const pos = (v: number) => ((v - lo) / (hi - lo || 1)) * 100;
              return (
                <div key={f.key} className="grid grid-cols-[minmax(0,10rem)_1fr_5.5rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_6rem]">
                  <div className="min-w-0">
                    <div className="truncate">{r.runs[0].terms[j].rule}</div>
                  </div>
                  <div className="relative h-5 rounded bg-muted">
                    <div className="absolute inset-y-0 w-px bg-muted-fg/60" style={{ left: `${pos(0)}%` }} />
                    <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-c4/40" style={{ left: `${pos(Math.min(...ws))}%`, width: `${pos(Math.max(...ws)) - pos(Math.min(...ws))}%` }} />
                    {ws.map((w, k) => (
                      <div key={k} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-card bg-c4" style={{ left: `${pos(w)}%` }} />
                    ))}
                  </div>
                  <div className="num text-right font-mono text-xs">
                    {fx(mean(ws) * 100, 1)} ± {fx(sd(ws) * 100, 1)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Model prediction (GBM)" value={pct(r.pred, 1)} />
            <Stat label="Different “top feature” across 8 runs" value={r.distinctTop} tone={r.distinctTop > 1 ? 'warn' : 'good'} sub="1 = stable" />
            <Stat label="Local fidelity (weighted R²)" value={fx(mean(r.runs.map((q) => q.r2)), 2)} sub="how well the surrogate fits" />
          </div>
          <p className="text-xs text-muted-fg">
            Each dot is one run. The value on the right is the mean ± SD of the weight in percentage points of risk. Perturbations are drawn independently per feature, so LIME
            evaluates the model on unrealistic patients, for example a low lactate paired with shock-range vital signs.
          </p>
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── PDP + ICE ───────────── */

export function PdpWidget() {
  const [ds, setDs] = useState<DatasetId>('sepsis');
  const [feat, setFeat] = useState(1);
  const [kind, setKind] = useState<ModelKind>('boosting');
  const [center, setCenter] = useState(false);
  const c = getCohort(ds);
  const safeFeat = Math.min(feat, c.ds.features.length - 1);
  const r = useComputed(() => {
    const m = getModel(ds, STANDARD_SPECS[kind]);
    const f = c.ds.features[safeFeat];
    return partialDependence((X) => m.predict(X), c.Xte, safeFeat, { nIce: 60, binary: f.type === 'binary' });
  }, [ds, safeFeat, kind]);
  const f = c.ds.features[safeFeat];
  const curves = r ? (center ? r.ice.map((cv) => cv.map((v) => v - cv[0])) : r.ice) : [];
  const pdp = r ? (center ? r.pdp.map((v) => v - r.pdp[0]) : r.pdp) : [];
  const allV = curves.flat().concat(pdp);
  return (
    <WidgetFrame title="Partial dependence and ICE: the model's response curve" tryThis="look at temperature and WBC under GBM and LR². Then switch on centring to see whether individual patients' curves differ in shape, which would signal interactions.">
      <div className="flex flex-wrap gap-3">
        <Segmented
          label="Dataset"
          value={ds}
          onChange={(v) => {
            setDs(v);
            setFeat(1);
          }}
          options={[
            { value: 'sepsis', label: 'ED sepsis' },
            { value: 'diabetes', label: 'Incident T2D' },
          ]}
        />
        <Segmented label="Model" value={kind} onChange={setKind} options={EXPLAIN_KINDS.map((k) => ({ value: k, label: MODEL_INFO[k].short }))} />
      </div>
      <div className="flex flex-wrap gap-1">
        {c.ds.features.map((ff, j) => (
          <Button key={ff.key} size="sm" variant={j === safeFeat ? 'primary' : 'outline'} onClick={() => setFeat(j)}>
            {ff.label}
          </Button>
        ))}
      </div>
      <Toggle checked={center} onChange={setCenter} label="Centre ICE curves at the left edge (c-ICE)" />
      {!r ? (
        <Loading />
      ) : (
        <>
          <Chart
            x={[r.grid[0], r.grid.at(-1)!]}
            y={[Math.min(...allV), Math.max(...allV) + 1e-6]}
            xLabel={`${f.label}${f.unit ? ` (${f.unit})` : ''}`}
            yLabel={center ? 'Change in predicted risk' : 'Predicted risk'}
            yFormat={(v) => pct(v)}
            xFormat={(v) => (f.type === 'binary' ? (v ? 'yes' : 'no') : fx(v, f.decimals ?? 1))}
            xTicks={f.type === 'binary' ? [0, 1] : undefined}
            ariaLabel="Partial dependence with individual conditional expectation curves"
          >
            {(s) => (
              <>
                {curves.map((cv, i) => (
                  <Line key={i} s={s} pts={r.grid.map((g, k) => [g, cv[k]])} color="var(--c5)" width={1} opacity={0.35} />
                ))}
                <Line s={s} pts={r.grid.map((g, k) => [g, pdp[k]])} color="var(--c2)" width={3.5} />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { color: 'var(--c2)', label: 'Partial dependence (average)' },
              { color: 'var(--c5)', label: 'ICE: one line per patient' },
            ]}
          />
          <p className="text-xs text-muted-fg">
            PDP assumes the plotted feature can be varied independently of the others. With correlated predictors, such as heart rate and lactate, it evaluates implausible
            combinations. Accumulated local effects (ALE) plots avoid this.
          </p>
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Three importance measures, three answers ───────────── */

function builtinByFeature(m: FittedModel): number[] {
  const p = m.meta.length;
  const out = new Array(p).fill(0);
  const imp = m.est.importance?.() ?? [];
  if (m.est instanceof LogisticRegression) {
    // |β| on standardised scale, summed over a feature's columns
    m.columns.forEach((col, j) => (out[col.source] += Math.abs(imp[j])));
  } else m.columns.forEach((col, j) => (out[col.source] += imp[j] ?? 0));
  const tot = out.reduce((s, v) => s + v, 0) || 1;
  return out.map((v) => v / tot);
}

export function ImportanceWidget() {
  const [kind, setKind] = useState<ModelKind>('forest');
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const m = getModel('sepsis', STANDARD_SPECS[kind]);
    const perm = permutationImportance((X) => m.predict(X), c.Xte, c.yte, 5);
    const bg = background(c, 20);
    const pats = new Rng(5).shuffle(c.Xte).slice(0, 30);
    const shap = new Array(c.ds.features.length).fill(0);
    for (const x of pats) exactShap((X) => m.predict(X), x, bg).phi.forEach((v, j) => (shap[j] += Math.abs(v) / pats.length));
    return { c, perm, shap, builtin: builtinByFeature(m) };
  }, [kind]);
  const builtinName: Record<ModelKind, string> = {
    logistic: '|standardised β|',
    logistic_quadratic: '|standardised β| (linear + squared)',
    tree: 'Impurity decrease',
    forest: 'Mean decrease in impurity (Gini)',
    boosting: 'Total split gain',
    mlp: '—',
  };
  return (
    <WidgetFrame title="Global importance: three methods, three rankings" tryThis="compare the random forest's impurity ranking with permutation importance. Impurity importance favours continuous variables with many possible split points (Strobl 2007).">
      <Segmented label="Model" value={kind} onChange={setKind} options={EXPLAIN_KINDS.map((k) => ({ value: k, label: MODEL_INFO[k].name }))} />
      {!r ? (
        <Loading label="Permuting features and computing SHAP for 30 patients…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <div className="mb-2 text-sm font-medium">Permutation (AUROC drop, test set, ±SD)</div>
            <HBars rows={r.perm.map((p) => ({ label: r.c.ds.features[p.feature].label, value: p.drop, err: p.sd }))} format={(v) => fx(v, 3)} />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">Mean |SHAP| (risk points)</div>
            <HBars rows={r.shap.map((v, j) => ({ label: r.c.ds.features[j].label, value: v, color: 'var(--c3)' }))} format={(v) => `${(v * 100).toFixed(1)}`} />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium">Built-in: {builtinName[kind]}</div>
            <HBars rows={r.builtin.map((v, j) => ({ label: r.c.ds.features[j].label, value: v, color: 'var(--c4)' }))} format={(v) => pct(v)} />
          </div>
        </div>
      )}
      <p className="text-xs text-muted-fg">
        None of these is a causal effect. A feature can rank high because it proxies for clinician behaviour, such as whether lactate was ordered, and permuting correlated features
        splits the credit unpredictably.
      </p>
    </WidgetFrame>
  );
}
