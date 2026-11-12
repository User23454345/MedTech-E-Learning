import type { ReactNode } from 'react';
import s from './SectionHeader.module.css';

/** Einheitliche Überschrift für Seitenabschnitte (Eyebrow, Titel, Beschreibung, Aktion rechts). */
export function SectionHeader({ eyebrow, title, description, action, id }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className={s.head}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 id={id} className={s.title}>
          {title}
        </h2>
        {description && <p className={s.desc}>{description}</p>}
      </div>
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}
