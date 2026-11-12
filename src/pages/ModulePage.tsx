import { Link, useParams } from 'react-router-dom';
import { ButtonLink, Card, Chip, Icon, IconBadge, ProgressRing, cx, type IconName } from '@/components/ui';
import { useProgress } from '@/state/progress';
import { getModule } from '@/data/modules';
import { categoryById } from '@/data/categories';
import type { DeviceModule, Lesson, LessonKind, Source } from '@/types/content';
import {
  LESSON_KIND_LABEL,
  formatDuration,
  isLessonDone,
  isLessonLocked,
  lessonPath,
  missingExamPrereqs,
  moduleProgress,
  nextLesson,
} from '@/lib/moduleProgress';
import { InlineMd } from '@/components/blocks/Markdown';
import { NotFoundView } from './components/NotFoundView';
import s from './ModulePage.module.css';

const KIND_ICON: Record<LessonKind, IconName> = {
  grundlagen: 'book',
  aufbau: 'layers',
  funktion: 'cpu',
  bedienung: 'sliders',
  training: 'gamepad',
  pruefung: 'award',
};

const SOURCE_KIND_LABEL: Record<Source['kind'], string> = {
  buch: 'Buch',
  leitlinie: 'Leitlinie',
  norm: 'Norm',
  artikel: 'Artikel',
  web: 'Web',
};

type Status = 'completed' | 'current' | 'locked' | 'open';

export default function ModulePage() {
  const { moduleId } = useParams();
  const module = getModule(moduleId);

  if (!module) {
    return (
      <NotFoundView code="Modul nicht gefunden" title="Dieses Lernmodul existiert nicht">
        <p>Vielleicht findest du das gesuchte Gerät im Katalog.</p>
      </NotFoundView>
    );
  }
  if (module.status !== 'available') {
    const cat = categoryById(module.category);
    return (
      <NotFoundView
        icon={module.icon}
        code="In Vorbereitung"
        title={module.title}
        actions={
          <>
            <ButtonLink to={`/katalog?kategorie=${module.category}`} icon="grid">
              {cat ? `Mehr aus „${cat.name}“` : 'Zum Katalog'}
            </ButtonLink>
            <ButtonLink to="/training" variant="secondary" icon="gamepad">
              Zum Training
            </ButtonLink>
          </>
        }
      >
        <p>{module.tagline}</p>
        <p>Dieses Modul wird gerade fachlich erarbeitet und geprüft. Bis dahin kannst du die verfügbaren Module vertiefen.</p>
      </NotFoundView>
    );
  }
  return <ModuleOverview module={module} />;
}

