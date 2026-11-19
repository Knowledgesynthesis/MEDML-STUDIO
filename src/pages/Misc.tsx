import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from '@/components/Link';
import { Card, CardBody, Badge, Callout } from '@/components/ui';
import { Quiz } from '@/components/learn/Quiz';
import { GLOSSARY, type Term } from '@/content/glossary';
import { REFERENCES, type Reference } from '@/content/references';
import { META_MAP as MODULE_MAP } from '@/content/meta';
import { EXAM } from '@/content/exam';
import { cn } from '@/lib/utils';

export function Glossary() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'All' | Term['category']>('All');
  const cats: ('All' | Term['category'])[] = ['All', 'Evaluation', 'Modelling', 'Data', 'Explainability', 'Fairness', 'Deployment', 'Regulation'];
  const list = useMemo(
    () =>
      GLOSSARY.filter((t) => (cat === 'All' || t.category === cat) && (t.term + ' ' + t.definition).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.term.localeCompare(b.term)),
    [q, cat],
  );
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
        <p className="text-muted-fg">{GLOSSARY.length} precise definitions, each linked to the module that teaches it.</p>
      </header>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms and definitions" aria-label="Search glossary" className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm" />
      </div>
      <div className="flex flex-wrap gap-1">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn('rounded-full border px-3 py-1 text-xs', cat === c ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted')}>
            {c}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-fg" aria-live="polite">
        {list.length} term{list.length === 1 ? '' : 's'}
      </p>
      <dl className="space-y-3">
        {list.map((t) => (
          <Card key={t.term}>
            <CardBody className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="font-semibold">{t.term}</dt>
                <Badge>{t.category}</Badge>
              </div>
              <dd className="space-y-1.5 text-sm">
                <p>{t.definition}</p>
                {t.example && <p className="text-muted-fg">Example: {t.example}</p>}
                {t.module && (
                  <Link to={`/learn/${t.module}`} className="text-xs text-primary hover:underline">
                    Module {MODULE_MAP[t.module].number}: {MODULE_MAP[t.module].title} →
                  </Link>
                )}
              </dd>
            </CardBody>
          </Card>
        ))}
      </dl>
    </div>
  );
}

export function References() {
  const topics = Array.from(new Set(REFERENCES.map((r) => r.topic)));
  const by = (t: Reference['topic']) => REFERENCES.filter((r) => r.topic === t).sort((a, b) => a.citation.localeCompare(b.citation));
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">References</h1>
        <p className="text-muted-fg">
          All {REFERENCES.length} sources cited in the course, with DOI or official links. Regulatory status is current to November 2026. Check the issuing agency for later
          changes.
        </p>
      </header>
      {topics.map((t) => (
        <section key={t} className="space-y-2">
          <h2 className="text-lg font-semibold">{t}</h2>
          <ol className="space-y-2 text-sm">
            {by(t).map((r) => (
              <li key={r.id} id={`ref-${r.id}`} className="leading-snug">
                <span>{r.citation} </span>
                <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-primary hover:underline">
                  {r.url.replace(/^https:\/\//, '')}
                </a>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function Exam() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mastery exam</h1>
        <p className="text-muted-fg">
          15 integrative questions across all modules. Feedback is deferred until you submit, as in a real assessment. Pass mark 80%. You can retake it; your best score is kept on
          this device.
        </p>
      </header>
      <Callout kind="note">Have a calculator ready for questions 1 and 11. Every rationale points back to the module where the concept is taught.</Callout>
      <Quiz id="exam" questions={EXAM} mode="exam" title="Exam questions" />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl space-y-3 py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-fg">That address does not exist in MedML Studio.</p>
      <Link to="/" className="text-primary hover:underline">
        Go to the home page
      </Link>
    </div>
  );
}
