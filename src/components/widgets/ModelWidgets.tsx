import { useState } from 'react';
import { Slider, Segmented, Stat, Loading, Legend, Toggle, Badge } from '@/components/ui';
import { Chart, Line, VLine, Diagonal, Dots } from '@/components/chart/Chart';
import { WidgetFrame } from './Frame';
import { fx, pct, cn } from '@/lib/utils';
import { getCohort, getModel, getPreds, useComputed, STANDARD_SPECS } from '@/lib/lab';
import { MODEL_INFO, oddsRatios, type FittedModel, type ModelKind } from '@/lib/ml/pipeline';
import { auroc, rocCurve, calibrationCurve, summarize } from '@/lib/ml/metrics';
import { DecisionTree, LogisticRegression, type TreeNode } from '@/lib/ml/models';
import { KIND_COLOR } from '@/lib/colors';
import { linspace, logit, quantile } from '@/lib/ml/stats';
import type { DatasetId } from '@/lib/data/datasets';

/* ───────────── Non-linearity: does the model recover a U-shaped effect? ───────────── */

const TRUE_EFFECTS: Record<string, { idx: number; label: string; unit: string; f: (v: number) => number; ref: number }> = {
  temp: { idx: 1, label: 'Temperature', unit: '°C', f: (t) => 0.55 * (t - 37.3) ** 2, ref: 37.3 },
  wbc: { idx: 5, label: 'WBC', unit: '×10⁹/L', f: (w) => 0.01 * (w - 9) ** 2, ref: 9 },
  age: { idx: 0, label: 'Age', unit: 'y', f: (a) => 0.022 * (a - 60), ref: 60 },
};

function logitEffect(model: FittedModel, rows: number[][], j: number, grid: number[], ref: number): number[] {
  // average log-odds when feature j is set to each grid value, centred at the reference value
  const at = (v: number) => {
    const batch = rows.map((r) => {
      const c = r.slice();
      c[j] = v;
      return c;
    });
    const p = model.predict(batch);
    return p.reduce((s, q) => s + logit(q), 0) / p.length;
  };
  const r0 = at(ref);
  return grid.map((g) => at(g) - r0);
}

