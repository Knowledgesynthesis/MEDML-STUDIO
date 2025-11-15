import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ModuleContent {
  id: string;
  title: string;
  level: string;
  duration: string;
  description: string;
  objectives: string[];
  sections: Array<{
    title: string;
    content: string;
    subsections?: Array<{
      title: string;
      points: string[];
    }>;
  }>;
  takeaways: string[];
  prevModule?: string;
  nextModule?: string;
}

export function ModuleTemplate({ module }: { module: ModuleContent }) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Button variant="ghost" className="mb-4" onClick={() => window.location.hash = 'learning'}>
          ← Back to Modules
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="secondary">Module {module.id}</Badge>
          <Badge>{module.level}</Badge>
          <span className="text-sm text-muted-foreground">{module.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{module.title}</h1>
        <p className="text-xl text-muted-foreground mt-2">{module.description}</p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {module.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {module.sections.map((section, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">{section.content}</p>

            {section.subsections && (
              <div className="space-y-3">
                {section.subsections.map((subsection, subIdx) => (
                  <div key={subIdx} className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">{subsection.title}</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {subsection.points.map((point, pointIdx) => (
                        <li key={pointIdx}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {module.takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {idx + 1}
                </div>
                <p className="text-sm">{takeaway}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        {module.prevModule && (
          <Button variant="outline" onClick={() => window.location.hash = `module-${module.prevModule}`}>
            ← Previous Module
          </Button>
        )}
        {!module.prevModule && <div></div>}

        {module.nextModule && (
          <Button onClick={() => window.location.hash = `module-${module.nextModule}`}>
            Next Module
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {!module.nextModule && (
          <Button onClick={() => window.location.hash = 'learning'}>
            Back to Modules
          </Button>
        )}
      </div>
    </div>
  );
}
