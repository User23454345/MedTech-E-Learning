import { Link } from 'react-router-dom';
import { ButtonLink, Card, Chip, Icon, IconBadge, ProgressBar, ProgressRing, cx, type IconName } from '@/components/ui';
import { useProgress } from '@/state/progress';
import { dailyTasksFor } from '@/lib/gamification';
import { ALL_MODULES, AVAILABLE_MODULES, getLesson, getModule } from '@/data/modules';
import { CATEGORIES } from '@/data/categories';
import { LESSON_KIND_LABEL, formatDuration, isLessonDone, lessonPath, moduleProgress, nextLesson } from '@/lib/moduleProgress';
import type { DeviceModule, Lesson } from '@/types/content';
import { HeroIllustration } from './components/HeroIllustration';
import { ModuleCard } from './components/ModuleCard';
import { SectionHeader } from './components/SectionHeader';
import { EmptyState } from './components/EmptyState';
import s from './HomePage.module.css';

const STEPS: { title: string; text: string; icon: IconName }[] = [
  { title: 'Grundlagen', text: 'Physik & Physiologie, die das Gerät erklärt.', icon: 'book' },
  { title: 'Aufbau', text: 'Komponenten interaktiv erkunden.', icon: 'layers' },
  { title: 'Funktion', text: 'Was im Gerät bei jedem Zyklus passiert.', icon: 'cpu' },
  { title: 'Bedienung', text: 'Parameter, Modi und Alarme sicher einordnen.', icon: 'sliders' },
  { title: 'Training', text: 'Simulator, Praxisfälle und Lernspiele.', icon: 'gamepad' },
  { title: 'Prüfung', text: 'Abschlusstest mit Themenauswertung.', icon: 'award' },
];

const RELATIVE = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
function relativeTime(iso: string): string {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(diffMin) < 60) return RELATIVE.format(diffMin, 'minute');
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return RELATIVE.format(diffH, 'hour');
  return RELATIVE.format(Math.round(diffH / 24), 'day');
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Hallo';
  return 'Guten Abend';
}

