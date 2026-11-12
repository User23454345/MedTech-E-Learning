/**
 * Widget „vent-explorer“: interaktives Schema eines Intensivrespirators.
 * Komponenten anklicken, nach Gruppen filtern, Gaswege animieren,
 * Fortschritt sammeln und im Prüfungsmodus Wissen testen.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Button, Icon, ProgressBar, Segmented, cx } from '@/components/ui';
import { renderInline } from '@/components/blocks/Markdown';
import { useProgress } from '@/state/progress';
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  COMPONENT_BY_ID,
  EXP_PATH_IDS,
  INSP_PATH_IDS,
  VENT_COMPONENTS,
  type VentCategory,
  type VentComponentId,
} from './deviceData';
import { DeviceDiagram, GEO, VIEW_H, VIEW_W, type GasFlowMode } from './DeviceDiagram';
import { ComponentPanel } from './ComponentPanel';
import { QUIZ_ROUNDS, useComponentQuiz } from './useComponentQuiz';
import s from './VentilatorExplorer.module.css';

const LS_EXPLORED = 'medtech-academy:vent-explorer:explored';
const LS_XP = 'medtech-academy:vent-explorer:xp-awarded';
const TOTAL = VENT_COMPONENTS.length;
const VALID_IDS = new Set<string>(VENT_COMPONENTS.map((c) => c.id));

function loadExplored(): Set<VentComponentId> {
  try {
    const raw = localStorage.getItem(LS_EXPLORED);
    const arr: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) {
      return new Set(arr.filter((x): x is VentComponentId => typeof x === 'string' && VALID_IDS.has(x)));
    }
  } catch {
    /* ignorieren */
  }
  return new Set();
}

type Mode = 'explore' | 'quiz';

