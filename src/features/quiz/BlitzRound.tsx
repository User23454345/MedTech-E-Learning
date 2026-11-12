/**
 * Blitzrunde: 60 Sekunden, so viele Fragen wie möglich (nur Wahr/Falsch und
 * Single Choice). +1 Punkt je richtiger Antwort, keine Minuspunkte.
 * Duell gegen den eigenen Rekord: Der „Geist“ läuft linear mit dem
 * bisherigen Bestwert-Tempo mit.
 *
 * `recordBlitz` wird genau einmal pro Runde aufgerufen (Ref-Guard über die Runden-ID).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Question, SingleChoiceQuestion, TrueFalseQuestion } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, Card, Icon, cx } from '@/components/ui';
import { InlineMd } from '@/components/blocks/Markdown';
import { Burst } from '@/features/games/GameShell';
import { shuffle, shuffledIndices } from './random';
import s from './BlitzRound.module.css';

const DURATION_MS = 60_000;
const FLASH_MS = 650;
const MAX_OPTIONS = 4;

type BlitzQuestion = SingleChoiceQuestion | TrueFalseQuestion;
type Phase = 'start' | 'running' | 'end';

interface Shown {
  q: BlitzQuestion;
  /** Anzeige-Reihenfolge (Original-Indizes), nur single */
  order: number[];
}

function prepare(q: BlitzQuestion): Shown {
  if (q.kind === 'truefalse') return { q, order: [] };
  // Bei vielen Optionen: richtige + zufällige Distraktoren (max. 4)
  const others = shuffle(q.options.map((_, i) => i).filter((i) => i !== q.correct)).slice(0, MAX_OPTIONS - 1);
  return { q, order: shuffle([q.correct, ...others]) };
}

