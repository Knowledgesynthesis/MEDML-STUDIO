import { useState } from 'react';
import { Slider, Stat, Button } from '@/components/ui';
import { Chart, Line, Dots, VLine } from '@/components/chart/Chart';
import { WidgetFrame } from './Frame';
import { fx, pct } from '@/lib/utils';
import { sigmoid } from '@/lib/ml/stats';

/** Natural-frequency icon array: why PPV collapses at low prevalence (Bayes' theorem). */
export function BayesWidget() {
  const [prev, setPrev] = useState(0.05);
  const [sens, setSens] = useState(0.85);
  const [spec, setSpec] = useState(0.85);
  const N = 1000;
  const tp = Math.round(N * prev * sens);
  const fn = Math.round(N * prev) - tp;
  const fp = Math.round(N * (1 - prev) * (1 - spec));
  const tn = N - tp - fn - fp;
  const ppv = tp / (tp + fp || 1);
  const npv = tn / (tn + fn || 1);
  const cells = [...Array(tp).fill('tp'), ...Array(fn).fill('fn'), ...Array(fp).fill('fp'), ...Array(tn).fill('tn')];
  const color: Record<string, string> = { tp: 'var(--c2)', fn: 'var(--bad)', fp: 'var(--c1)', tn: 'var(--muted)' };
  const cols = 50;
  const presets = [
    { label: 'Population screening (1%)', p: 0.01 },
    { label: 'Ward deterioration (4%)', p: 0.04 },
    { label: 'ED, suspected infection (18%)', p: 0.18 },
  ];
  return (
    <WidgetFrame title="Same test, different prevalence: what a positive alert means" tryThis="keep sensitivity and specificity fixed at 85% and move prevalence from 18% to 1%. Watch PPV.">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button key={p.label} size="sm" variant={Math.abs(prev - p.p) < 1e-9 ? 'primary' : 'outline'} onClick={() => setPrev(p.p)}>
            {p.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Prevalence" value={prev} min={0.005} max={0.5} step={0.005} onChange={setPrev} format={(v) => pct(v, 1)} />
        <Slider label="Sensitivity" value={sens} min={0.5} max={0.99} step={0.01} onChange={setSens} format={(v) => pct(v)} />
        <Slider label="Specificity" value={spec} min={0.5} max={0.99} step={0.01} onChange={setSpec} format={(v) => pct(v)} />
      </div>
      <svg viewBox={`0 0 ${cols * 10} ${(N / cols) * 10}`} className="w-full" role="img" aria-label={`Icon array of 1000 patients: ${tp} true positives, ${fp} false positives, ${fn} false negatives, ${tn} true negatives`}>
        {cells.map((c, i) => (
          <rect key={i} x={(i % cols) * 10 + 1} y={Math.floor(i / cols) * 10 + 1} width={8} height={8} rx={1.5} fill={color[c]} />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {[
          ['tp', `True positive ${tp}`],
          ['fn', `Missed case ${fn}`],
          ['fp', `False alarm ${fp}`],
          ['tn', `True negative ${tn}`],
        ].map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border" style={{ background: color[k] }} /> {l}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Positive predictive value" value={pct(ppv)} sub={`${tp} of ${tp + fp} alerts are real`} tone={ppv < 0.2 ? 'bad' : ppv < 0.5 ? 'warn' : 'good'} />
        <Stat label="Alerts per true case" value={fx((tp + fp) / Math.max(tp, 1), 1)} sub="number needed to alert" />
        <Stat label="Negative predictive value" value={pct(npv, 1)} />
        <Stat label="Patients flagged" value={pct((tp + fp) / N)} sub="workload" />
      </div>
    </WidgetFrame>
  );
}

/** The logistic link: constant odds ratio, non-constant risk difference. */
export function SigmoidWidget() {
  const [b0, setB0] = useState(-3);
  const [b1, setB1] = useState(0.6);
  const [x0, setX0] = useState(2);
  const curve: [number, number][] = Array.from({ length: 101 }, (_, i) => {
    const x = i / 10;
    return [x, sigmoid(b0 + b1 * x)];
  });
  const p0 = sigmoid(b0 + b1 * x0);
  const p1 = sigmoid(b0 + b1 * (x0 + 1));
  const odds = (p: number) => p / (1 - p);
  return (
    <WidgetFrame title="From log-odds to probability" tryThis="move the lactate marker from 1 to 8 mmol/L. The odds ratio per 1 mmol/L never changes, but the absolute risk increase does.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Intercept β₀" value={b0} min={-6} max={2} step={0.1} onChange={setB0} format={(v) => fx(v, 1)} />
        <Slider label="Coefficient β (per mmol/L)" value={b1} min={-1} max={2} step={0.05} onChange={setB1} format={(v) => fx(v, 2)} />
        <Slider label="Lactate for comparison" value={x0} min={0} max={9} step={0.5} onChange={setX0} format={(v) => `${v} → ${v + 1}`} />
      </div>
      <Chart x={[0, 10]} y={[0, 1]} xLabel="Lactate (mmol/L)" yLabel="Predicted risk" yFormat={(v) => pct(v)} ariaLabel="Logistic curve of predicted risk versus lactate">
        {(s) => (
          <>
            <Line s={s} pts={curve} color="var(--c1)" width={2.5} />
            <VLine s={s} x={x0} color="var(--c5)" />
            <VLine s={s} x={x0 + 1} color="var(--c5)" />
            <Dots s={s} pts={[[x0, p0], [x0 + 1, p1]]} color="var(--c2)" r={5} />
          </>
        )}
      </Chart>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Odds ratio per 1 mmol/L" value={fx(Math.exp(b1), 2)} sub="= e^β, same everywhere" />
        <Stat label={`Risk at ${x0} → ${x0 + 1}`} value={`${pct(p0, 1)} → ${pct(p1, 1)}`} />
        <Stat label="Absolute risk increase" value={`${fx((p1 - p0) * 100, 1)} pts`} sub="depends on baseline risk" />
        <Stat label="Odds check" value={`${fx(odds(p1) / odds(p0), 2)}×`} sub="odds(x+1) / odds(x)" />
      </div>
    </WidgetFrame>
  );
}