export default function VentilatorExplorer() {
  const { awardXp, recordGame } = useProgress();
  const [mode, setMode] = useState<Mode>('explore');
  const [selected, setSelected] = useState<VentComponentId | null>(null);
  const [hovered, setHovered] = useState<VentComponentId | null>(null);
  const [category, setCategory] = useState<VentCategory | null>(null);
  const [flow, setFlow] = useState<GasFlowMode>('off');
  const [labels, setLabels] = useState(true);
  const [explored, setExplored] = useState<Set<VentComponentId>>(loadExplored);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const finishQuiz = useCallback((score: number) => recordGame('vent-explorer-quiz', score, 'Komponenten-Quiz'), [recordGame]);
  const { quiz, target, answer, next, restart } = useComponentQuiz(finishQuiz);

  /* Fortschritt speichern + einmalige XP-Belohnung */
  useEffect(() => {
    try {
      localStorage.setItem(LS_EXPLORED, JSON.stringify([...explored]));
    } catch {
      /* Speicher voll / privat – ignorieren */
    }
    if (explored.size >= TOTAL) {
      let already = false;
      try {
        already = localStorage.getItem(LS_XP) === '1';
        if (!already) localStorage.setItem(LS_XP, '1');
      } catch {
        already = true;
      }
      if (!already) awardXp(20, 'Alle Komponenten erkundet');
    }
  }, [explored, awardXp]);

  const select = useCallback((id: VentComponentId) => {
    setSelected(id);
    setExplored((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const step = (dir: 1 | -1) => {
    const i = selected ? VENT_COMPONENTS.findIndex((c) => c.id === selected) : -1;
    const n = (i + dir + TOTAL) % TOTAL;
    select(VENT_COMPONENTS[n].id);
  };

  const onDiagramSelect = (id: VentComponentId) => {
    if (mode === 'quiz') answer(id);
    else select(id);
  };

  /* Im Quiz nach Antwort Fokus auf „Weiter“ setzen */
  useEffect(() => {
    if (mode === 'quiz' && quiz.phase === 'feedback') nextBtnRef.current?.focus();
  }, [mode, quiz.phase]);

  const startQuiz = () => {
    restart();
    setMode('quiz');
    setFlow('off');
    setCategory(null);
    setHovered(null);
  };
  const endQuiz = () => {
    setMode('explore');
    setHovered(null);
  };

  const pathIds = flow === 'insp' ? INSP_PATH_IDS : flow === 'exp' ? EXP_PATH_IDS : null;
  const tooltipId = mode === 'explore' ? hovered : null;
  const tip = useMemo(() => {
    if (!tooltipId) return null;
    const [bx, by, bw, bh] = GEO[tooltipId].box;
    const below = by < 80;
    return {
      comp: COMPONENT_BY_ID[tooltipId],
      left: `${((bx + bw / 2) / VIEW_W) * 100}%`,
      top: `${((below ? by + bh : by) / VIEW_H) * 100}%`,
      below,
    };
  }, [tooltipId]);

  const pct = explored.size / TOTAL;
  const quizMode = mode === 'quiz';

  return (
    <div className={s.root}>
      {/* ---------- Werkzeugleiste ---------- */}
      <div className={s.toolbar}>
        <div className={s.chips} role="group" aria-label="Komponentengruppe hervorheben">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={s.catChip}
              style={{ '--cat': c.color } as CSSProperties}
              aria-pressed={category === c.id}
              disabled={quizMode}
              onClick={() => setCategory((cur) => (cur === c.id ? null : c.id))}
            >
              <span className={s.catDot} aria-hidden="true" />
              {c.label}
            </button>
          ))}
        </div>
        <div className={s.controls}>
          {!quizMode && (
            <>
              <Segmented<GasFlowMode>
                label="Gasweg anzeigen"
                value={flow}
                onChange={setFlow}
                options={[
                  { value: 'off', label: 'Aus' },
                  { value: 'insp', label: 'Inspiration' },
                  { value: 'exp', label: 'Exspiration' },
                ]}
              />
              <button type="button" className={s.toggle} aria-pressed={labels} onClick={() => setLabels((v) => !v)}>
                <Icon name="eye" size={16} />
                Beschriftungen
              </button>
            </>
          )}
          {quizMode ? (
            <Button variant="secondary" size="sm" icon="x" onClick={endQuiz}>
              Prüfungsmodus beenden
            </Button>
          ) : (
            <Button variant="accent" size="sm" icon="target" onClick={startQuiz}>
              Prüfungsmodus
            </Button>
          )}
        </div>
      </div>

      {/* ---------- Fortschritt / Quiz-Aufgabe ---------- */}
      {quizMode ? (
        <QuizBar
          phase={quiz.phase}
          round={quiz.round}
          score={quiz.score}
          targetName={target ? COMPONENT_BY_ID[target].name : ''}
          lastCorrect={quiz.lastCorrect}
          onNext={next}
          onRestart={restart}
          onEnd={endQuiz}
          nextRef={nextBtnRef}
        />
      ) : (
        <div className={s.progress}>
          <div className={s.progressText}>
            <Icon name={pct >= 1 ? 'award' : 'search'} size={16} />
            <span>
              <strong>
                {explored.size} / {TOTAL}
              </strong>{' '}
              Komponenten erkundet
            </span>
            {pct >= 1 && <span className={s.doneTag}>Vollständig!</span>}
          </div>
          <ProgressBar value={pct} label="Erkundungsfortschritt" className={s.progressBar} />
        </div>
      )}

      {/* ---------- Hauptbereich ---------- */}
      <div className={s.layout}>
        <div className={cx(s.diagramCard, quizMode && s.diagramQuiz)}>
          <div className={s.diagramWrap}>
            <DeviceDiagram
              selected={selected}
              explored={explored}
              highlightCategory={quizMode ? null : category}
              flow={quizMode ? 'off' : flow}
              showLabels={labels}
              marks={quizMode ? quiz.marks : undefined}
              quiz={quizMode}
              onSelect={onDiagramSelect}
              onHover={setHovered}
            />
            {tip && (
              <div
                className={cx(s.tooltip, tip.below && s.tooltipBelow)}
                style={{ left: tip.left, top: tip.top }}
                aria-hidden="true"
              >
                <span className={s.tipName}>{tip.comp.short}</span>
                <span className={s.tipCat} style={{ '--cat': CATEGORY_BY_ID[tip.comp.category].color } as CSSProperties}>
                  {CATEGORY_BY_ID[tip.comp.category].label}
                </span>
              </div>
            )}
          </div>
          {pathIds && (
            <ol className={s.pathStrip} aria-label={flow === 'insp' ? 'Gasweg in der Inspiration' : 'Gasweg in der Exspiration'}>
              {pathIds.map((id, i) => (
                <li key={id}>
                  <button type="button" className={cx(s.pathStep, selected === id && s.pathStepActive)} onClick={() => select(id)}>
                    <span className={s.pathNum}>{i + 1}</span>
                    {COMPONENT_BY_ID[id].short}
                  </button>
                  {i < pathIds.length - 1 && <Icon name="chevronRight" size={14} className={s.pathArrow} />}
                </li>
              ))}
              {flow === 'exp' && (
                <li>
                  <Icon name="chevronRight" size={14} className={s.pathArrow} />
                  <span className={s.pathEnd}>Ausgang (Umgebung)</span>
                </li>
              )}
            </ol>
          )}
          {flow !== 'off' && !quizMode && (
            <p className={s.flowNote}>
              <Icon name="info" size={14} />
              {flow === 'insp'
                ? 'Inspiration: Inspirationsventil dosiert den Flow, Exspirationsventil ist geschlossen – das Frischgas strömt zur Lunge.'
                : 'Exspiration: Inspirationsventil geschlossen, Exspirationsventil geöffnet – die Lunge entleert sich passiv bis auf PEEP-Niveau.'}
            </p>
          )}
        </div>

        <aside className={s.panel} aria-live="polite">
          {quizMode ? (
            <QuizSide phase={quiz.phase} score={quiz.score} lastCorrect={quiz.lastCorrect} targetId={target} />
          ) : selected ? (
            <ComponentPanel comp={COMPONENT_BY_ID[selected]} onPrev={() => step(-1)} onNext={() => step(1)} onClose={() => setSelected(null)} />
          ) : (
            <IntroPanel onStart={() => select(INSP_PATH_IDS[0])} />
          )}
        </aside>
      </div>
    </div>
  );
}

/* ---------- Teilkomponenten ---------- */

function IntroPanel({ onStart }: { onStart: () => void }) {
  return (
    <div className={s.intro}>
      <span className={s.introIcon} aria-hidden="true">
        <Icon name="hand" size={26} />
      </span>
      <h3 className={s.introTitle}>Gerät erkunden</h3>
      <p>
        Klicke oder tippe auf ein Bauteil im Schema – oder navigiere mit der <kbd>Tab</kbd>-Taste und bestätige mit <kbd>Enter</kbd>.
        Zu jeder Komponente erfährst du, was sie macht, wie sie technisch funktioniert und welche Alarme bei Fehlern typisch sind.
      </p>
      <ul className={s.introList}>
        <li>
          <Icon name="layers" size={16} /> Gruppen oben hervorheben
        </li>
        <li>
          <Icon name="wind" size={16} /> Gasweg in Inspiration und Exspiration animieren
        </li>
        <li>
          <Icon name="target" size={16} /> Im Prüfungsmodus dein Wissen testen
        </li>
      </ul>
      <Button variant="soft" size="sm" iconRight="arrowRight" onClick={onStart}>
        Beim Gaseingang starten
      </Button>
      <p className={s.modelHint}>
        <Icon name="info" size={14} /> Vereinfachtes, herstellerneutrales Schema. Aufbau und Bezeichnungen variieren je nach Gerät – maßgeblich ist
        die Gebrauchsanweisung.
      </p>
    </div>
  );
}

interface QuizBarProps {
  phase: 'ask' | 'feedback' | 'done';
  round: number;
  score: number;
  targetName: string;
  lastCorrect: boolean | null;
  onNext: () => void;
  onRestart: () => void;
  onEnd: () => void;
  nextRef: RefObject<HTMLButtonElement>;
}

function QuizBar({ phase, round, score, targetName, lastCorrect, onNext, onRestart, onEnd, nextRef }: QuizBarProps) {
  if (phase === 'done') {
    const pct = Math.round((score / QUIZ_ROUNDS) * 100);
    return (
      <div className={cx(s.quizBar, s.quizDone)} role="status">
        <Icon name="trophy" size={20} />
        <span className={s.quizPrompt}>
          Ergebnis: <strong>{score} / {QUIZ_ROUNDS}</strong> richtig ({pct} %)
        </span>
        <div className={s.quizActions}>
          <Button size="sm" icon="refresh" onClick={onRestart}>
            Nochmal
          </Button>
          <Button size="sm" variant="secondary" onClick={onEnd}>
            Zum Erkunden
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={cx(s.quizBar, lastCorrect === true && s.quizOk, lastCorrect === false && s.quizBad)}>
      <span className={s.quizRound}>
        Runde {round + 1} / {QUIZ_ROUNDS}
      </span>
      <span className={s.quizPrompt} aria-live="assertive">
        {phase === 'ask' ? (
          <>
            Klicke auf: <strong>{renderInline(targetName)}</strong>
          </>
        ) : lastCorrect ? (
          <>
            <Icon name="check" size={18} /> Richtig!
          </>
        ) : (
          <>
            <Icon name="x" size={18} /> Leider falsch – gesucht war: <strong>{renderInline(targetName)}</strong> (grün markiert)
          </>
        )}
      </span>
      <div className={s.quizActions}>
        <span className={s.quizScore}>
          <Icon name="star" size={14} /> {score}
        </span>
        {phase === 'feedback' && (
          <Button ref={nextRef} size="sm" iconRight="arrowRight" onClick={onNext}>
            {round + 1 >= QUIZ_ROUNDS ? 'Auswertung' : 'Weiter'}
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizSide({ phase, score, lastCorrect, targetId }: { phase: 'ask' | 'feedback' | 'done'; score: number; lastCorrect: boolean | null; targetId: VentComponentId | undefined }) {
  if (phase === 'done') {
    const ratio = score / QUIZ_ROUNDS;
    const msg =
      ratio === 1
        ? 'Perfekt! Du kennst den Aufbau des Respirators sicher.'
        : ratio >= 0.75
          ? 'Sehr gut – nur noch wenige Lücken.'
          : ratio >= 0.5
            ? 'Solide Basis. Schau dir die verfehlten Komponenten noch einmal im Erkundungsmodus an.'
            : 'Nutze den Erkundungsmodus und die Gasweg-Animation, dann versuche es erneut.';
    return (
      <div className={s.intro}>
        <span className={s.introIcon} aria-hidden="true">
          <Icon name="trophy" size={26} />
        </span>
        <h3 className={s.introTitle}>
          {score} von {QUIZ_ROUNDS} richtig
        </h3>
        <p>{msg}</p>
      </div>
    );
  }
  if (phase === 'feedback' && targetId) {
    const comp = COMPONENT_BY_ID[targetId];
    return (
      <div className={cx(s.intro, lastCorrect ? s.feedbackOk : s.feedbackBad)}>
        <span className={s.introIcon} aria-hidden="true">
          <Icon name={lastCorrect ? 'check' : 'info'} size={26} />
        </span>
        <h3 className={s.introTitle}>{renderInline(comp.name)}</h3>
        <p>{renderInline(comp.what)}</p>
      </div>
    );
  }
  return (
    <div className={s.intro}>
      <span className={s.introIcon} aria-hidden="true">
        <Icon name="target" size={26} />
      </span>
      <h3 className={s.introTitle}>Prüfungsmodus</h3>
      <p>
        In {QUIZ_ROUNDS} Runden wird jeweils eine Komponente genannt. Finde sie im Schema – die Beschriftungen sind ausgeblendet. Pro Runde zählt
        der erste Klick.
      </p>
    </div>
  );
}
