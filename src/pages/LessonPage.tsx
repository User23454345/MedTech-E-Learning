import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, ButtonLink, Card, Chip, Icon, IconBadge, cx } from '@/components/ui';
import { BlockList } from '@/components/blocks/BlockRenderer';
import { InlineMd } from '@/components/blocks/Markdown';
import { ExamRunner } from '@/features/quiz/ExamRunner';
import { useProgress } from '@/state/progress';
import { getModule } from '@/data/modules';
import { lessonKey } from '@/lib/gamification';
import type { DeviceModule, Lesson } from '@/types/content';
import { LESSON_KIND_LABEL, formatDuration, isLessonDone, isLessonLocked, lessonPath, missingExamPrereqs } from '@/lib/moduleProgress';
import { LessonToc, scrollToSection, sectionDomId } from './components/LessonToc';
import { NotFoundView } from './components/NotFoundView';
import s from './LessonPage.module.css';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

const END_ID = '__ende';

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const module = getModule(moduleId);
  const lesson = module?.lessons.find((l) => l.id === lessonId);

  if (!module || module.status !== 'available') {
    return (
      <NotFoundView code="Modul nicht gefunden" title="Diese Lektion ist nicht verfügbar">
        <p>Das zugehörige Modul existiert nicht oder ist noch in Vorbereitung.</p>
      </NotFoundView>
    );
  }
  if (!lesson) {
    return (
      <NotFoundView
        code="Lektion nicht gefunden"
        title="Diese Lektion gibt es nicht"
        actions={
          <ButtonLink to={`/modul/${module.id}`} icon="arrowLeft">
            Zur Modulübersicht
          </ButtonLink>
        }
      >
        <p>Im Modul „{module.shortTitle}“ existiert keine Lektion mit dieser Adresse.</p>
      </NotFoundView>
    );
  }
  // key: Zustand (aktiver Abschnitt, Abschlussanzeige) beim Lektionswechsel zurücksetzen
  return <LessonView key={`${module.id}/${lesson.id}`} module={module} lesson={lesson} />;
}

