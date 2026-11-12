/**
 * Detailansicht einer Gerätekomponente (rechte Spalte des Explorers).
 */
import { type CSSProperties } from 'react';
import { Button, Icon, type IconName } from '@/components/ui';
import { Markdown, renderInline } from '@/components/blocks/Markdown';
import { CATEGORY_BY_ID, VENT_COMPONENTS, type VentComponent } from './deviceData';
import s from './VentilatorExplorer.module.css';

interface Props {
  comp: VentComponent;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

const SECTIONS: { key: 'what' | 'how' | 'why' | 'failure'; title: string; icon: IconName }[] = [
  { key: 'what', title: 'Was macht es?', icon: 'target' },
  { key: 'how', title: 'Wie funktioniert es?', icon: 'cpu' },
  { key: 'why', title: 'Warum wichtig?', icon: 'lightbulb' },
  { key: 'failure', title: 'Typischer Fehler & Alarm', icon: 'bell' },
];

export function ComponentPanel({ comp, onPrev, onNext, onClose }: Props) {
  const cat = CATEGORY_BY_ID[comp.category];
  const index = VENT_COMPONENTS.findIndex((c) => c.id === comp.id);
  return (
    <article className={s.detail} style={{ '--cat': cat.color } as CSSProperties} aria-labelledby={`vx-title-${comp.id}`}>
      <header className={s.detailHead}>
        <span className={s.detailIcon} aria-hidden="true">
          <Icon name={comp.icon} size={22} />
        </span>
        <div className={s.detailHeadText}>
          <span className={s.catTag}>
            <Icon name={cat.icon} size={13} />
            {cat.label}
          </span>
          <h3 id={`vx-title-${comp.id}`} className={s.detailTitle}>
            {renderInline(comp.name)}
          </h3>
        </div>
        <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Detailansicht schließen">
          <Icon name="x" size={16} />
        </button>
      </header>

      <div className={s.detailBody}>
        {SECTIONS.map((sec) => (
          <section key={sec.key} className={s.detailSec}>
            <h4 className={s.secTitle}>
              <Icon name={sec.icon} size={15} />
              {sec.title}
            </h4>
            <Markdown md={comp[sec.key]} className={s.secText} />
          </section>
        ))}
        <p className={s.term}>
          <span className={s.termLabel}>
            <Icon name="book" size={14} /> Fachbegriff
          </span>
          <span>{renderInline(comp.term)}</span>
        </p>
      </div>

      <footer className={s.detailNav}>
        <Button variant="ghost" size="sm" icon="chevronLeft" onClick={onPrev} aria-label="Vorherige Komponente">
          Zurück
        </Button>
        <span className={s.detailCount}>
          {index + 1} / {VENT_COMPONENTS.length}
        </span>
        <Button variant="ghost" size="sm" iconRight="chevronRight" onClick={onNext} aria-label="Nächste Komponente">
          Weiter
        </Button>
      </footer>
    </article>
  );
}