export function NonlinearityWidget() {
  const [feat, setFeat] = useState<'temp' | 'wbc' | 'age'>('temp');
  const eff = TRUE_EFFECTS[feat];
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const rows = c.Xtr.slice(0, 200);
    const col = c.Xtr.map((x) => x[eff.idx]);
    const grid = linspace(quantile(col, 0.02), quantile(col, 0.98), 30);
    const kinds: ModelKind[] = ['logistic', 'logistic_quadratic', 'boosting'];
    const curves = kinds.map((k) => ({ k, pts: logitEffect(getModel('sepsis', STANDARD_SPECS[k]), rows, eff.idx, grid, eff.ref) }));
    const aucs = Object.fromEntries(kinds.map((k) => [k, auroc(getPreds('sepsis', STANDARD_SPECS[k], 'test'), c.yte)]));
    return { grid, curves, aucs };
  }, [feat]);
  const colors: Record<string, string> = { logistic: 'var(--c1)', logistic_quadratic: 'var(--c3)', boosting: 'var(--c2)' };
  return (
    <WidgetFrame title="Can the model see a U-shaped risk?" tryThis="compare temperature (U-shaped truth) with age (linear truth). The dashed line is the true effect used to generate the data.">
      <Segmented
        label="Predictor"
        value={feat}
        onChange={setFeat}
        options={[
          { value: 'temp', label: 'Temperature' },
          { value: 'wbc', label: 'WBC' },
          { value: 'age', label: 'Age' },
        ]}
      />
      {!r ? (
        <Loading />
      ) : (
        <>
          <Chart
            x={[r.grid[0], r.grid.at(-1)!]}
            y={[Math.min(-1, ...r.curves.flatMap((c) => c.pts), ...r.grid.map((g) => eff.f(g) - eff.f(eff.ref))), Math.max(1, ...r.curves.flatMap((c) => c.pts), ...r.grid.map((g) => eff.f(g) - eff.f(eff.ref)))]}
            xLabel={`${eff.label} (${eff.unit})`}
            yLabel="Change in log-odds"
            yFormat={(v) => fx(v, 1)}
            xFormat={(v) => fx(v, feat === 'temp' ? 1 : 0)}
            ariaLabel="Estimated versus true effect on log-odds"
          >
            {(s) => (
              <>
                <Line s={s} pts={r.grid.map((g) => [g, eff.f(g) - eff.f(eff.ref)])} color="var(--fg)" dashed width={2} />
                {r.curves.map((c) => (
                  <Line key={c.k} s={s} pts={r.grid.map((g, i) => [g, c.pts[i]])} color={colors[c.k]} width={2.5} />
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { color: 'var(--fg)', label: 'True effect', dashed: true },
              { color: colors.logistic, label: `LR, linear terms (AUROC ${fx(r.aucs.logistic, 3)})` },
              { color: colors.logistic_quadratic, label: `LR + squared terms (${fx(r.aucs.logistic_quadratic, 3)})` },
              { color: colors.boosting, label: `Gradient boosting (${fx(r.aucs.boosting, 3)})` },
            ]}
          />
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Odds-ratio table (forest plot) ───────────── */

export function OddsRatioWidget({ dataset = 'diabetes' as DatasetId }: { dataset?: DatasetId }) {
  const [ds, setDs] = useState<DatasetId>(dataset);
  const r = useComputed(() => {
    const m = getModel(ds, STANDARD_SPECS.logistic);
    const lr = m.est as LogisticRegression;
    return { rows: oddsRatios(m), iterations: lr.iterations, meta: m.meta };
  }, [ds]);
  const lo = 0.25;
  const hi = 4;
  const pos = (v: number) => ((Math.log(Math.min(hi, Math.max(lo, v))) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))) * 100;
  return (
    <WidgetFrame title="Reading a logistic model: adjusted odds ratios with 95% CIs">
      <Segmented
        label="Dataset"
        value={ds}
        onChange={setDs}
        options={[
          { value: 'diabetes', label: 'Incident T2D' },
          { value: 'sepsis', label: 'ED sepsis' },
        ]}
      />
      {!r ? (
        <Loading />
      ) : (
        <div className="space-y-1.5">
          <div className="grid grid-cols-[minmax(0,9rem)_1fr_6.5rem] gap-2 text-xs text-muted-fg sm:grid-cols-[minmax(0,14rem)_1fr_8rem]">
            <span>Predictor (contrast)</span>
            <span className="flex justify-between">
              <span>0.25</span>
              <span>1</span>
              <span>4</span>
            </span>
            <span className="text-right">OR (95% CI)</span>
          </div>
          {r.rows.map((o) => {
            const meta = r.meta[o.column.source];
            const contrast = o.column.kind === 'missing' ? 'not measured vs measured' : meta.type === 'binary' ? 'yes vs no' : 'per 1 SD';
            return (
              <div key={o.column.name} className="grid grid-cols-[minmax(0,9rem)_1fr_6.5rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_8rem]">
                <div className="min-w-0">
                  <div className="truncate">{o.column.label}</div>
                  <div className="truncate text-xs text-muted-fg">
                    {contrast}
                    {o.perUnit !== undefined && ` · OR ${fx(Math.exp(o.perUnit), 3)} per ${meta.unit ?? 'unit'}`}
                  </div>
                </div>
                <div className="relative h-5">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-muted-fg/60" />
                  <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-fg" style={{ left: `${pos(o.lo)}%`, width: `${pos(o.hi) - pos(o.lo)}%` }} />
                  <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-primary" style={{ left: `${pos(o.or)}%` }} />
                </div>
                <div className="num text-right font-mono text-xs">
                  {fx(o.or, 2)} ({fx(o.lo, 2)}–{fx(o.hi, 2)})
                </div>
              </div>
            );
          })}
          <p className="pt-2 text-xs text-muted-fg">
            Fitted by Newton–Raphson in {r.iterations} iterations with a light ridge penalty. Odds ratios are <em>adjusted</em> (mutually) and <em>associational</em>, not causal.
          </p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Tree depth vs overfitting ───────────── */

function ruleText(node: Extract<TreeNode, { leaf: false }>, m: FittedModel): { yes: string; no: string } {
  const col = m.columns[node.feature];
  const meta = m.meta[col.source];
  if (col.kind === 'missing') return { yes: `${meta.label} measured`, no: `${meta.label} not measured` };
  if (meta.type === 'binary') return { yes: `${meta.label}: no`, no: `${meta.label}: yes` };
  const t = node.threshold.toFixed(meta.decimals ?? 1);
  return { yes: `${meta.label} ≤ ${t}${meta.unit ? ` ${meta.unit}` : ''}`, no: `${meta.label} > ${t}${meta.unit ? ` ${meta.unit}` : ''}` };
}

function TreeView({ node, m, label, depth = 0 }: { node: TreeNode; m: FittedModel; label?: string; depth?: number }) {
  if (node.leaf) {
    return (
      <div className="flex items-center gap-2 py-0.5 text-sm" style={{ paddingLeft: depth * 14 }}>
        {label && <span className="text-muted-fg">{label} →</span>}
        <span className="inline-flex h-2 w-16 overflow-hidden rounded bg-muted">
          <span className="h-full" style={{ width: `${node.value * 100}%`, background: 'var(--c2)' }} />
        </span>
        <span className="num font-mono text-xs">
          risk {pct(node.value)} · n={node.n}
        </span>
      </div>
    );
  }
  const r = ruleText(node, m);
  return (
    <div>
      {label && (
        <div className="py-0.5 text-sm text-muted-fg" style={{ paddingLeft: depth * 14 }}>
          {label}
        </div>
      )}
      <div className="border-l border-dashed" style={{ marginLeft: depth * 14 + 4 }}>
        <TreeView node={node.left} m={m} label={r.yes} depth={1} />
        <TreeView node={node.right} m={m} label={r.no} depth={1} />
      </div>
    </div>
  );
}

export function TreeDepthWidget() {
  const [depth, setDepth] = useState(3);
  const r = useComputed(() => {
    const c = getCohort('sepsis');
    const rows = Array.from({ length: 12 }, (_, i) => {
      const d = i + 1;
      const m = getModel('sepsis', { kind: 'tree', depth: d, minLeaf: 5 });
      return { d, train: auroc(m.predict(c.Xtr), c.ytr), test: auroc(m.predict(c.Xte), c.yte), leaves: (m.est as DecisionTree).stats().leaves };
    });
    return rows;
  }, ['depth-curve']);
  const model = r ? getModel('sepsis', { kind: 'tree', depth, minLeaf: 5 }) : null;
  const sel = r?.find((x) => x.d === depth);
  return (
    <WidgetFrame title="Depth, readability and overfitting" tryThis="increase depth step by step. Training AUROC keeps rising; held-out AUROC peaks early and then falls.">
      <Slider label="Maximum tree depth" value={depth} min={1} max={12} step={1} onChange={setDepth} format={(v) => String(v)} />
      {!r || !model || !sel ? (
        <Loading />
      ) : (
        <>
          <Chart x={[1, 12]} y={[0.5, 1]} xLabel="Maximum depth" yLabel="AUROC" ariaLabel="Training and test AUROC by tree depth" maxHeight={300}>
            {(s) => (
              <>
                <Line s={s} pts={r.map((x) => [x.d, x.train])} color="var(--c2)" width={2.5} />
                <Line s={s} pts={r.map((x) => [x.d, x.test])} color="var(--c1)" width={2.5} />
                <Dots s={s} pts={r.map((x) => [x.d, x.test])} color="var(--c1)" r={3} />
                <VLine s={s} x={depth} />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { color: 'var(--c2)', label: 'Training data (apparent)' },
              { color: 'var(--c1)', label: 'Held-out test data' },
            ]}
          />
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Train AUROC" value={fx(sel.train, 3)} />
            <Stat label="Test AUROC" value={fx(sel.test, 3)} />
            <Stat label="Leaves (rules)" value={sel.leaves} tone={sel.leaves > 16 ? 'warn' : undefined} />
          </div>
          {depth <= 4 ? (
            <div className="overflow-x-auto rounded-lg border p-3">
              <TreeView node={(model.est as DecisionTree).root!} m={model} />
            </div>
          ) : (
            <p className="text-sm text-muted-fg">With {sel.leaves} leaves this tree is no longer something a clinician can read or check.</p>
          )}
        </>
      )}
    </WidgetFrame>
  );
}

/* ───────────── Head-to-head model comparison ───────────── */

const ALL_KINDS: ModelKind[] = ['logistic', 'logistic_quadratic', 'tree', 'forest', 'boosting', 'mlp'];

export function ModelComparisonWidget({ initial = 'sepsis' as DatasetId, compact = false }: { initial?: DatasetId; compact?: boolean }) {
  const [ds, setDs] = useState<DatasetId>(initial);
  const [kinds, setKinds] = useState<ModelKind[]>(['logistic', 'logistic_quadratic', 'forest', 'boosting']);
  const [view, setView] = useState<'roc' | 'cal'>('roc');
  const r = useComputed(() => {
    const c = getCohort(ds);
    return kinds.map((k) => {
      const spec = STANDARD_SPECS[k];
      const pTe = getPreds(ds, spec, 'test');
      const pTr = getPreds(ds, spec, 'train');
      const sum = summarize(pTe, c.yte, true);
      return { k, sum, trainAuc: auroc(pTr, c.ytr), roc: rocCurve(pTe, c.yte), cal: calibrationCurve(pTe, c.yte, 10) };
    });
  }, [ds, kinds]);
  const truth = useComputed(() => {
    const c = getCohort(ds);
    return auroc(c.test.map((i) => c.ds.trueRisk[i]), c.yte);
  }, [ds, 'truth']);
  const best = r ? Math.max(...r.map((x) => x.sum.auroc)) : 0;
  return (
    <WidgetFrame title="Head-to-head on held-out patients" tryThis="switch datasets. Do the flexible models beat logistic regression on the test set? Compare their training and test AUROC.">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Dataset"
          value={ds}
          onChange={setDs}
          options={[
            { value: 'sepsis', label: 'ED sepsis' },
            { value: 'diabetes', label: 'Incident T2D' },
          ]}
        />
        <span className="text-xs text-muted-fg">70/30 stratified split · test n = {getCohort(ds).yte.length}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {ALL_KINDS.map((k) => (
          <Toggle key={k} checked={kinds.includes(k)} onChange={(v) => setKinds((cur) => (v ? ALL_KINDS.filter((x) => cur.includes(x) || x === k) : cur.filter((x) => x !== k)))} label={MODEL_INFO[k].name} />
        ))}
      </div>
      {!r ? (
        <Loading />
      ) : r.length === 0 ? (
        <p className="text-sm text-muted-fg">Select at least one model.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-fg">
                  <th className="py-1.5 pr-2">Model</th>
                  <th className="py-1.5 pr-2 text-right">Train AUROC</th>
                  <th className="py-1.5 pr-2 text-right">Test AUROC (95% CI)</th>
                  <th className="py-1.5 pr-2 text-right">Brier</th>
                  <th className="py-1.5 pr-2 text-right">Scaled Brier</th>
                  <th className="py-1.5 pr-2 text-right">Cal. slope</th>
                  <th className="py-1.5 text-right">Cal. intercept</th>
                </tr>
              </thead>
              <tbody>
                {r.map(({ k, sum, trainAuc }) => (
                  <tr key={k} className="border-b">
                    <td className="py-1.5 pr-2">
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
                      {MODEL_INFO[k].name}
                    </td>
                    <td className="num py-1.5 pr-2 text-right font-mono">{fx(trainAuc, 3)}</td>
                    <td className={cn('num py-1.5 pr-2 text-right font-mono', sum.auroc === best && 'font-semibold text-good')}>
                      {fx(sum.auroc, 3)} <span className="text-xs text-muted-fg">({fx(sum.aurocCI[0], 2)}–{fx(sum.aurocCI[1], 2)})</span>
                    </td>
                    <td className="num py-1.5 pr-2 text-right font-mono">{fx(sum.brier, 3)}</td>
                    <td className="num py-1.5 pr-2 text-right font-mono">{fx(sum.scaledBrier, 3)}</td>
                    <td className={cn('num py-1.5 pr-2 text-right font-mono', Math.abs(sum.calSlope - 1) > 0.2 && 'text-warn')}>{fx(sum.calSlope, 2)}</td>
                    <td className={cn('num py-1.5 text-right font-mono', Math.abs(sum.calIntercept) > 0.2 && 'text-warn')}>{fx(sum.calIntercept, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {truth !== null && (
            <p className="text-xs text-muted-fg">
              Ceiling: the <em>true</em> risk from the data-generating process achieves AUROC <strong>{fx(truth, 3)}</strong> on these test patients. No model can do better
              except by chance.
            </p>
          )}
          {!compact && (
            <>
              <Segmented
                label="Plot"
                value={view}
                onChange={setView}
                options={[
                  { value: 'roc', label: 'ROC curves' },
                  { value: 'cal', label: 'Calibration' },
                ]}
              />
              {view === 'roc' ? (
                <Chart x={[0, 1]} y={[0, 1]} square xLabel="1 − specificity (false-positive rate)" yLabel="Sensitivity" xFormat={(v) => fx(v, 1)} yFormat={(v) => fx(v, 1)} ariaLabel="ROC curves">
                  {(s) => (
                    <>
                      <Diagonal s={s} />
                      {r.map(({ k, roc }) => (
                        <Line key={k} s={s} pts={roc.map((p) => [p.fpr, p.tpr])} color={KIND_COLOR[k]} width={2} />
                      ))}
                    </>
                  )}
                </Chart>
              ) : (
                <Chart x={[0, 0.8]} y={[0, 0.8]} square xLabel="Predicted risk (decile mean)" yLabel="Observed proportion" xFormat={(v) => pct(v)} yFormat={(v) => pct(v)} ariaLabel="Calibration curves">
                  {(s) => (
                    <>
                      <Diagonal s={s} to={0.8} />
                      {r.map(({ k, cal }) => (
                        <g key={k}>
                          <Line s={s} pts={cal.map((b) => [b.predicted, b.observed])} color={KIND_COLOR[k]} width={2} />
                          <Dots s={s} pts={cal.map((b) => [b.predicted, b.observed])} color={KIND_COLOR[k]} r={3} />
                        </g>
                      ))}
                    </>
                  )}
                </Chart>
              )}
              <Legend items={r.map(({ k }) => ({ color: KIND_COLOR[k], label: MODEL_INFO[k].name }))} />
            </>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge>Brier: lower is better</Badge>
            <Badge>Scaled Brier: 0 = no better than prevalence</Badge>
            <Badge>Ideal slope 1, intercept 0</Badge>
          </div>
        </>
      )}
    </WidgetFrame>
  );
}

