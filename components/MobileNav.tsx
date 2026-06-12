'use client';

import { useEffect, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, usePathname } from '@/i18n/navigation';
import LocaleToggle from '@/components/LocaleToggle';

interface MobileNavProps {
  labels: {
    products: string;
    guides: string;
    blog: string;
    about: string;
    contact: string;
    menuOpen: string;
    menuClose: string;
  };
}

export default function MobileNav({ labels }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when navigating (e.g. browser back) — adjust state during render
  // instead of an effect, per react-hooks/set-state-in-effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const links = [
    { href: '/products', label: labels.products },
    { href: '/guides', label: labels.guides },
    { href: '/blog', label: labels.blog },
    { href: '/about', label: labels.about },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? labels.menuClose : labels.menuOpen}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-white/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-400"
      >
        {open ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full border-t border-steel-800 bg-steel-900 shadow-lg"
        >
          <nav className="mx-auto max-w-6xl px-4 py-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-white/90 hover:text-white"
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-steel-800 py-4">
              <LocaleToggle />
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-brass-400 px-4 py-2.5 text-steel-900 font-semibold hover:bg-brass-300 transition-colors"
              >
                {labels.contact}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
