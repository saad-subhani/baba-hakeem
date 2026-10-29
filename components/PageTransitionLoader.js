'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const interval = useRef(null);
  const timeout = useRef(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const clearTimers = useCallback(() => {
    if (interval.current) clearInterval(interval.current);
    if (timeout.current) clearTimeout(timeout.current);
    interval.current = null;
    timeout.current = null;
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setProgress(100);
    timeout.current = setTimeout(() => setVisible(false), 220);
  }, [clearTimers]);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      finish();
    }
  }, [pathname, finish]);

  useEffect(() => {
    const start = () => {
      clearTimers();
      setVisible(true);
      setProgress(10);
      interval.current = setInterval(() => {
        setProgress((current) => current >= 88 ? current : current + Math.max(1, (88 - current) * 0.12));
      }, 120);
      timeout.current = setTimeout(finish, 6000);
    };

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || link.target && link.target !== '_self' || link.hasAttribute('download') || link.getAttribute('aria-disabled') === 'true') return;
      const next = new URL(link.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname === window.location.pathname) return;
      start();
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('bh-route-start', start);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('bh-route-start', start);
      clearTimers();
    };
  }, [clearTimers, finish]);

  return (
    <div className={`bh-page-progress${visible ? ' is-visible' : ''}`} aria-hidden="true">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}