function useReadingProgress(ref: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const p = total > 0 ? (window.innerHeight * 0.4 - rect.top) / total : 1;
      setProgress(Math.max(0, Math.min(1, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return progress;
}

function LessonView({ module, lesson }: { module: DeviceModule; lesson: Lesson }) {
  useDocumentTitle(`${lesson.title} · ${module.shortTitle}`);
  const progress = useProgress();
  const { state, visitLesson, markSectionSeen, completeLesson } = progress;
  const articleRef = useRef<HTMLElement>(null);
  const reading = useReadingProgress(articleRef);
  const [activeId, setActiveId] = useState<string | null>(lesson.sections[0]?.id ?? null);
  const [justCompleted, setJustCompleted] = useState(false);

  const isExam = lesson.kind === 'pruefung';
  const locked = isLessonLocked(state, module, lesson);
  const done = isLessonDone(state, module, lesson);
  const seen = state.lessons[lessonKey(module.id, lesson.id)]?.sectionsSeen ?? [];
  const idx = module.lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? module.lessons[idx - 1] : undefined;
  const next = idx < module.lessons.length - 1 ? module.lessons[idx + 1] : undefined;
  const nextLocked = next ? isLessonLocked(state, module, next) : false;

  // „Zuletzt bearbeitet“ – einmal pro Lektionsaufruf
  const visitRef = useRef(visitLesson);
  visitRef.current = visitLesson;
  useEffect(() => {
    visitRef.current(module.id, lesson.id);
  }, [module.id, lesson.id]);

  // Abschnitte beobachten → aktiver Abschnitt + „gelesen“ markieren
  const markRef = useRef(markSectionSeen);
  markRef.current = markSectionSeen;
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = lesson.sections.map((sec) => document.getElementById(sectionDomId(sec.id))).filter((e): e is HTMLElement => !!e);
    const endEl = document.getElementById(sectionDomId(END_ID));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = (e.target as HTMLElement).dataset.sectionId;
          if (!id) continue;
          setActiveId(id);
          if (id !== END_ID) markRef.current(module.id, lesson.id, id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px' },
    );
    els.forEach((e) => obs.observe(e));
    if (endEl) obs.observe(endEl);
    return () => obs.disconnect();
  }, [module.id, lesson.id, lesson.sections]);

  // Zusätzlich: Abschnitt gilt als gelesen, wenn er ≥ 40 % sichtbar ist (bzw. mind. die halbe
  // Fensterhöhe füllt) und das mindestens 1 s lang. Erfasst v. a. den ersten Abschnitt, der beim
  // Öffnen unterhalb des Beobachtungsbands beginnt.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = lesson.sections.map((sec) => document.getElementById(sectionDomId(sec.id))).filter((e): e is HTMLElement => !!e);
    const timers = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.sectionId;
          if (!id || id === END_ID) continue;
          const visibleEnough = e.isIntersecting && (e.intersectionRatio >= 0.4 || e.intersectionRect.height >= window.innerHeight * 0.5);
          if (visibleEnough && !timers.has(id)) {
            timers.set(
              id,
              window.setTimeout(() => {
                timers.delete(id);
                markRef.current(module.id, lesson.id, id);
              }, 1000),
            );
          } else if (!visibleEnough && timers.has(id)) {
            window.clearTimeout(timers.get(id));
            timers.delete(id);
          }
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    els.forEach((e) => obs.observe(e));
    return () => {
      obs.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [module.id, lesson.id, lesson.sections]);

  // Am Seitenende: alle Abschnitte gelten als gesehen (kurze letzte Abschnitte erreichen die Beobachtungszone evtl. nie)
  useEffect(() => {
    if (reading >= 0.995 && lesson.sections.length) {
      const last = lesson.sections[lesson.sections.length - 1];
      markRef.current(module.id, lesson.id, last.id);
    }
  }, [reading, module.id, lesson.id, lesson.sections]);

  const onComplete = () => {
    completeLesson(module.id, lesson.id, lesson.xp, lesson.title);
    setJustCompleted(true);
  };

  const missing = missingExamPrereqs(state, module);

  return (
    <>
      <div className={s.readingBar} role="progressbar" aria-label="Lesefortschritt" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(reading * 100)}>
        <div className={s.readingFill} style={{ transform: `scaleX(${reading})` }} />
      </div>

      <div className={cx('container', s.layout)}>
        <Link to={`/modul/${module.id}`} className={cx(s.back, s.backMobile)}>
          <Icon name="arrowLeft" size={16} /> {module.shortTitle}
        </Link>
        <aside className={s.sidebar}>
          <Link to={`/modul/${module.id}`} className={s.back}>
            <Icon name="arrowLeft" size={16} /> {module.shortTitle}
          </Link>
          <LessonToc
            sections={lesson.sections}
            activeId={activeId}
            seen={seen}
            extra={isExam ? { id: END_ID, label: 'Abschlusstest' } : { id: END_ID, label: 'Abschluss' }}
          />
        </aside>

        <article ref={articleRef} className={s.article}>
          <header className={s.header}>
            <div className={s.kicker}>
              <IconBadge name={module.icon} size={32} />
              <span>
                Lektion {lesson.number} · {LESSON_KIND_LABEL[lesson.kind]}
              </span>
              {done && (
                <Chip tone="success" icon="check">
                  Abgeschlossen
                </Chip>
              )}
            </div>
            <h1 className={s.title}>{lesson.title}</h1>
            <p className={s.subtitle}>
              <InlineMd text={lesson.subtitle} />
            </p>
            <div className={s.meta}>
              <Chip icon="clock">{formatDuration(lesson.durationMin)}</Chip>
              <Chip tone="xp" icon="zap">
                {isExam && module.exam ? `bis zu ${module.exam.xp + lesson.xp} XP` : `+${lesson.xp} XP`}
              </Chip>
              <Chip icon="layers">{lesson.sections.length} Abschnitte</Chip>
            </div>
            {lesson.objectives.length > 0 && (
              <Card className={s.objectives}>
                <h2 className={s.objTitle}>
                  <Icon name="target" size={20} /> Das lernst du
                </h2>
                <ul>
                  {lesson.objectives.map((o) => (
                    <li key={o}>
                      <Icon name="check" size={16} strokeWidth={2.5} />
                      <span>
                        <InlineMd text={o} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </header>

          {lesson.sections.map((sec, i) => (
            <section key={sec.id} id={sectionDomId(sec.id)} data-section-id={sec.id} className={s.section} aria-labelledby={`${sectionDomId(sec.id)}-h`}>
              <h2 id={`${sectionDomId(sec.id)}-h`} className={s.sectionTitle} tabIndex={-1}>
                <span className={s.sectionNum}>{String(i + 1).padStart(2, '0')}</span>
                {sec.title}
              </h2>
              <BlockList blocks={sec.blocks} module={module} contextId={`${module.id}/${lesson.id}/${sec.id}`} />
            </section>
          ))}

          <section id={sectionDomId(END_ID)} data-section-id={END_ID} className={s.endSection} aria-label={isExam ? 'Abschlusstest' : 'Lektion abschließen'}>
            {isExam ? (
              locked ? (
                <Card className={s.lockCard}>
                  <span className={s.lockIcon}>
                    <Icon name="lock" size={28} />
                  </span>
                  <h2 className={s.h3}>Abschlusstest noch gesperrt</h2>
                  <p>Der Test prüft das Wissen aus den vorherigen Lektionen. Schließe dafür bitte zuerst folgende Lektionen ab:</p>
                  <ul className={s.missingList}>
                    {missing.map((m) => (
                      <li key={m.id}>
                        <Link to={lessonPath(module.id, m.id)}>
                          <span className={s.missingNum}>{m.number}</span>
                          <span>{m.title}</span>
                          <Icon name="arrowRight" size={16} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : (
                <ExamRunner module={module} />
              )
            ) : done ? (
              <Card className={cx(s.doneCard, justCompleted && s.celebrate)}>
                {justCompleted && <Confetti />}
                <span className={s.doneIcon}>
                  <Icon name={justCompleted ? 'trophy' : 'check'} size={30} />
                </span>
                <h2 className={s.h3}>{justCompleted ? 'Stark – Lektion abgeschlossen!' : 'Diese Lektion hast du bereits abgeschlossen'}</h2>
                <p>
                  {justCompleted
                    ? `+${lesson.xp} XP gutgeschrieben. ${next ? `Weiter geht es mit „${next.title}“.` : 'Du hast das Ende des Moduls erreicht.'}`
                    : 'Wiederholen lohnt sich: Quizfragen und Spiele kannst du jederzeit erneut spielen.'}
                </p>
                {next && !nextLocked && (
                  <ButtonLink to={lessonPath(module.id, next.id)} iconRight="arrowRight" size="lg">
                    {next.kind === 'pruefung' ? 'Zum Abschlusstest' : `Lektion ${next.number} starten`}
                  </ButtonLink>
                )}
                {next && nextLocked && (
                  <ButtonLink to={`/modul/${module.id}`} variant="secondary" icon="layers">
                    Zur Modulübersicht
                  </ButtonLink>
                )}
              </Card>
            ) : (
              <Card className={s.completeCard}>
                <div>
                  <h2 className={s.h3}>Alles durchgearbeitet?</h2>
                  <p>Schließe die Lektion ab, um {lesson.xp} XP zu erhalten und deinen Fortschritt im Modul zu sichern.</p>
                  {seen.length < lesson.sections.length && (
                    <p className={s.hint}>
                      <Icon name="eye" size={16} /> {seen.length} von {lesson.sections.length} Abschnitten gelesen.{' '}
                      {lesson.sections.find((x) => !seen.includes(x.id)) && (
                        <button type="button" className={s.linkBtn} onClick={() => scrollToSection(lesson.sections.find((x) => !seen.includes(x.id))!.id)}>
                          Zum ersten offenen Abschnitt
                        </button>
                      )}
                    </p>
                  )}
                </div>
                <Button size="lg" variant="success" icon="check" onClick={onComplete}>
                  Lektion abschließen
                </Button>
              </Card>
            )}
          </section>

          <nav className={s.pager} aria-label="Lektionsnavigation">
            {prev ? (
              <Link to={lessonPath(module.id, prev.id)} className={s.pagerLink}>
                <Icon name="arrowLeft" size={18} />
                <span>
                  <small>Vorherige Lektion</small>
                  {prev.title}
                </span>
              </Link>
            ) : (
              <Link to={`/modul/${module.id}`} className={s.pagerLink}>
                <Icon name="arrowLeft" size={18} />
                <span>
                  <small>Zurück</small>
                  Modulübersicht
                </span>
              </Link>
            )}
            {next ? (
              nextLocked ? (
                <div className={cx(s.pagerLink, s.pagerNext, s.pagerLocked)} aria-disabled="true">
                  <span>
                    <small>Nächste Lektion · gesperrt</small>
                    {next.title}
                  </span>
                  <Icon name="lock" size={18} />
                </div>
              ) : (
                <Link to={lessonPath(module.id, next.id)} className={cx(s.pagerLink, s.pagerNext)}>
                  <span>
                    <small>Nächste Lektion</small>
                    {next.title}
                  </span>
                  <Icon name="arrowRight" size={18} />
                </Link>
              )
            ) : (
              <Link to="/training" className={cx(s.pagerLink, s.pagerNext)}>
                <span>
                  <small>Weiter üben</small>
                  Quiz- &amp; Spielebereich
                </span>
                <Icon name="arrowRight" size={18} />
              </Link>
            )}
          </nav>
        </article>
      </div>
    </>
  );
}

/** Dezente Konfetti-Animation (rein dekorativ, bei reduzierter Bewegung statisch/ausgeblendet). */
function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className={s.confetti} aria-hidden="true">
      {pieces.map((i) => (
        <span
          key={i}
          style={
            {
              '--x': `${((i * 37) % 100) - 50}`,
              '--d': `${(i % 6) * 60}ms`,
              '--r': `${(i * 47) % 360}deg`,
            } as CSSProperties
          }
          className={s[`piece${i % 3}`]}
        />
      ))}
    </div>
  );
}
