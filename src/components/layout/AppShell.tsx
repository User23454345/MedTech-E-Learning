import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastViewport } from '@/components/ui';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import s from './AppShell.module.css';

/** Bei Routenwechsel nach oben scrollen (Query-Änderungen wie ?tab= ausgenommen). */
function useScrollToTop(pathname: string) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
}

export function AppShell() {
  const { pathname } = useLocation();
  useScrollToTop(pathname);

  return (
    <div className={s.shell}>
      <a href="#main" className={s.skip} onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}>
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main" tabIndex={-1} className={s.main}>
        <div key={pathname} className="page-enter">
          <Suspense fallback={<div className={s.loading} role="status" aria-live="polite">Seite wird geladen …</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <div className={s.toastHost}>
        <ToastViewport />
      </div>
    </div>
  );
}
