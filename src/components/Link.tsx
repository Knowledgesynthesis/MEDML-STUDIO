import type { AnchorHTMLAttributes } from 'react';

/** Hash-route link: works on any static host and offline. */
export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={`#${to}`} {...rest} />;
}
