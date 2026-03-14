import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
import { forwardRef, createElement } from 'react';
import type { ComponentProps } from 'react';

export const {
  Link: BaseLink,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);

type BaseLinkProps = ComponentProps<typeof BaseLink>;

// Re-export Link with prefetch disabled by default to avoid
// overwhelming Cloudflare Workers free plan with concurrent requests
export const Link = forwardRef<HTMLAnchorElement, BaseLinkProps>(
  function LinkNoPrefetch(props, ref) {
    return createElement(BaseLink, { ref, prefetch: false, ...props });
  },
);
