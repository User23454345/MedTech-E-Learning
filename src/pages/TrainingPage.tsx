import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, Chip, Icon, Segmented, cx, type IconName } from '@/components/ui';
import { BlitzRound } from '@/features/quiz/BlitzRound';
import { WIDGETS } from '@/features/widgets';
import { MatchingGameView } from '@/features/games/MatchingGameView';
import { OrderingGameView } from '@/features/games/OrderingGameView';
import { FaultFinderView } from '@/features/games/FaultFinderView';
import { CaseRunner } from '@/features/games/CaseRunner';
import { useProgress } from '@/state/progress';
import { AVAILABLE_MODULES } from '@/data/modules';
import { GAME_KIND_LABEL, collectGames, lessonPath, type GameEntry } from '@/lib/moduleProgress';
import type { Question } from '@/types/content';
import { WidgetFrame } from './components/WidgetFrame';
import { EmptyState } from './components/EmptyState';
import s from './TrainingPage.module.css';

type TabId = 'blitz' | 'simulator' | 'kurven' | 'spiele';

const TABS: { id: TabId; label: string; short: string; icon: IconName; text: string }[] = [
  { id: 'blitz', label: 'Blitzrunde', short: 'Blitz', icon: 'zap', text: 'Wissensduell gegen deinen eigenen Rekord – 60 Sekunden.' },
  { id: 'simulator', label: 'Simulator-Missionen', short: 'Simulator', icon: 'sliders', text: 'Realistische Szenarien am Beatmungssimulator lösen.' },
  { id: 'kurven', label: 'Kurvendetektiv', short: 'Kurven', icon: 'activity', text: 'Beatmungskurven lesen und Auffälligkeiten erkennen.' },
  { id: 'spiele', label: 'Lernspiele', short: 'Spiele', icon: 'gamepad', text: 'Zuordnen, Reihenfolgen, Fehlersuche und Praxisfälle.' },
];
const isTab = (v: string | null): v is TabId => TABS.some((t) => t.id === v);

const GAME_ICON: Record<GameEntry['kind'], IconName> = {
  matching: 'shuffle',
  ordering: 'layers',
  faultFinder: 'search',
  case: 'stethoscope',
};

