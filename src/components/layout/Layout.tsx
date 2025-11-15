import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <footer className="border-t py-6 px-6 md:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          Built by Bashar Hasan, MD
        </div>
      </footer>
    </div>
  );
}