export default function HomePage() {
  const { state, level, streak } = useProgress();
  const name = state.profile.name.trim();

  // „Weiterlernen“: zuletzt besuchte (gültige) Lektion, sonst erste Lektion
  const recent = state.recent
    .map((r) => ({ r, module: getModule(r.moduleId), lesson: getLesson(r.moduleId, r.lessonId) }))
    .filter((x): x is { r: (typeof state.recent)[number]; module: DeviceModule; lesson: Lesson } => !!x.module && !!x.lesson && x.module.status === 'available');
  const firstModule = AVAILABLE_MODULES[0];
  const continueTo = recent[0]
    ? lessonPath(recent[0].module.id, recent[0].lesson.id)
    : firstModule?.lessons[0]
      ? lessonPath(firstModule.id, firstModule.lessons[0].id)
      : '/katalog';

  // Empfehlung: erste offene Lektion eines verfügbaren Moduls
  let recommended: { module: DeviceModule; lesson: Lesson } | null = null;
  for (const m of AVAILABLE_MODULES) {
    const l = nextLesson(state, m);
    if (l) {
      recommended = { module: m, lesson: l };
      break;
    }
  }

  const completedLessons = Object.values(state.lessons).filter((l) => l.completed).length;
  const accuracy = state.answers.total ? Math.round((state.answers.correct / state.answers.total) * 100) : null;
  const tasks = dailyTasksFor(state.daily.date);

  return (
    <div className={s.page}>
      {/* ---------------- Hero ---------------- */}
      <section className={s.hero}>
        <div className={cx('container', s.heroInner)}>
          <div className={s.heroText}>
            <div className={s.greet}>
              <Icon name="sparkles" size={16} />
              {greeting()}
              {name ? `, ${name}` : ''}!
            </div>
            <h1 className={s.headline}>
              Medizintechnik <span className={s.gradientText}>verstehen</span> – nicht nur auswendig lernen.
            </h1>
            <p className={s.intro}>
              Interaktive Lernmodule zu Medizingeräten: vom physikalischen Prinzip über Aufbau und Funktionsweise bis zur sicheren Bedienung –
              mit Simulatoren, Praxisfällen und Abschlusstest.
            </p>
            <div className={s.ctas}>
              <ButtonLink to={continueTo} size="lg" iconRight="arrowRight">
                {recent[0] ? 'Weiterlernen' : 'Jetzt starten'}
              </ButtonLink>
              <ButtonLink to="/katalog" size="lg" variant="secondary" icon="grid">
                Gerätekatalog
              </ButtonLink>
            </div>
            {recent[0] && (
              <p className={s.continueHint}>
                Zuletzt: <strong>{recent[0].lesson.title}</strong> · {recent[0].module.shortTitle}
              </p>
            )}
          </div>
          <div className={s.heroArt}>
            <HeroIllustration />
          </div>
        </div>
      </section>

      <div className="container">
        {/* ---------------- Dashboard ---------------- */}
        <section className={s.dashboard} aria-label="Dein Lernstand">
          <div className={s.dashMain}>
            <Card className={s.recommend}>
              <div className={s.cardHead}>
                <span className="eyebrow">Empfohlene nächste Lektion</span>
              </div>
              {recommended ? (
                <RecommendedLesson module={recommended.module} lesson={recommended.lesson} />
              ) : (
                <div className={s.allDone}>
                  <IconBadge name="trophy" size={52} />
                  <div>
                    <h3>Alle verfügbaren Lektionen abgeschlossen</h3>
                    <p className="muted">Stark! Festige dein Wissen im Training oder verbessere deine Bestleistung im Abschlusstest.</p>
                    <div className={s.ctas}>
                      <ButtonLink to="/training" icon="gamepad">
                        Zum Training
                      </ButtonLink>
                      {firstModule && (
                        <ButtonLink to={`/modul/${firstModule.id}`} variant="secondary">
                          Modulübersicht
                        </ButtonLink>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <div>
              <h2 className={s.h3}>Zuletzt bearbeitet</h2>
              {recent.length ? (
                <div className={s.recentList}>
                  {recent.slice(0, 4).map(({ r, module, lesson }) => {
                    const done = isLessonDone(state, module, lesson);
                    return (
                      <Link key={`${r.moduleId}/${r.lessonId}`} to={lessonPath(module.id, lesson.id)} className={s.recentItem}>
                        <IconBadge name={module.icon} size={40} />
                        <div className={s.recentBody}>
                          <div className={s.recentMeta}>
                            {module.shortTitle} · Lektion {lesson.number}
                          </div>
                          <div className={s.recentTitle}>{lesson.title}</div>
                        </div>
                        <div className={s.recentRight}>
                          {done ? (
                            <Chip tone="success" icon="check">
                              Erledigt
                            </Chip>
                          ) : (
                            <Chip tone="primary">In Arbeit</Chip>
                          )}
                          <span className={s.recentTime}>{relativeTime(r.at)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon="clock" title="Noch nichts bearbeitet">
                  <p>Sobald du eine Lektion öffnest, findest du sie hier wieder – ideal, um genau dort weiterzumachen.</p>
                </EmptyState>
              )}
            </div>
          </div>

          <aside className={s.dashSide}>
            <Card className={s.progressCard}>
              <div className={s.levelRow}>
                <ProgressRing value={level.progress} size={88} stroke={8} label={`Level ${level.level}, ${Math.round(level.progress * 100)} % bis zur nächsten Stufe`}>
                  <span className={s.levelNum}>
                    <small>Level</small>
                    {level.level}
                  </span>
                </ProgressRing>
                <div>
                  <div className={s.levelTitle}>{level.title}</div>
                  <div className={s.levelSub}>
                    {level.xpForNext ? (
                      <>
                        Noch <strong>{level.xpForNext - level.xpIntoLevel} XP</strong> bis „{level.nextTitle}“
                      </>
                    ) : (
                      'Höchste Stufe erreicht'
                    )}
                  </div>
                  <ProgressBar value={level.progress} variant="xp" label="Fortschritt zur nächsten Stufe" className={s.levelBar} />
                </div>
              </div>
              <dl className={s.stats}>
                <div>
                  <dt>
                    <Icon name="zap" size={16} /> XP gesamt
                  </dt>
                  <dd>{state.xp}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="flame" size={16} /> Serie
                  </dt>
                  <dd>
                    {streak} {streak === 1 ? 'Tag' : 'Tage'}
                  </dd>
                </div>
                <div>
                  <dt>
                    <Icon name="book" size={16} /> Lektionen
                  </dt>
                  <dd>{completedLessons}</dd>
                </div>
                <div>
                  <dt>
                    <Icon name="target" size={16} /> Trefferquote
                  </dt>
                  <dd>{accuracy === null ? '–' : `${accuracy} %`}</dd>
                </div>
              </dl>
              <Link to="/profil" className={s.moreLink}>
                Alle Statistiken & Abzeichen <Icon name="chevronRight" size={16} />
              </Link>
            </Card>

            <Card className={s.dailyCard}>
              <div className={s.dailyHead}>
                <h2 className={s.h3}>Tagesaufgaben</h2>
                <Chip tone="accent" icon="calendar">
                  {state.daily.claimed.length}/{tasks.length}
                </Chip>
              </div>
              <ul className={s.taskList}>
                {tasks.map((t) => {
                  const v = Math.min(t.target, t.value(state.daily));
                  const claimed = state.daily.claimed.includes(t.id);
                  return (
                    <li key={t.id} className={cx(s.task, claimed && s.taskDone)}>
                      <span className={s.taskIcon}>{claimed ? <Icon name="check" size={18} /> : <Icon name={t.icon} size={18} />}</span>
                      <div className={s.taskBody}>
                        <div className={s.taskTitle}>
                          {t.title}
                          <span className={s.taskCount}>
                            {v}/{t.target}
                          </span>
                        </div>
                        <ProgressBar value={v / t.target} label={`${t.title}: ${v} von ${t.target}`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className={s.dailyNote}>Jede erledigte Aufgabe bringt +20 XP. Neue Aufgaben gibt es jeden Tag.</p>
            </Card>
          </aside>
        </section>

        {/* ---------------- Kategorien ---------------- */}
        <section className={s.section}>
          <SectionHeader
            eyebrow="Fachgebiete"
            title="Gerätekategorien"
            description="Von der Beatmung bis zur Dialyse – die Plattform wächst Modul für Modul."
            action={
              <ButtonLink to="/katalog" variant="ghost" iconRight="arrowRight">
                Zum Katalog
              </ButtonLink>
            }
          />
          <div className={s.catGrid}>
            {CATEGORIES.map((c) => {
              const mods = ALL_MODULES.filter((m) => m.category === c.id);
              const avail = mods.filter((m) => m.status === 'available').length;
              return (
                <Link key={c.id} to={`/katalog?kategorie=${c.id}`} className={s.catCard}>
                  <IconBadge name={c.icon} size={42} />
                  <div className={s.catBody}>
                    <div className={s.catName}>{c.name}</div>
                    <div className={s.catCount}>
                      {mods.length} {mods.length === 1 ? 'Modul' : 'Module'}
                      {avail > 0 && <span className={s.catLive}> · {avail} verfügbar</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------------- Geräteübersicht ---------------- */}
        <section className={s.section}>
          <SectionHeader eyebrow="Lernmodule" title="Alle Geräte im Überblick" description="Jedes Modul folgt demselben didaktischen Aufbau in sechs Lektionen." />
          <div className={s.moduleGrid}>
            {ALL_MODULES.map((m) => (
              <ModuleCard key={m.id} module={m} compact />
            ))}
          </div>
        </section>

        {/* ---------------- Training ---------------- */}
        <section className={cx(s.section, s.training)}>
          <div className={s.trainingText}>
            <div className={s.eyebrowLight}>Quiz- &amp; Spielebereich</div>
            <h2>Wissen anwenden – unter realistischen Bedingungen</h2>
            <p>Trainiere gezielt mit schnellen Fragerunden, löse Missionen am Beatmungssimulator und lies Kurven wie ein Profi.</p>
            <ButtonLink to="/training" variant="secondary" iconRight="arrowRight">
              Zum Training
            </ButtonLink>
          </div>
          <div className={s.trainingCards}>
            <TrainingTeaser to="/training?tab=blitz" icon="zap" title="Blitzrunde" text={`60 Sekunden, so viele richtige Antworten wie möglich. Rekord: ${state.blitz.best}`} />
            <TrainingTeaser to="/training?tab=simulator" icon="sliders" title="Simulator-Missionen" text={`${state.simulator.challengesSolved.length} Missionen gelöst – stelle das Gerät für realistische Szenarien ein.`} />
            <TrainingTeaser to="/training?tab=kurven" icon="activity" title="Kurvendetektiv" text="Druck-, Flow- und Volumenkurven interpretieren und Auffälligkeiten erkennen." />
          </div>
        </section>

        {/* ---------------- Didaktik ---------------- */}
        <section className={s.section} aria-labelledby="concept-title">
          <SectionHeader
            id="concept-title"
            eyebrow="Didaktisches Konzept"
            title="So lernst du hier"
            description="Ein roter Faden durch jedes Gerät: erst verstehen, dann anwenden, dann nachweisen."
          />
          <ol className={s.steps}>
            {STEPS.map((st, i) => (
              <li key={st.title} className={s.step}>
                <span className={s.stepNum}>{i + 1}</span>
                <Icon name={st.icon} size={22} className={s.stepIcon} />
                <div className={s.stepTitle}>{st.title}</div>
                <div className={s.stepText}>{st.text}</div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function RecommendedLesson({ module, lesson }: { module: DeviceModule; lesson: Lesson }) {
  const { state } = useProgress();
  const prog = moduleProgress(state, module);
  return (
    <div className={s.recBody}>
      <div className={s.recIcon}>
        <IconBadge name={module.icon} size={56} />
      </div>
      <div className={s.recText}>
        <div className={s.recMeta}>
          {module.shortTitle} · Lektion {lesson.number} · {LESSON_KIND_LABEL[lesson.kind]}
        </div>
        <h3 className={s.recTitle}>{lesson.title}</h3>
        <p className={s.recSub}>{lesson.subtitle}</p>
        <div className={s.recChips}>
          <Chip icon="clock">{formatDuration(lesson.durationMin)}</Chip>
          <Chip tone="xp" icon="zap">
            +{lesson.xp} XP
          </Chip>
          <Chip tone="primary" icon="layers">
            Modul {prog.completed}/{prog.total}
          </Chip>
        </div>
      </div>
      <ButtonLink to={lessonPath(module.id, lesson.id)} iconRight="arrowRight" className={s.recBtn}>
        {lesson.kind === 'pruefung' ? 'Zum Abschlusstest' : 'Lektion öffnen'}
      </ButtonLink>
    </div>
  );
}

function TrainingTeaser({ to, icon, title, text }: { to: string; icon: IconName; title: string; text: string }) {
  return (
    <Link to={to} className={s.teaser}>
      <span className={s.teaserIcon}>
        <Icon name={icon} size={22} />
      </span>
      <div>
        <div className={s.teaserTitle}>{title}</div>
        <div className={s.teaserText}>{text}</div>
      </div>
      <Icon name="chevronRight" size={18} className={s.teaserArrow} />
    </Link>
  );
}
