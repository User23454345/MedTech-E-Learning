import type { ReactNode } from 'react';
import { ButtonLink, type IconName, Icon } from '@/components/ui';
import s from './NotFoundView.module.css';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

/** Freundliche Hinweisseite (404, unbekanntes Modul, Modul in Vorbereitung …). */
export function NotFoundView({
  icon = 'search',
  code,
  title,
  children,
  actions,
}: {
  icon?: IconName;
  code?: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  useDocumentTitle(title);
  return (
    <div className="container">
      <div className={s.box}>
        <div className={s.art} aria-hidden="true">
          <svg viewBox="0 0 220 80" className={s.ecg}>
            <path d="M0 40h60l8-14 10 30 12-52 12 58 8-22h110" />
          </svg>
          <span className={s.icon}>
            <Icon name={icon} size={30} />
          </span>
        </div>
        {code && <div className={s.code}>{code}</div>}
        <h1 className={s.title}>{title}</h1>
        {children && <div className={s.text}>{children}</div>}
        <div className={s.actions}>
          {actions ?? (
            <>
              <ButtonLink to="/" icon="home">
                Zur Startseite
              </ButtonLink>
              <ButtonLink to="/katalog" variant="secondary" icon="grid">
                Gerätekatalog
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
