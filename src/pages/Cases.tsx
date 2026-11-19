import { useState } from 'react';
import { Link } from '@/components/Link';
import { Card, CardBody, Badge, Segmented } from '@/components/ui';
import { Quiz } from '@/components/learn/Quiz';
import { Cite } from '@/components/learn/Cite';
import { CASES, type CaseFile } from '@/content/cases';
import { META_MAP as MODULE_MAP } from '@/content/meta';

const TONE: Record<CaseFile['tag'], 'bad' | 'warn' | 'good' | 'primary'> = { Failure: 'bad', Mixed: 'warn', Success: 'good', Bias: 'primary' };

export function Cases() {
  const [filter, setFilter] = useState<'all' | CaseFile['tag']>('all');
  const list = CASES.filter((c) => filter === 'all' || c.tag === filter);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Case files</h1>
        <p className="text-muted-fg">Documented deployments and evaluations of clinical AI. Every number comes from the cited primary publication. Each case ends with a decision for you to make.</p>
      </header>
      <Segmented
        label="Filter cases"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: `All (${CASES.length})` },
          { value: 'Failure', label: 'Failures' },
          { value: 'Mixed', label: 'Mixed' },
          { value: 'Success', label: 'Successes' },
          { value: 'Bias', label: 'Bias' },
        ]}
      />
      {list.map((c) => (
        <Card key={c.id} id={c.id}>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold">{c.title}</h2>
                <p className="text-sm text-muted-fg">{c.setting}</p>
              </div>
              <Badge tone={TONE[c.tag]}>{c.tag}</Badge>
            </div>
            <p className="text-sm">
              {c.what} <Cite ids={c.refs} />
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-muted/60 p-3">
                <div className="mb-1 text-sm font-semibold">Key numbers</div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {c.numbers.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="mb-1 text-sm font-semibold">Lessons</div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {c.lessons.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Quiz id={`case-${c.id}`} questions={[c.question]} title="Your call" />
            <p className="text-xs text-muted-fg">
              Related:{' '}
              <Link to={`/learn/${c.module}`} className="text-primary hover:underline">
                Module {MODULE_MAP[c.module].number}: {MODULE_MAP[c.module].title}
              </Link>
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
