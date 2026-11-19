import { REF_MAP } from '@/content/references';

/** Inline author–year citation linking to the full reference (DOI / official source). */
export function Cite({ id, ids }: { id?: string; ids?: string[] }) {
  const list = ids ?? (id ? [id] : []);
  return (
    <span className="whitespace-nowrap text-[0.8em] text-muted-fg">
      [
      {list.map((k, i) => {
        const r = REF_MAP[k];
        if (!r) {
          if (import.meta.env.DEV) console.warn('Unknown reference', k);
          return null;
        }
        return (
          <span key={k}>
            {i > 0 && '; '}
            <a href={r.url} target="_blank" rel="noreferrer" title={r.citation} className="underline decoration-dotted underline-offset-2 hover:text-primary">
              {r.short}
            </a>
          </span>
        );
      })}
      ]
    </span>
  );
}

export function RefList({ ids }: { ids: string[] }) {
  return (
    <ol className="space-y-2 text-sm">
      {ids.map((k) => {
        const r = REF_MAP[k];
        if (!r) return null;
        return (
          <li key={k} id={`ref-${k}`} className="leading-snug">
            <span className="text-muted-fg">{r.citation} </span>
            <a href={r.url} target="_blank" rel="noreferrer" className="break-all text-primary underline-offset-2 hover:underline">
              {r.url.replace(/^https:\/\//, '')}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
