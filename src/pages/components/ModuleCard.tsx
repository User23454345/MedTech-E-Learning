import { Link } from 'react-router-dom';
import type { DeviceModule } from '@/types/content';
import { Chip, Icon, IconBadge, ProgressRing, cx } from '@/components/ui';
import { categoryById } from '@/data/categories';
import { useProgress } from '@/state/progress';
import { formatDuration, moduleProgress } from '@/lib/moduleProgress';
import s from './ModuleCard.module.css';

/** Gerätekarte für Startseite und Katalog. Module „In Vorbereitung“ sind nicht anklickbar. */
export function ModuleCard({ module, compact }: { module: DeviceModule; compact?: boolean }) {
  const { state } = useProgress();
  const cat = categoryById(module.category);
  const available = module.status === 'available';
  const prog = available ? moduleProgress(state, module) : null;

  const body = (
    <>
      <div className={s.top}>
        <IconBadge name={module.icon} size={compact ? 42 : 48} className={cx(!available && s.badgeMuted)} />
        {available && prog ? (
          <ProgressRing value={prog.ratio} size={compact ? 44 : 50} stroke={5} label={`${prog.completed} von ${prog.total} Lektionen abgeschlossen`}>
            <span className={s.ringText}>{Math.round(prog.ratio * 100)}%</span>
          </ProgressRing>
        ) : (
          <Chip icon="lock">In Vorbereitung</Chip>
        )}
      </div>
      {cat && <div className={s.cat}>{cat.name}</div>}
      <h3 className={s.title}>{module.title}</h3>
      {!compact && <p className={s.tagline}>{module.tagline}</p>}
      <div className={s.meta}>
        <span>
          <Icon name="clock" size={14} /> {formatDuration(module.durationMin)}
        </span>
        <span>
          <Icon name="gauge" size={14} /> {module.level}
        </span>
        {available && (
          <span>
            <Icon name="book" size={14} /> {module.lessons.length} Lektionen
          </span>
        )}
      </div>
      {available && (
        <span className={s.cta}>
          {prog && prog.completed === prog.total ? 'Wiederholen' : prog && prog.completed > 0 ? 'Fortsetzen' : 'Modul starten'}
          <Icon name="arrowRight" size={16} />
        </span>
      )}
    </>
  );

  if (!available) {
    return (
      <div className={cx(s.card, s.disabled, compact && s.compact)} aria-disabled="true" aria-label={`${module.title} – in Vorbereitung`}>
        {body}
      </div>
    );
  }
  return (
    <Link to={`/modul/${module.id}`} className={cx(s.card, s.link, compact && s.compact)}>
      {body}
    </Link>
  );
}
