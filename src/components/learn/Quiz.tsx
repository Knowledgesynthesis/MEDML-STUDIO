import { useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { Button, Card, CardBody, Badge } from '@/components/ui';
import { PASS_MARK, useProgress } from '@/store';
import { cn } from '@/lib/utils';

export interface Question {
  id: string;
  stem: ReactNode;
  options: ReactNode[];
  answer: number;
  rationale: ReactNode;
}

/**
 * Retrieval practice with immediate, explanatory feedback ("practice" mode) or deferred feedback
 * ("exam" mode). Scores are stored locally; ≥ 80% marks the module as mastered.
 */
export function Quiz({ id, questions, mode = 'practice', title = 'Check your understanding' }: { id: string; questions: Question[]; mode?: 'practice' | 'exam'; title?: string }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(0);
  const record = useProgress((s) => s.recordQuiz);
  const best = useProgress((s) => s.quizzes[id]?.best);
  const order = useMemo(() => questions, [questions]);
  const answered = Object.keys(answers).length;
  const correct = order.filter((q) => answers[q.id] === q.answer).length;
  const done = answered === order.length;
  const reveal = mode === 'practice' || submitted;

  const choose = (q: Question, i: number) => {
    if (answers[q.id] !== undefined) return;
    const next = { ...answers, [q.id]: i };
    setAnswers(next);
    if (mode === 'practice' && Object.keys(next).length === order.length) {
      record(id, order.filter((qq) => next[qq.id] === qq.answer).length / order.length);
    }
  };

  const submit = () => {
    setSubmitted(true);
    record(id, correct / order.length);
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
    setRound((r) => r + 1);
  };

  const score = correct / order.length;
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4" key={round}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-title`} className="text-xl font-semibold">
          {title}
        </h2>
        <div className="flex items-center gap-2 text-sm">
          {best !== undefined && <Badge tone={best >= PASS_MARK ? 'good' : 'default'}>Best {Math.round(best * 100)}%</Badge>}
          <span className="text-muted-fg">
            {answered}/{order.length} answered
          </span>
        </div>
      </div>
      {order.map((q, qi) => {
        const chosen = answers[q.id];
        const isAnswered = chosen !== undefined;
        return (
          <Card key={q.id}>
            <CardBody className="space-y-3">
              <div className="flex gap-2 font-medium">
                <span className="text-muted-fg">{qi + 1}.</span>
                <div>{q.stem}</div>
              </div>
              <div className="grid gap-2" role="radiogroup" aria-label={`Question ${qi + 1}`}>
                {q.options.map((opt, i) => {
                  const isChosen = chosen === i;
                  const isRight = q.answer === i;
                  return (
                    <button
                      key={i}
                      role="radio"
                      aria-checked={isChosen}
                      disabled={isAnswered}
                      onClick={() => choose(q, i)}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                        !isAnswered && 'hover:border-primary hover:bg-primary/5',
                        isAnswered && reveal && isRight && 'border-good bg-good/10',
                        isAnswered && reveal && isChosen && !isRight && 'border-bad bg-bad/10',
                        isAnswered && !reveal && isChosen && 'border-primary bg-primary/10',
                        isAnswered && !isChosen && !(reveal && isRight) && 'opacity-60',
                      )}
                    >
                      <span className="mt-0.5 font-mono text-xs text-muted-fg">{String.fromCharCode(65 + i)}</span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && reveal && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-good" aria-label="correct" />}
                      {isAnswered && reveal && isChosen && !isRight && <XCircle className="h-4 w-4 shrink-0 text-bad" aria-label="incorrect" />}
                    </button>
                  );
                })}
              </div>
              {isAnswered && reveal && (
                <div className={cn('rounded-lg border-l-4 bg-muted/60 p-3 text-sm', chosen === q.answer ? 'border-good' : 'border-bad')}>
                  <span className="font-semibold">{chosen === q.answer ? 'Correct. ' : 'Not quite. '}</span>
                  {q.rationale}
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
      {mode === 'exam' && !submitted && (
        <Button onClick={submit} disabled={!done} className="w-full sm:w-auto">
          Submit answers ({answered}/{order.length})
        </Button>
      )}
      {done && reveal && (
        <Card className={cn(score >= PASS_MARK ? 'border-good/50' : 'border-warn/50')}>
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className={cn('h-6 w-6', score >= PASS_MARK ? 'text-good' : 'text-warn')} aria-hidden />
              <div>
                <div className="font-semibold">
                  {correct}/{order.length} correct ({Math.round(score * 100)}%)
                </div>
                <div className="text-sm text-muted-fg">
                  {score >= PASS_MARK ? 'Mastered — this module is marked complete.' : `Mastery requires ${Math.round(PASS_MARK * 100)}%. Re-read the rationales, then retry.`}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={retry}>
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
          </CardBody>
        </Card>
      )}
    </section>
  );
}
