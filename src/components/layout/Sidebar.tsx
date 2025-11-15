import { Home, Database, Brain, BarChart3, BookOpen, FileText, Shield, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    description: 'Dashboard and overview',
  },
  {
    title: 'Datasets',
    href: '/datasets',
    icon: Database,
    description: 'Synthetic clinical datasets',
  },
  {
    title: 'Model Lab',
    href: '/model-lab',
    icon: Brain,
    description: 'Train and compare models',
  },
  {
    title: 'Explainability',
    href: '/explainability',
    icon: BarChart3,
    description: 'SHAP, LIME, feature importance',
  },
  {
    title: 'Learning',
    href: '/learning',
    icon: BookOpen,
    description: 'Modules and curriculum',
  },
  {
    title: 'Case Studies',
    href: '/case-studies',
    icon: FileText,
    description: 'Real-world ML applications',
  },
  {
    title: 'Ethics & Bias',
    href: '/ethics',
    icon: Shield,
    description: 'Fairness and ethical considerations',
  },
  {
    title: 'Glossary',
    href: '/glossary',
    icon: HelpCircle,
    description: 'Terms and definitions',
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-200 md:sticky md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 md:hidden">
            <span className="text-sm font-semibold">Navigation</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href === '/' ? '#' : `#${item.href.slice(1)}`}
                  className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted p-3 text-xs">
              <p className="font-semibold text-foreground mb-1">
                Educational Use Only
              </p>
              <p className="text-muted-foreground">
                This platform uses synthetic data for educational purposes only.
                Not for clinical decision-making.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
