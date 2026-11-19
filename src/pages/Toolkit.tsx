import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, CardBody, Button, Slider, Stat, Callout } from '@/components/ui';
import { WidgetFrame } from '@/components/widgets/Frame';
import { SampleSizeWidget } from '@/components/widgets/DataWidgets';
import { BayesWidget } from '@/components/widgets/Foundations';
import { Cite } from '@/components/learn/Cite';
import { cn, fx, pct } from '@/lib/utils';

type Answer = 'yes' | 'no' | 'unclear';

const ITEMS: { q: string; why: string }[] = [
  { q: 'Population, setting and prediction time match my intended use', why: 'Models do not transport across case mix, care pathways or decision points.' },
  { q: 'All predictors were available at the prediction time (no leakage)', why: 'Future information inflates retrospective accuracy and fails prospectively.' },
  { q: 'The outcome is clinically meaningful, consistently ascertained and not a biased proxy', why: 'Proxy labels such as cost or codes inherit care-delivery bias.' },
  { q: 'Sample size was adequate for the number of candidate parameters (e.g. Riley criteria)', why: 'Small samples lead to overfitting and miscalibration.' },
  { q: 'Missing data were handled in a way that can be applied at deployment', why: 'Complete-case analysis is biased, and imputation must be reproducible.' },
  { q: 'Performance was validated externally (another site and/or period), ideally independently', why: 'Internal validation cannot reveal dataset shift.' },
  { q: 'Calibration is reported with a plot, slope and intercept, not only AUROC', why: 'Absolute-risk decisions need calibrated risks.' },
  { q: 'Clinical utility is shown (net benefit / decision curve at relevant thresholds)', why: 'Discrimination does not establish better decisions.' },
  { q: 'Performance is reported for relevant subgroups with uncertainty', why: 'Average performance can hide group-specific harm.' },
  { q: 'There is impact evidence or a plan for silent testing, monitoring, updating and regulatory status', why: 'Accuracy is not impact, and performance drifts after deployment.' },
];

