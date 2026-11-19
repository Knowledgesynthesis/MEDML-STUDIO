import { useEffect, useState, type AnchorHTMLAttributes } from 'react';

/** Hash routes work on any static host (Vercel, GitHub Pages, file://) and offline as a PWA. */
const LEGACY: Record<string, string> = {
  datasets: '/lab',
  'model-lab': '/lab',
  explainability: '/lab/explain',
  learning: '/learn',
  ethics: '/learn/m9',
  glossary: '/glossary',
  'case-studies': '/cases',
};

export function currentPath(): string {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return '/';
  if (LEGACY[raw]) return LEGACY[raw];
  const m = raw.match(/^module-(\d+)$/);
  if (m) return `/learn/m${m[1]}`;
  const [path] = raw.split('?');
  return path.startsWith('/') ? path : `/${path}`;
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute(): string[] {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path.split('/').filter(Boolean);
}

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...rest} />;
}