export default function TrainingPage() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabId = isTab(tabParam) ? tabParam : 'blitz';
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const { state } = useProgress();

  const selectTab = (id: TabId, focus = false) => {
    const next = new URLSearchParams(params);
    next.set('tab', id);
    setParams(next, { replace: true });
    if (focus) tabRefs.current[id]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let j = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = TABS.length - 1;
    if (j >= 0) {
      e.preventDefault();
      selectTab(TABS[j].id, true);
    }
  };

  const games = useMemo(() => collectGames(AVAILABLE_MODULES), []);
  const gamesPlayed = games.filter((g) => state.games[g.id]).length;

  const stats: { icon: IconName; label: string; value: string; tone: string }[] = [
    { icon: 'trophy', label: 'Blitz-Rekord', value: `${state.blitz.best} Pkt.`, tone: s.toneGold },
    { icon: 'sliders', label: 'Missionen gelöst', value: String(state.simulator.challengesSolved.length), tone: s.tonePrimary },
    { icon: 'gamepad', label: 'Lernspiele gespielt', value: `${gamesPlayed}/${games.length}`, tone: s.toneAccent },
    { icon: 'target', label: 'Richtige Antworten', value: String(state.answers.correct), tone: s.toneXp },
  ];

  return (
    <div className="container">
      <header className={s.header}>
        <div>
          <div className="eyebrow">Training</div>
          <h1>Quiz- &amp; Spielebereich</h1>
          <p className={s.lead}>
            Hier festigst du dein Wissen modulübergreifend: schnell, praxisnah und mit messbarem Fortschritt. Alles, was du hier spielst, zählt
            für XP, Tagesaufgaben und Abzeichen.
          </p>
        </div>
        <dl className={s.stats}>
          {stats.map((st) => (
            <div key={st.label} className={s.stat}>
              <span className={cx(s.statIcon, st.tone)}>
                <Icon name={st.icon} size={18} />
              </span>
              <div>
                <dt>{st.label}</dt>
                <dd>{st.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </header>

      <div className={s.tabs} role="tablist" aria-label="Trainingsbereiche">
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={cx(s.tab, tab === t.id && s.tabActive)}
            onClick={() => selectTab(t.id)}
            onKeyDown={onTabKey}
          >
            <span className={s.tabIcon}>
              <Icon name={t.icon} size={22} />
            </span>
            <span className={s.tabBody}>
              <span className={s.tabLabel}>
                <span className={s.long}>{t.label}</span>
                <span className={s.short}>{t.short}</span>
              </span>
              <span className={s.tabText}>{t.text}</span>
            </span>
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={s.panel} tabIndex={0} key={tab}>
        {tab === 'blitz' && <BlitzPanel />}
        {tab === 'simulator' && <SimulatorPanel />}
        {tab === 'kurven' && <CurvePanel />}
        {tab === 'spiele' && <GamesPanel games={games} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BlitzPanel() {
  const { state } = useProgress();
  const pool = useMemo<Question[]>(() => AVAILABLE_MODULES.flatMap((m) => m.practicePool ?? []), []);
  const [session, setSession] = useState(0);

  return (
    <div className={s.blitzLayout}>
      <Card className={s.duel}>
        <div className={s.duelHead}>
          <Icon name="swords" size={22} />
          <h2 className={s.h3}>Duell gegen deinen Rekord</h2>
        </div>
        <p>
          Kein anonymer Gegner, sondern ein ehrlicher Maßstab: Du trittst gegen deine eigene Bestleistung an. Beantworte in 60 Sekunden so viele
          Fragen wie möglich – jede richtige Antwort zählt einen Punkt, Fehler kosten nur Zeit.
        </p>
        <div className={s.versus}>
          <div className={s.vsSide}>
            <span className={s.vsLabel}>Du – heute</span>
            <span className={s.vsValue}>?</span>
          </div>
          <span className={s.vsBadge}>VS</span>
          <div className={s.vsSide}>
            <span className={s.vsLabel}>Dein Rekord</span>
            <span className={s.vsValue}>{state.blitz.best}</span>
          </div>
        </div>
        <div className={s.duelMeta}>
          <Chip icon="refresh">{state.blitz.plays} Runden gespielt</Chip>
          <Chip icon="book">{pool.length} Fragen im Pool</Chip>
        </div>
      </Card>
      <div className={s.blitzMain}>
        {pool.length ? (
          <BlitzRound key={session} pool={pool} onExit={() => setSession((n) => n + 1)} />
        ) : (
          <EmptyState icon="zap" title="Noch keine Fragen verfügbar">
            <p>Sobald Module mit Übungsfragen verfügbar sind, kannst du hier eine Blitzrunde starten.</p>
          </EmptyState>
        )}
      </div>
    </div>
  );
}

function SimulatorPanel() {
  const Sim = WIDGETS['vent-simulator'];
  return (
    <div className={s.widgetPanel}>
      <PanelIntro
        icon="sliders"
        title="Simulator-Missionen"
        text="Stelle den Beatmungssimulator so ein, dass die Zielvorgaben der Mission erfüllt sind. Das Modell ist bewusst vereinfacht (Einkompartiment-Modell) – reale Patient:innen reagieren komplexer."
        link={{ to: lessonPath('beatmungsgeraet', 'bedienung'), label: 'Grundlagen in Lektion 4 wiederholen' }}
      />
      {Sim ? (
        <WidgetFrame loadingText="Simulator wird geladen …">
          <Sim missions />
        </WidgetFrame>
      ) : (
        <EmptyState icon="sliders" title="Simulator nicht verfügbar" />
      )}
    </div>
  );
}

function CurvePanel() {
  const Detective = WIDGETS['vent-curve-detective'];
  return (
    <div className={s.widgetPanel}>
      <PanelIntro
        icon="activity"
        title="Kurvendetektiv"
        text="Druck-, Flow- und Volumenkurven verraten viel über Patient:in und Gerät. Erkenne Muster wie erhöhte Resistance, Air-Trapping oder Leckagen."
        link={{ to: lessonPath('beatmungsgeraet', 'training'), label: 'Zur Trainingslektion' }}
      />
      {Detective ? (
        <WidgetFrame loadingText="Kurvendetektiv wird geladen …">
          <Detective />
        </WidgetFrame>
      ) : (
        <EmptyState icon="activity" title="Kurvendetektiv nicht verfügbar" />
      )}
    </div>
  );
}

function PanelIntro({ icon, title, text, link }: { icon: IconName; title: string; text: string; link?: { to: string; label: string } }) {
  return (
    <div className={s.intro}>
      <span className={s.introIcon}>
        <Icon name={icon} size={22} />
      </span>
      <div>
        <h2 className={s.h3}>{title}</h2>
        <p>{text}</p>
        {link && (
          <Link to={link.to} className={s.introLink}>
            {link.label} <Icon name="chevronRight" size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type KindFilter = 'alle' | GameEntry['kind'];

function GamesPanel({ games }: { games: GameEntry[] }) {
  const { state } = useProgress();
  const [filter, setFilter] = useState<KindFilter>('alle');
  const [openId, setOpenId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const kinds = Array.from(new Set(games.map((g) => g.kind)));
  const options: { value: KindFilter; label: string }[] = [{ value: 'alle', label: 'Alle' }, ...kinds.map((k) => ({ value: k, label: GAME_KIND_LABEL[k] }))];
  const shown = games.filter((g) => filter === 'alle' || g.kind === filter);
  const open = games.find((g) => g.id === openId) ?? null;

  useEffect(() => {
    if (!openId || !panelRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panelRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    panelRef.current.focus({ preventScroll: true });
  }, [openId]);

  if (!games.length) {
    return (
      <EmptyState icon="gamepad" title="Noch keine Lernspiele">
        <p>Lernspiele erscheinen hier automatisch, sobald sie in verfügbaren Modulen enthalten sind.</p>
      </EmptyState>
    );
  }

  return (
    <div>
      <div className={s.gamesBar}>
        <p className={s.gamesNote}>Alle Lernspiele aus den Lektionen an einem Ort. Dein bester Versuch wird gespeichert.</p>
        <div className={s.segWrap}>
          <Segmented value={filter} onChange={setFilter} options={options} label="Spieltyp filtern" />
        </div>
      </div>

      {open && (
        <div ref={panelRef} tabIndex={-1} className={s.gamePanel} aria-label={`Lernspiel: ${open.title}`} role="region">
          <div className={s.gamePanelHead}>
            <div>
              <div className={s.gameKind}>
                <Icon name={GAME_ICON[open.kind]} size={14} /> {GAME_KIND_LABEL[open.kind]} · {open.module.shortTitle}, Lektion {open.lesson.number}
              </div>
              <h2 className={s.h3}>{open.title}</h2>
            </div>
            <Button variant="secondary" size="sm" icon="x" onClick={() => setOpenId(null)}>
              Schließen
            </Button>
          </div>
          <GameView key={open.id} entry={open} />
        </div>
      )}

      <div className={s.gameGrid}>
        {shown.map((g) => {
          const res = state.games[g.id];
          const isOpen = g.id === openId;
          return (
            <button
              key={g.id}
              type="button"
              className={cx(s.gameCard, isOpen && s.gameCardOpen)}
              aria-pressed={isOpen}
              onClick={() => setOpenId(isOpen ? null : g.id)}
            >
              <div className={s.gameTop}>
                <span className={cx(s.gameIcon, s[`gi-${g.kind}`])}>
                  <Icon name={GAME_ICON[g.kind]} size={20} />
                </span>
                {res ? (
                  <Chip tone={res.bestScore >= 1 ? 'success' : res.bestScore >= 0.7 ? 'primary' : 'warning'} icon="trophy">
                    Best {Math.round(res.bestScore * 100)} %
                  </Chip>
                ) : (
                  <Chip>Neu</Chip>
                )}
              </div>
              <div className={s.gameKind}>{GAME_KIND_LABEL[g.kind]}</div>
              <div className={s.gameTitle}>{g.title}</div>
              <div className={s.gameFrom}>
                {g.module.shortTitle} · Lektion {g.lesson.number}: {g.lesson.title}
              </div>
              <span className={s.gameCta}>
                {isOpen ? 'Geöffnet' : res ? 'Erneut spielen' : 'Spielen'}
                <Icon name={isOpen ? 'chevronDown' : 'play'} size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GameView({ entry }: { entry: GameEntry }) {
  switch (entry.kind) {
    case 'matching':
      return <MatchingGameView game={entry.game} />;
    case 'ordering':
      return <OrderingGameView game={entry.game} />;
    case 'faultFinder':
      return <FaultFinderView game={entry.game} />;
    case 'case':
      return <CaseRunner data={entry.game} />;
  }
}
