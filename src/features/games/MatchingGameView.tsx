/**
 * Zuordnungsspiel: Begriff (links) anklicken, dann passende Beschreibung (rechts).
 * Reihenfolge der Auswahl ist egal (rechts → links funktioniert auch).
 * Drag & Drop per Pointer Events als Ergänzung (Maus, Stift, Touch über den Griff).
 *
 * Score = max(0, 1 − Fehler / Paaranzahl)
 *   → fehlerfrei = 100 %, so viele Fehler wie Paare = 0 %.
 */
import { useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import type { MatchingGame } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, Icon, cx } from '@/components/ui';
import { InlineMd, Markdown } from '@/components/blocks/Markdown';
import { shuffle, shuffleNotIdentity } from '@/features/quiz/random';
import { GameFrame, GripIcon, MetaPill, ResultPanel, formatTime, scoreMessage, useElapsed } from './GameShell';
import s from './MatchingGameView.module.css';

interface Round {
  left: string[];
  right: string[];
}

function newRound(ids: string[]): Round {
  const left = shuffle(ids);
  return { left, right: shuffleNotIdentity(left) };
}

interface Drag {
  id: string;
  x: number;
  y: number;
  sx: number;
  sy: number;
  active: boolean;
}

export function MatchingGameView({ game }: { game: MatchingGame }) {
  const { recordGame } = useProgress();
  const ids = game.pairs.map((p) => p.id);
  const byId = new Map(game.pairs.map((p) => [p.id, p]));
  const n = game.pairs.length;

  const [roundNo, setRoundNo] = useState(0);
  const [round, setRound] = useState<Round>(() => newRound(ids));
  const [matched, setMatched] = useState<string[]>([]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<{ l: string; r: string } | null>(null);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hoverRight, setHoverRight] = useState<string | null>(null);
  const recordedRounds = useRef(new Set<number>());
  const suppressClick = useRef(false);
  const wrongTimer = useRef<number | null>(null);

  const elapsed = useElapsed(startAt, endAt);
  const done = matched.length === n && n > 0;
  const score = Math.max(0, 1 - mistakes / Math.max(1, n));

  const ensureStarted = () => {
    if (startAt === null) setStartAt(Date.now());
  };

  const attempt = (l: string, r: string) => {
    if (matched.includes(l) || matched.includes(r)) return;
    if (l === r) {
      const next = [...matched, l];
      setMatched(next);
      setSelLeft(null);
      setSelRight(null);
      setAnnounce(`Richtig: ${byId.get(l)?.left ?? ''} zugeordnet. ${next.length} von ${n}.`);
      if (next.length === n) {
        const end = Date.now();
        setEndAt(end);
        if (!recordedRounds.current.has(roundNo)) {
          recordedRounds.current.add(roundNo);
          recordGame(game.id, Math.max(0, 1 - mistakes / n), game.title);
        }
      }
    } else {
      setMistakes((m) => m + 1);
      setWrong({ l, r });
      setAnnounce('Leider falsch – versuche es noch einmal.');
      if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
      wrongTimer.current = window.setTimeout(() => {
        setWrong(null);
        setSelLeft(null);
        setSelRight(null);
      }, 520);
    }
  };

  const pickLeft = (id: string) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (done || matched.includes(id) || wrong) return;
    ensureStarted();
    if (selRight) attempt(id, selRight);
    else setSelLeft(selLeft === id ? null : id);
  };

  const pickRight = (id: string) => {
    if (done || matched.includes(id) || wrong) return;
    ensureStarted();
    if (selLeft) attempt(selLeft, id);
    else setSelRight(selRight === id ? null : id);
  };

  const restart = () => {
    setRoundNo((r) => r + 1);
    setRound(newRound(ids));
    setMatched([]);
    setSelLeft(null);
    setSelRight(null);
    setMistakes(0);
    setWrong(null);
    setStartAt(null);
    setEndAt(null);
    setAnnounce('Neue Runde gestartet.');
  };

  /* ---------- Drag & Drop (Pointer Events) ---------- */
  const rightUnder = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-right-id]');
    const id = el?.dataset.rightId ?? null;
    return id && !matched.includes(id) ? id : null;
  };

  const onPointerDown = (e: RPointerEvent<HTMLButtonElement>, id: string) => {
    if (done || matched.includes(id) || wrong || e.button !== 0) return;
    // Touch nur über den Griff starten, damit Scrollen möglich bleibt
    if (e.pointerType === 'touch' && !(e.target as HTMLElement).closest('[data-grip]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, active: false });
  };
  const onPointerMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const active = drag.active || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6;
    if (active && !drag.active) ensureStarted();
    setDrag({ ...drag, x: e.clientX, y: e.clientY, active });
    if (active) setHoverRight(rightUnder(e.clientX, e.clientY));
  };
  const onPointerUp = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    if (drag.active) {
      suppressClick.current = true;
      const target = rightUnder(e.clientX, e.clientY);
      if (target) attempt(drag.id, target);
      // Klick-Unterdrückung zurücksetzen, falls kein click-Event folgt
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
    setDrag(null);
    setHoverRight(null);
  };
  const onPointerCancel = () => {
    setDrag(null);
    setHoverRight(null);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setSelLeft(null);
      setSelRight(null);
    }
  };

  const matchNo = (id: string) => matched.indexOf(id) + 1;

  return (
    <GameFrame
      kind="Zuordnen"
      icon="layers"
      title={game.title}
      meta={
        <>
          <MetaPill icon="clock" label={`Zeit ${formatTime(elapsed)}`}>
            {formatTime(elapsed)}
          </MetaPill>
          <MetaPill icon="x" label={`${mistakes} Fehler`} tone={mistakes > 0 ? 'danger' : undefined}>
            {mistakes}
          </MetaPill>
          <MetaPill icon="check" label={`${matched.length} von ${n} Paaren`} tone={done ? 'success' : undefined}>
            {matched.length}/{n}
          </MetaPill>
        </>
      }
    >
      <Markdown md={game.instructions} className={s.instr} />
      <p className={s.hint}>
        <Icon name="hand" size={16} /> Tippe einen Begriff und dann die passende Beschreibung an – oder ziehe den Begriff hinüber.
      </p>

      <div className={s.board} onKeyDown={onKey}>
        <div className={s.col}>
          <h4 className={s.colTitle}>Begriffe</h4>
          <ul className={s.list}>
            {round.left.map((id) => {
              const isM = matched.includes(id);
              const isWrong = wrong?.l === id;
              return (
                <li key={`${roundNo}-${id}`}>
                  <button
                    type="button"
                    className={cx(
                      s.item,
                      s.left,
                      selLeft === id && s.selected,
                      isM && s.matched,
                      isWrong && s.wrong,
                      drag?.active && drag.id === id && s.dragging,
                    )}
                    aria-pressed={selLeft === id}
                    aria-disabled={isM || undefined}
                    onClick={() => pickLeft(id)}
                    onPointerDown={(e) => onPointerDown(e, id)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                  >
                    {!isM && (
                      <span className={s.grip} data-grip aria-hidden>
                        <GripIcon size={16} />
                      </span>
                    )}
                    <span className={s.text}>
                      <InlineMd text={byId.get(id)?.left ?? ''} />
                    </span>
                    {isM && (
                      <span className={s.badge} aria-label={`Paar ${matchNo(id)}`}>
                        {matchNo(id)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={s.col}>
          <h4 className={s.colTitle}>Beschreibungen</h4>
          <ul className={s.list}>
            {round.right.map((id) => {
              const isM = matched.includes(id);
              const isWrong = wrong?.r === id;
              return (
                <li key={`${roundNo}-${id}`}>
                  <button
                    type="button"
                    data-right-id={id}
                    className={cx(s.item, s.right, selRight === id && s.selected, isM && s.matched, isWrong && s.wrong, hoverRight === id && s.dropTarget)}
                    aria-pressed={selRight === id}
                    aria-disabled={isM || undefined}
                    onClick={() => pickRight(id)}
                  >
                    {isM && (
                      <span className={s.badge} aria-label={`Paar ${matchNo(id)}`}>
                        {matchNo(id)}
                      </span>
                    )}
                    <span className={s.text}>
                      <InlineMd text={byId.get(id)?.right ?? ''} />
                    </span>
                    {isM && <Icon name="check" size={18} strokeWidth={2.4} className={s.checkIcon} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {drag?.active && (
        <div className={s.ghost} style={{ left: drag.x, top: drag.y }} aria-hidden>
          <InlineMd text={byId.get(drag.id)?.left ?? ''} />
        </div>
      )}

      <div className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </div>

      {done && (
        <div className={s.end}>
          <ResultPanel
            score={score}
            heading={mistakes === 0 ? 'Alle Paare fehlerfrei zugeordnet!' : 'Alle Paare zugeordnet'}
            message={scoreMessage(score)}
            stats={[
              { label: 'Zeit', value: formatTime(elapsed) },
              { label: 'Fehler', value: mistakes },
              { label: 'Paare', value: n },
            ]}
            actions={
              <Button variant="secondary" icon="shuffle" onClick={restart}>
                Neu mischen &amp; nochmal
              </Button>
            }
          />
        </div>
      )}
    </GameFrame>
  );
}
