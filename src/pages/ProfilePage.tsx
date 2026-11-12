import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Chip, Icon, IconBadge, ProgressBar, ProgressRing, cx, type IconName } from '@/components/ui';
import { useProgress, BADGES } from '@/state/progress';
import { LEVELS } from '@/lib/gamification';
import { AVAILABLE_MODULES } from '@/data/modules';
import { ActivityChart } from './components/ActivityChart';
import s from './ProfilePage.module.css';

const DATE = new Intl.DateTimeFormat('de', { day: '2-digit', month: '2-digit', year: 'numeric' });
const TIER_LABEL = { bronze: 'Bronze', silber: 'Silber', gold: 'Gold' } as const;

export default function ProfilePage() {
  const { state, level, streak } = useProgress();

  const completedLessons = Object.values(state.lessons).filter((l) => l.completed).length;
  const accuracy = state.answers.total ? Math.round((state.answers.correct / state.answers.total) * 100) : null;
  const gamePlays = Object.values(state.games).reduce((a, g) => a + g.plays, 0);
  const earnedCount = BADGES.filter((b) => state.badges[b.id]).length;

  const stats: { icon: IconName; label: string; value: string; sub?: string }[] = [
    { icon: 'zap', label: 'Erfahrungspunkte', value: `${state.xp} XP` },
    { icon: 'book', label: 'Lektionen abgeschlossen', value: String(completedLessons) },
    {
      icon: 'target',
      label: 'Antworten',
      value: accuracy === null ? '–' : `${accuracy} %`,
      sub: `${state.answers.correct} von ${state.answers.total} richtig`,
    },
    { icon: 'gamepad', label: 'Lernspiele', value: String(Object.keys(state.games).length), sub: `${gamePlays} Durchgänge` },
    { icon: 'flame', label: 'Lernserie', value: `${streak} ${streak === 1 ? 'Tag' : 'Tage'}` },
    { icon: 'sliders', label: 'Simulator-Missionen', value: String(state.simulator.challengesSolved.length) },
    { icon: 'trophy', label: 'Blitz-Rekord', value: `${state.blitz.best} Pkt.`, sub: `${state.blitz.plays} Runden` },
    { icon: 'award', label: 'Abzeichen', value: `${earnedCount}/${BADGES.length}` },
  ];

  const examModules = AVAILABLE_MODULES.filter((m) => m.exam);

  return (
    <div className="container">
      <header className={s.header}>
        <div className="eyebrow">Profil</div>
        <h1>Dein Lernfortschritt</h1>
      </header>

      <div className={s.top}>
        <Card className={s.identity}>
          <div className={s.avatar} aria-hidden="true">
            {(state.profile.name.trim()[0] ?? 'M').toUpperCase()}
          </div>
          <NameEditor />
          <p className={s.privacy}>
            <Icon name="info" size={14} /> Alle Daten bleiben lokal in deinem Browser.
          </p>
        </Card>

        <Card className={s.levelCard}>
          <div className={s.levelHead}>
            <ProgressRing value={level.progress} size={104} stroke={9} label={`Level ${level.level}, ${Math.round(level.progress * 100)} % bis zur nächsten Stufe`}>
              <span className={s.levelNum}>
                <small>Level</small>
                {level.level}
              </span>
            </ProgressRing>
            <div className={s.levelInfo}>
              <div className={s.levelTitle}>{level.title}</div>
              <div className={s.levelSub}>
                {level.xpForNext ? (
                  <>
                    {level.xpIntoLevel} / {level.xpForNext} XP · noch {level.xpForNext - level.xpIntoLevel} XP bis „{level.nextTitle}“
                  </>
                ) : (
                  'Höchste Stufe erreicht – herzlichen Glückwunsch!'
                )}
              </div>
              <ProgressBar value={level.progress} variant="xp" label="Fortschritt zur nächsten Stufe" />
            </div>
          </div>
          <ol className={s.levels} aria-label="Alle Stufen">
            {LEVELS.map((l) => {
              const reached = state.xp >= l.minXp;
              const current = l.level === level.level;
              return (
                <li key={l.level} className={cx(s.levelItem, reached && s.levelReached, current && s.levelCurrent)} aria-current={current ? 'step' : undefined}>
                  <span className={s.levelDot}>{reached && !current ? <Icon name="check" size={12} strokeWidth={3} /> : l.level}</span>
                  <span className={s.levelName}>{l.title}</span>
                  <span className={s.levelXp}>{l.minXp} XP</span>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <section className={s.section} aria-labelledby="stats-title">
        <h2 id="stats-title" className={s.h2}>
          Statistik
        </h2>
        <dl className={s.stats}>
          {stats.map((st) => (
            <div key={st.label} className={s.stat}>
              <dt>
                <Icon name={st.icon} size={16} /> {st.label}
              </dt>
              <dd>{st.value}</dd>
              {st.sub && <dd className={s.statSub}>{st.sub}</dd>}
            </div>
          ))}
        </dl>

        <div className={s.twoCol}>
          <Card>
            <h3 className={s.h3}>Aktivität der letzten 14 Tage</h3>
            <ActivityChart activity={state.activity} />
          </Card>
          <Card>
            <h3 className={s.h3}>Abschlusstests</h3>
            {examModules.length ? (
              <ul className={s.exams}>
                {examModules.map((m) => {
                  const r = state.exams[m.id];
                  const examLesson = m.lessons.find((l) => l.kind === 'pruefung');
                  return (
                    <li key={m.id} className={s.exam}>
                      <IconBadge name={m.icon} size={40} />
                      <div className={s.examBody}>
                        <div className={s.examTitle}>{m.shortTitle}</div>
                        {r ? (
                          <>
                            <div className={s.examSub}>
                              Bestwert {Math.round(r.bestScore * 100)} % · letzter Versuch {Math.round(r.lastScore * 100)} % · {r.attempts}{' '}
                              {r.attempts === 1 ? 'Versuch' : 'Versuche'}
                            </div>
                            <ProgressBar value={r.bestScore} label={`Bestwert ${Math.round(r.bestScore * 100)} %`} />
                          </>
                        ) : (
                          <div className={s.examSub}>Noch nicht absolviert</div>
                        )}
                      </div>
                      {r?.passed ? (
                        <Chip tone="success" icon="award">
                          Bestanden
                        </Chip>
                      ) : examLesson ? (
                        <Link to={`/modul/${m.id}/lektion/${examLesson.id}`} className={s.examLink}>
                          {r ? 'Erneut' : 'Zum Test'}
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="muted">Noch keine Abschlusstests verfügbar.</p>
            )}
          </Card>
        </div>
      </section>

      <section className={s.section} aria-labelledby="badges-title">
        <div className={s.badgesHead}>
          <h2 id="badges-title" className={s.h2}>
            Abzeichen
          </h2>
          <Chip tone="xp" icon="award">
            {earnedCount} von {BADGES.length} erreicht
          </Chip>
        </div>
        <ul className={s.badges}>
          {BADGES.map((b) => {
            const at = state.badges[b.id];
            return (
              <li key={b.id} className={cx(s.badge, at ? s[`tier-${b.tier}`] : s.badgeLocked)}>
                <span className={s.badgeIcon}>
                  <Icon name={at ? b.icon : 'lock'} size={24} />
                </span>
                <div className={s.badgeBody}>
                  <div className={s.badgeTitle}>
                    {b.title}
                    <span className={s.tier}>{TIER_LABEL[b.tier]}</span>
                  </div>
                  <div className={s.badgeDesc}>{at ? b.description : `So erreichst du es: ${b.description}`}</div>
                  {at && <div className={s.badgeDate}>Erhalten am {DATE.format(new Date(at))}</div>}
                </div>
                <span className="visually-hidden">{at ? 'Erreicht' : 'Noch nicht erreicht'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={cx(s.section, s.danger)} aria-labelledby="reset-title">
        <div>
          <h2 id="reset-title" className={s.h3}>
            Fortschritt zurücksetzen
          </h2>
          <p>Löscht XP, abgeschlossene Lektionen, Testergebnisse, Abzeichen und Statistiken unwiderruflich aus diesem Browser.</p>
        </div>
        <ResetButton />
      </section>
    </div>
  );
}

function NameEditor() {
  const { state, setName, notify } = useProgress();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(state.profile.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = value.trim().slice(0, 40);
    setName(name);
    setEditing(false);
    notify({ kind: 'info', title: name ? `Hallo, ${name}!` : 'Name entfernt', icon: 'user' });
  };

  if (!editing) {
    return (
      <div className={s.nameRow}>
        <div>
          <div className={s.nameLabel}>Anzeigename</div>
          <div className={s.name}>{state.profile.name.trim() || 'Noch kein Name festgelegt'}</div>
        </div>
        <Button
          variant="soft"
          size="sm"
          icon="user"
          onClick={() => {
            setValue(state.profile.name);
            setEditing(true);
          }}
        >
          Bearbeiten
        </Button>
      </div>
    );
  }
  return (
    <form className={s.nameForm} onSubmit={submit}>
      <label htmlFor="profile-name" className={s.nameLabel}>
        Anzeigename
      </label>
      <input
        ref={inputRef}
        id="profile-name"
        className={s.input}
        value={value}
        maxLength={40}
        autoComplete="nickname"
        placeholder="z. B. Alex"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <div className={s.nameActions}>
        <Button type="submit" size="sm" icon="check">
          Speichern
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

function ResetButton() {
  const { reset } = useProgress();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => {
    dialogRef.current?.close();
    triggerRef.current?.focus();
  };

  return (
    <>
      <Button ref={triggerRef} variant="secondary" icon="reset" onClick={open} className={s.resetBtn}>
        Zurücksetzen …
      </Button>
      <dialog
        ref={dialogRef}
        className={s.dialog}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-desc"
        onClick={(e) => {
          // Klick auf den Hintergrund schließt den Dialog
          if (e.target === dialogRef.current) close();
        }}
        onClose={() => triggerRef.current?.focus()}
      >
        <div className={s.dialogBody}>
          <span className={s.dialogIcon}>
            <Icon name="alert" size={26} />
          </span>
          <h2 id="reset-dialog-title" className={s.h3}>
            Wirklich alles zurücksetzen?
          </h2>
          <p id="reset-dialog-desc">
            Dein gesamter Lernfortschritt – XP, Level, Lektionen, Testergebnisse, Abzeichen und Serie – wird gelöscht. Das lässt sich nicht
            rückgängig machen.
          </p>
          <div className={s.dialogActions}>
            <Button variant="secondary" onClick={close} autoFocus>
              Abbrechen
            </Button>
            <Button
              variant="danger"
              icon="reset"
              onClick={() => {
                reset();
                close();
              }}
            >
              Ja, zurücksetzen
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
