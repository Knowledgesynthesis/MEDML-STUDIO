import type { ReactNode } from 'react';
import { MousePointerClick } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';

export function WidgetFrame({ title, tryThis, children }: { title: string; tryThis?: ReactNode; children: ReactNode }) {
  return (
    <Card className="my-6 overflow-hidden border-primary/30">
      <div className="flex items-center gap-2 border-b bg-primary/5 px-4 py-2.5">
        <MousePointerClick className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <CardBody className="space-y-4">
        {tryThis && (
          <p className="text-sm text-muted-fg">
            <span className="font-semibold text-fg">Try: </span>
            {tryThis}
          </p>
        )}
        {children}
      </CardBody>
    </Card>
  );
}
