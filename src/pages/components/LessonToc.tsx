import { useState } from 'react';
import type { Section } from '@/types/content';
import { Icon, cx } from '@/components/ui';
import s from './LessonToc.module.css';

export const sectionDomId = (sectionId: string) => `abschnitt-${sectionId}`;

export function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionDomId(sectionId));
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  const heading = el.querySelector<HTMLElement>('h2');
  heading?.focus({ preventScroll: true });
}

/**
 * Inhaltsverzeichnis einer Lektion. Desktop: sticky Seitenleiste.
 * Mobil: einklappbares Panel.
 */
export function LessonToc({
  sections,
  activeId,
  seen,
  extra,
}: {
  sections: Section[];
  activeId: string | null;
  seen: string[];
  /** Zusätzlicher letzter Eintrag (z. B. „Abschlusstest“ / „Abschluss“) */
  extra?: { id: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const seenCount = sections.filter((x) => seen.includes(x.id)).length;

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <nav className={s.toc} aria-label="Inhalt der Lektion">
      <button type="button" className={s.toggle} aria-expanded={open} aria-controls="lesson-toc-list" onClick={() => setOpen((o) => !o)}>
        <Icon name="menu" size={18} />
        <span>Inhalt</span>
        <span className={s.count}>
          {seenCount}/{sections.length} gelesen
        </span>
        <Icon name="chevronDown" size={18} className={cx(s.chev, open && s.chevOpen)} />
      </button>
      <div className={s.heading}>
        <span>Inhalt</span>
        <span className={s.count}>
          {seenCount}/{sections.length}
        </span>
      </div>
      <ol id="lesson-toc-list" className={cx(s.list, open && s.listOpen)}>
        {sections.map((sec, i) => {
          const isSeen = seen.includes(sec.id);
          const active = activeId === sec.id;
          return (
            <li key={sec.id}>
              <button
                type="button"
                className={cx(s.item, active && s.active, isSeen && s.seen)}
                aria-current={active ? 'location' : undefined}
                onClick={() => go(sec.id)}
              >
                <span className={s.dot} aria-hidden="true">
                  {isSeen ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className={s.label}>{sec.title}</span>
                {isSeen && <span className="visually-hidden">(gelesen)</span>}
              </button>
            </li>
          );
        })}
        {extra && (
          <li>
            <button type="button" className={cx(s.item, activeId === extra.id && s.active)} onClick={() => go(extra.id)}>
              <span className={cx(s.dot, s.dotExtra)} aria-hidden="true">
                <Icon name="star" size={12} />
              </span>
              <span className={s.label}>{extra.label}</span>
            </button>
          </li>
        )}
      </ol>
    </nav>
  );
}