export function BlitzRound({ pool, onExit }: { pool: Question[]; onExit?: () => void }) {
  const { state, recordBlitz } = useProgress();
  const usable = useMemo(() => pool.filter((q): q is BlitzQuestion => q.kind === 'truefalse' || q.kind === 'single'), [pool]);

  const [phase, setPhase] = useState<Phase>('start');
  const [roundId, setRoundId] = useState(0);
  const [startAt, setStartAt] = useState(0);
  const [now, setNow] = useState(0);
  const [points, setPoints] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [shown, setShown] = useState<Shown | null>(null);
  const [flash, setFlash] = useState<{
    ok: boolean;
    chosen: number | boolean;
  } | null>(null);
  const [bestAtStart, setBestAtStart] = useState(0);
  const [qn, setQn] = useState(0);
  const qAreaRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    points: number;
    answered: number;
    record: boolean;
  } | null>(null);

  const deck = useRef<number[]>([]);
  const pointsRef = useRef(0);
  const answeredRef = useRef(0);
  const finishedRounds = useRef(new Set<number>());
  const flashTimer = useRef<number | null>(null);

  const drawNext = useCallback(() => {
    if (deck.current.length === 0) deck.current = shuffledIndices(usable.length);
    const idx = deck.current.pop();
    setShown(idx === undefined ? null : prepare(usable[idx]));
    setQn((n) => n + 1);
  }, [usable]);

  // Beim Start/Ende die Karte an den Seitenanfang holen (Timer & Punkte sichtbar, v. a. mobil)
  useEffect(() => {
    if (phase === 'start') return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    rootRef.current?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [phase, roundId]);

  // Fokus auf die erste Antwort der neuen Frage (Tastaturbedienung ohne Fokusverlust)
  useEffect(() => {
    if (phase === 'running') qAreaRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, [qn, phase]);

  const start = () => {
    const id = roundId + 1;
    setRoundId(id);
    deck.current = shuffledIndices(usable.length);
    pointsRef.current = 0;
    answeredRef.current = 0;
    setPoints(0);
    setAnswered(0);
    setFlash(null);
    setResult(null);
    setBestAtStart(state.blitz.best);
    const t = Date.now();
    setStartAt(t);
    setNow(t);
    setPhase('running');
    drawNext();
  };

  const finish = useCallback(
    (id: number) => {
      if (finishedRounds.current.has(id)) return;
      finishedRounds.current.add(id);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      const p = pointsRef.current;
      setResult({
        points: p,
        answered: answeredRef.current,
        record: p > bestAtStart && p > 0,
      });
      setPhase('end');
      recordBlitz(p, answeredRef.current);
    },
    [bestAtStart, recordBlitz],
  );

  // Countdown (Interval; Abschluss über Guard → StrictMode-sicher)
  useEffect(() => {
    if (phase !== 'running') return;
    const t = window.setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n - startAt >= DURATION_MS) finish(roundId);
    }, 100);
    return () => window.clearInterval(t);
  }, [phase, startAt, roundId, finish]);

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    [],
  );

  const answer = useCallback(
    (chosen: number | boolean) => {
      if (phase !== 'running' || !shown || flash) return;
      const ok = chosen === shown.q.correct;
      answeredRef.current += 1;
      setAnswered(answeredRef.current);
      if (ok) {
        pointsRef.current += 1;
        setPoints(pointsRef.current);
      }
      setFlash({ ok, chosen });
      flashTimer.current = window.setTimeout(() => {
        setFlash(null);
        drawNext();
      }, FLASH_MS);
    },
    [phase, shown, flash, drawNext],
  );

  // Tastaturkürzel: R/F bzw. ←/→ für Wahr/Falsch, 1–4 für Optionen
  useEffect(() => {
    if (phase !== 'running' || !shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (shown.q.kind === 'truefalse') {
        if (e.key === 'r' || e.key === 'R' || e.key === 'ArrowLeft') answer(true);
        else if (e.key === 'f' || e.key === 'F' || e.key === 'ArrowRight') answer(false);
      } else {
        const n = Number(e.key);
        if (n >= 1 && n <= shown.order.length) answer(shown.order[n - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, shown, answer]);

  /* ---------------- Kein Pool ---------------- */
  if (usable.length === 0) {
    return (
      <Card className={s.card}>
        <p className={s.lead}>Für die Blitzrunde stehen aktuell keine passenden Fragen zur Verfügung.</p>
        {onExit && (
          <Button variant="secondary" icon="arrowLeft" onClick={onExit}>
            Zurück
          </Button>
        )}
      </Card>
    );
  }

  /* ---------------- Start ---------------- */
  if (phase === 'start') {
    return (
      <Card className={cx(s.card, s.startCard)}>
        <span className={s.bolt} aria-hidden>
          <Icon name="zap" size={32} />
        </span>
        <div className={s.kicker}>Blitzrunde</div>
        <h2 className={s.title}>60 Sekunden. Wie viel weißt du?</h2>
        <ul className={s.rules}>
          <li>
            <Icon name="clock" size={18} />
            <span>60 Sekunden Zeit – beantworte so viele Fragen wie möglich.</span>
          </li>
          <li>
            <Icon name="check" size={18} />
            <span>+1 Punkt pro richtiger Antwort, keine Minuspunkte.</span>
          </li>
          <li>
            <Icon name="swords" size={18} />
            <span>Duell gegen deinen Rekord: {state.blitz.best > 0 ? `${state.blitz.best} Punkte` : 'noch keiner – setze die erste Marke!'}</span>
          </li>
          <li>
            <Icon name="hand" size={18} />
            <span>
              Tastatur: <kbd>R</kbd>/<kbd>F</kbd> für Richtig/Falsch, <kbd>1</kbd>–<kbd>4</kbd> für Antworten.
            </span>
          </li>
        </ul>
        <div className={s.actions}>
          <Button size="lg" variant="accent" icon="play" onClick={start}>
            Los geht’s
          </Button>
          {onExit && (
            <Button size="lg" variant="ghost" onClick={onExit}>
              Zurück
            </Button>
          )}
        </div>
      </Card>
    );
  }

  /* ---------------- Ende ---------------- */
  if (phase === 'end' && result) {
    const best = Math.max(state.blitz.best, result.points);
    return (
      <div ref={rootRef} className={s.anchor}>
        <Card className={cx(s.card, s.endCard)} role="status" aria-live="polite">
          <div className={s.endScore}>
            {result.record && <Burst />}
            <span className={s.endPoints}>{result.points}</span>
            <span className={s.endLabel}>{result.points === 1 ? 'Punkt' : 'Punkte'}</span>
          </div>
          {result.record ? (
            <div className={s.record}>
              <Icon name="trophy" size={18} /> Neuer Rekord!
            </div>
          ) : (
            <p className={s.lead}>
              {bestAtStart > 0 && result.points === bestAtStart
                ? 'Rekord eingestellt – beim nächsten Mal knackst du ihn!'
                : bestAtStart > 0
                  ? `Noch ${bestAtStart - result.points + 1} ${bestAtStart - result.points + 1 === 1 ? 'Punkt' : 'Punkte'} bis zum neuen Rekord.`
                  : 'Gute erste Runde!'}
            </p>
          )}
          <dl className={s.endStats}>
            <div>
              <dt>Beantwortet</dt>
              <dd>{result.answered}</dd>
            </div>
            <div>
              <dt>Trefferquote</dt>
              <dd>{result.answered ? Math.round((result.points / result.answered) * 100) : 0} %</dd>
            </div>
            <div>
              <dt>Dein Rekord</dt>
              <dd>{best}</dd>
            </div>
          </dl>
          <div className={s.actions}>
            <Button size="lg" variant="accent" icon="refresh" onClick={start}>
              Nochmal
            </Button>
            {onExit && (
              <Button size="lg" variant="secondary" onClick={onExit}>
                Fertig
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  /* ---------------- Laufende Runde ---------------- */
  const elapsed = Math.min(DURATION_MS, Math.max(0, now - startAt));
  const remaining = DURATION_MS - elapsed;
  const secs = Math.ceil(remaining / 1000);
  const ghost = bestAtStart * (elapsed / DURATION_MS);
  const scaleMax = Math.max(bestAtStart, points, 5);
  const R = 34;
  const C = 2 * Math.PI * R;
  const urgent = secs <= 10;

  return (
    <div ref={rootRef} className={s.anchor}>
      <Card className={cx(s.card, s.runCard)}>
        <div className={s.hud}>
          <div className={cx(s.timer, urgent && s.urgent)} role="timer" aria-label={`${secs} Sekunden verbleibend`}>
            <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
              <circle cx="42" cy="42" r={R} className={s.timerTrack} />
              <circle cx="42" cy="42" r={R} className={s.timerFill} strokeDasharray={C} strokeDashoffset={C * (1 - remaining / DURATION_MS)} />
            </svg>
            <span className={s.timerNum} aria-hidden>
              {secs}
            </span>
          </div>
          <div className={s.race} aria-label={`Du: ${points} Punkte. Rekord-Tempo: ${Math.floor(ghost)} Punkte.`} role="group">
            <div className={s.lane}>
              <span className={s.laneLabel}>Du</span>
              <div className={s.track}>
                <div className={s.fillYou} style={{ width: `${(points / scaleMax) * 100}%` }} />
              </div>
              <span className={s.laneVal}>{points}</span>
            </div>
            <div className={s.lane}>
              <span className={s.laneLabel}>Dein Rekord</span>
              <div className={s.track}>
                {bestAtStart > 0 ? <div className={s.fillGhost} style={{ width: `${(ghost / scaleMax) * 100}%` }} /> : null}
              </div>
              <span className={s.laneVal}>{bestAtStart > 0 ? bestAtStart : '–'}</span>
            </div>
            <div className={s.raceNote}>
              {answered} beantwortet
              {bestAtStart > 0 && (points >= ghost ? ' · du liegst vor deinem Rekord-Tempo' : ' · hinter dem Rekord-Tempo')}
            </div>
          </div>
        </div>

        {shown && (
          <div key={qn} ref={qAreaRef} className={cx(s.qArea, flash && (flash.ok ? s.flashOk : s.flashBad))}>
            <p className={s.prompt} id="blitz-prompt">
              <InlineMd text={shown.q.prompt} />
            </p>
            {shown.q.kind === 'truefalse' ? (
              <div className={s.tf} role="group" aria-labelledby="blitz-prompt">
                {[true, false].map((v) => {
                  const isRight = shown.q.kind === 'truefalse' && shown.q.correct === v;
                  const st = flash ? (flash.chosen === v ? (flash.ok ? s.ok : s.bad) : isRight ? s.reveal : undefined) : undefined;
                  return (
                    <button key={String(v)} type="button" className={cx(s.tfBtn, st)} onClick={() => answer(v)} aria-disabled={!!flash || undefined}>
                      <Icon name={v ? 'check' : 'x'} size={22} strokeWidth={2.4} />
                      {v ? 'Richtig' : 'Falsch'}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={s.opts} role="group" aria-labelledby="blitz-prompt">
                {shown.order.map((orig, i) => {
                  const isRight = shown.q.kind === 'single' && shown.q.correct === orig;
                  const st = flash ? (flash.chosen === orig ? (flash.ok ? s.ok : s.bad) : isRight ? s.reveal : undefined) : undefined;
                  return (
                    <button key={orig} type="button" className={cx(s.opt, st)} onClick={() => answer(orig)} aria-disabled={!!flash || undefined}>
                      <span className={s.key} aria-hidden>
                        {i + 1}
                      </span>
                      <span>
                        <InlineMd text={shown.q.kind === 'single' ? shown.q.options[orig] : ''} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className={s.flashMsg} role="status" aria-live="assertive">
              {flash && (
                <span className={flash.ok ? s.msgOk : s.msgBad}>
                  <Icon name={flash.ok ? 'check' : 'x'} size={18} strokeWidth={2.4} />
                  {flash.ok ? '+1 Richtig' : 'Falsch'}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