function Appraisal() {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const no = ITEMS.filter((_, i) => answers[i] === 'no').length;
  const unclear = ITEMS.filter((_, i) => answers[i] === 'unclear').length;
  const answered = Object.keys(answers).length;
  const verdict =
    answered < ITEMS.length
      ? 'Answer all 10 items to get a summary.'
      : no >= 2
        ? 'High concern: do not deploy. Request the missing evidence or a local validation.'
        : no === 1 || unclear >= 3
          ? 'Some concern: local silent-mode validation is required before any clinical use.'
          : 'Low concern on reported evidence: proceed to local silent validation and a monitoring plan.';
  const summary = [
    `Model appraisal: ${name || 'unnamed model'} (MedML Studio checklist, based on TRIPOD+AI / PROBAST+AI)`,
    ...ITEMS.map((it, i) => `${i + 1}. ${it.q}: ${answers[i] ?? 'not answered'}`),
    `Verdict: ${verdict}`,
  ].join('\n');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <WidgetFrame title="10-question model appraisal">
      <p className="text-sm text-muted-fg">
        Use this on a paper, vendor pitch or internal model. It condenses TRIPOD+AI <Cite id="tripodai2024" /> and PROBAST+AI <Cite id="probastai2025" />. It is not a substitute
        for the full tools in a systematic review.
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Model or paper name (optional)" className="w-full rounded-lg border bg-card px-3 py-2 text-sm" aria-label="Model or paper name" />
      <ol className="space-y-3">
        {ITEMS.map((it, i) => (
          <li key={i} className="rounded-lg border p-3">
            <div className="text-sm font-medium">
              {i + 1}. {it.q}
            </div>
            <div className="mt-0.5 text-xs text-muted-fg">{it.why}</div>
            <div className="mt-2 flex gap-2" role="radiogroup" aria-label={`Item ${i + 1}`}>
              {(['yes', 'unclear', 'no'] as Answer[]).map((a) => (
                <button
                  key={a}
                  role="radio"
                  aria-checked={answers[i] === a}
                  onClick={() => setAnswers((s) => ({ ...s, [i]: a }))}
                  className={cn(
                    'rounded-md border px-3 py-1 text-sm capitalize',
                    answers[i] === a && a === 'yes' && 'border-good bg-good/10 text-good',
                    answers[i] === a && a === 'unclear' && 'border-warn bg-warn/10 text-warn',
                    answers[i] === a && a === 'no' && 'border-bad bg-bad/10 text-bad',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className={cn('rounded-lg border p-3 text-sm', answered === ITEMS.length && (no >= 2 ? 'border-bad bg-bad/5' : no === 1 || unclear >= 3 ? 'border-warn bg-warn/5' : 'border-good bg-good/5'))}>
        <div className="font-semibold">
          {answered}/{ITEMS.length} answered · {no} “no” · {unclear} “unclear”
        </div>
        <div>{verdict}</div>
      </div>
      <Button variant="outline" onClick={copy} disabled={answered === 0}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy summary'}
      </Button>
    </WidgetFrame>
  );
}

function ThresholdCalculator() {
  const [ratio, setRatio] = useState(9);
  const pt = 1 / (1 + ratio);
  return (
    <WidgetFrame title="Threshold from harms and benefits">
      <Slider
        label="Missing a case is how many times worse than an unnecessary intervention?"
        value={ratio}
        min={1}
        max={99}
        step={1}
        onChange={setRatio}
        format={(v) => `${v}×`}
      />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Threshold probability pₜ" value={pct(pt, 1)} sub="treat if risk ≥ pₜ" />
        <Stat label="Accepted false positives per true positive" value={fx(ratio, 0)} sub="= (1 − pₜ)/pₜ" />
      </div>
    </WidgetFrame>
  );
}

function NetBenefitCalculator() {
  const [n, setN] = useState(1000);
  const [tp, setTp] = useState(120);
  const [fp, setFp] = useState(300);
  const [prev, setPrev] = useState(0.15);
  const [pt, setPt] = useState(0.1);
  const odds = pt / (1 - pt);
  const nb = tp / n - (fp / n) * odds;
  const all = prev - (1 - prev) * odds;
  return (
    <WidgetFrame title="Net benefit from a published 2×2 table">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Patients (n)" value={n} min={100} max={10000} step={100} onChange={setN} format={(v) => v.toLocaleString()} />
        <Slider label="Prevalence" value={prev} min={0.01} max={0.6} step={0.01} onChange={setPrev} format={(v) => pct(v)} />
        <Slider label="True positives" value={tp} min={0} max={Math.round(n * prev)} step={1} onChange={setTp} format={(v) => String(v)} />
        <Slider label="False positives" value={fp} min={0} max={Math.round(n * (1 - prev))} step={1} onChange={setFp} format={(v) => String(v)} />
        <Slider label="Threshold probability pₜ" value={pt} min={0.01} max={0.6} step={0.01} onChange={setPt} format={(v) => pct(v)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Model" value={fx(nb, 3)} tone={nb > Math.max(all, 0) ? 'good' : 'bad'} />
        <Stat label="Treat all" value={fx(all, 3)} />
        <Stat label="Treat none" value="0.000" />
      </div>
      <p className="text-xs text-muted-fg">
        Use the classification at the threshold equal to pₜ. Net benefit is only meaningful when the classification threshold and pₜ coincide <Cite id="vickers2019" />.
      </p>
    </WidgetFrame>
  );
}

export function Toolkit() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Appraisal toolkit</h1>
        <p className="text-muted-fg">Tools for journal club, procurement and governance meetings.</p>
      </header>
      <Appraisal />
      <SampleSizeWidget />
      <ThresholdCalculator />
      <NetBenefitCalculator />
      <BayesWidget />
      <Card>
        <CardBody>
          <Callout kind="note" title="Questions to send a vendor">
            <ul className="list-disc space-y-1 pl-5">
              <li>Exact prediction time, horizon, outcome definition and every input, with its source and timing.</li>
              <li>External validation results (AUROC with CI, calibration plot, slope and intercept) in settings like ours, by subgroup.</li>
              <li>Alert rate and PPV at the proposed threshold, and alerts per true case per 100 admissions.</li>
              <li>Evidence of impact on patient outcomes, and the study design that produced it.</li>
              <li>Update plan (PCCP for regulated devices), version history, and how we will be notified of changes.</li>
              <li>Support for local silent-mode evaluation and ongoing monitoring data exports.</li>
            </ul>
          </Callout>
        </CardBody>
      </Card>
    </div>
  );
}