function ModuleOverview({ module }: { module: DeviceModule }) {
  const { state } = useProgress();
  const prog = moduleProgress(state, module);
  const next = nextLesson(state, module);
  const cat = categoryById(module.category);
  const missing = missingExamPrereqs(state, module);
  const exam = state.exams[module.id];
  const totalXp = module.lessons.reduce((a, l) => a + l.xp, 0);

  const statusOf = (l: Lesson): Status => {
    if (isLessonDone(state, module, l)) return 'completed';
    if (isLessonLocked(state, module, l)) return 'locked';
    if (next?.id === l.id) return 'current';
    return 'open';
  };

  const cta = next
    ? { to: lessonPath(module.id, next.id), label: prog.completed === 0 ? 'Modul starten' : `Weiter mit Lektion ${next.number}` }
    : { to: lessonPath(module.id, module.lessons[0]?.id ?? ''), label: 'Modul wiederholen' };

  return (
    <div className="container">
      <nav className={s.crumbs} aria-label="Brotkrümelnavigation">
        <Link to="/katalog">Gerätekatalog</Link>
        <Icon name="chevronRight" size={14} />
        {cat && (
          <>
            <Link to={`/katalog?kategorie=${cat.id}`}>{cat.name}</Link>
            <Icon name="chevronRight" size={14} />
          </>
        )}
        <span aria-current="page">{module.shortTitle}</span>
      </nav>

      <header className={s.hero}>
        <div className={s.heroMain}>
          <IconBadge name={module.icon} size={72} className={s.heroIcon} />
          <div>
            <h1 className={s.title}>{module.title}</h1>
            <p className={s.tagline}>{module.tagline}</p>
            <p className={s.desc}>{module.description}</p>
            <div className={s.meta}>
              <Chip icon="clock">{formatDuration(module.durationMin)}</Chip>
              <Chip icon="gauge">{module.level}</Chip>
              <Chip icon="book">{module.lessons.length} Lektionen</Chip>
              <Chip tone="xp" icon="zap">
                bis zu {totalXp + (module.exam?.xp ?? 0)} XP
              </Chip>
            </div>
          </div>
        </div>
        <Card className={s.progressCard}>
          <ProgressRing value={prog.ratio} size={112} stroke={10} label={`${prog.completed} von ${prog.total} Lektionen abgeschlossen`}>
            <span className={s.ringText}>
              {Math.round(prog.ratio * 100)}
              <small>%</small>
            </span>
          </ProgressRing>
          <div className={s.progressText}>
            {prog.completed} von {prog.total} Lektionen
          </div>
          {exam && (
            <div className={s.examMini}>
              <Icon name="award" size={16} />
              Test-Bestwert {Math.round(exam.bestScore * 100)} %{exam.passed ? ' · bestanden' : ''}
            </div>
          )}
          <ButtonLink to={cta.to} iconRight="arrowRight" block>
            {cta.label}
          </ButtonLink>
        </Card>
      </header>

      <div className={s.layout}>
        <section aria-labelledby="timeline-title">
          <h2 id="timeline-title" className={s.h2}>
            Lernpfad
          </h2>
          <ol className={s.timeline}>
            {module.lessons.map((l) => {
              const st = statusOf(l);
              const done = st === 'completed';
              const locked = st === 'locked';
              const content = (
                <>
                  <span className={s.node} aria-hidden="true">
                    {done ? <Icon name="check" size={18} strokeWidth={2.5} /> : locked ? <Icon name="lock" size={16} /> : l.number}
                  </span>
                  <div className={s.lessonCard}>
                    <div className={s.lessonTop}>
                      <span className={s.lessonKind}>
                        <Icon name={KIND_ICON[l.kind]} size={14} />
                        Lektion {l.number} · {LESSON_KIND_LABEL[l.kind]}
                      </span>
                      {done && (
                        <Chip tone="success" icon="check">
                          Abgeschlossen
                        </Chip>
                      )}
                      {st === 'current' && (
                        <Chip tone="primary" icon="play">
                          Als Nächstes
                        </Chip>
                      )}
                      {locked && <Chip icon="lock">Gesperrt</Chip>}
                    </div>
                    <h3 className={s.lessonTitle}>{l.title}</h3>
                    <p className={s.lessonSub}>{l.subtitle}</p>
                    <div className={s.lessonMeta}>
                      <span>
                        <Icon name="clock" size={14} /> {formatDuration(l.durationMin)}
                      </span>
                      <span>
                        <Icon name="zap" size={14} /> {l.kind === 'pruefung' && module.exam ? `${module.exam.xp} XP bei Bestehen` : `${l.xp} XP`}
                      </span>
                      {l.kind === 'pruefung' && module.exam && (
                        <span>
                          <Icon name="target" size={14} /> {module.exam.questionCount} Fragen · ab {Math.round(module.exam.passScore * 100)} %
                        </span>
                      )}
                    </div>
                    {locked && (
                      <p className={s.lockHint}>
                        <Icon name="info" size={16} />
                        <span>
                          Wird freigeschaltet, sobald du{' '}
                          {missing.map((m, i) => (
                            <span key={m.id}>
                              {i > 0 && (i === missing.length - 1 ? ' und ' : ', ')}
                              <strong>Lektion {m.number}</strong>
                            </span>
                          ))}{' '}
                          abgeschlossen hast.
                        </span>
                      </p>
                    )}
                  </div>
                </>
              );
              return (
                <li key={l.id} className={cx(s.step, s[st])}>
                  {locked ? (
                    <div className={s.stepInner} aria-disabled="true">
                      {content}
                    </div>
                  ) : (
                    <Link to={lessonPath(module.id, l.id)} className={cx(s.stepInner, s.stepLink)} aria-label={`Lektion ${l.number}: ${l.title}${done ? ' (abgeschlossen)' : ''}`}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <aside className={s.side}>
          <Card>
            <h2 className={s.h3}>
              <Icon name="target" size={20} /> Das kannst du danach
            </h2>
            <ul className={s.outcomes}>
              {module.outcomes.map((o) => (
                <li key={o}>
                  <span className={s.check}>
                    <Icon name="check" size={14} strokeWidth={2.5} />
                  </span>
                  <span>
                    <InlineMd text={o} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {module.sources.length > 0 && (
            <Card flat>
              <details className={s.sources}>
                <summary>
                  <span className={s.h3}>
                    <Icon name="quote" size={18} /> Literatur &amp; Normen
                  </span>
                  <span className={s.srcCount}>{module.sources.length}</span>
                  <Icon name="chevronDown" size={18} className={s.chev} />
                </summary>
                <ol className={s.srcList}>
                  {module.sources.map((src) => (
                    <li key={src.id}>
                      <span className={s.srcKind}>{SOURCE_KIND_LABEL[src.kind]}</span>
                      <div>
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noopener noreferrer">
                            {src.label}
                          </a>
                        ) : (
                          <span className={s.srcLabel}>{src.label}</span>
                        )}
                        {src.detail && <div className={s.srcDetail}>{src.detail}</div>}
                      </div>
                    </li>
                  ))}
                </ol>
              </details>
            </Card>
          )}

          <p className={s.disclaimer}>
            <Icon name="alert" size={16} />
            Gerätespezifische Einstellungen erfolgen stets nach Gebrauchsanweisung des Herstellers, ärztlicher Anordnung und lokalen SOPs.
          </p>
        </aside>
      </div>
    </div>
  );
}
