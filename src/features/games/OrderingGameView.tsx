/**
 * Reihenfolge-Spiel: Schritte per Pfeil-Buttons oder Drag & Drop sortieren.
 * Bis zu drei Prüfversuche; danach wird die korrekte Reihenfolge gezeigt.
 *
 * Score:
 *  - gelöst im 1./2./3. Versuch → 100 % / 70 % / 40 %
 *  - nicht gelöst → 30 % × Anteil richtiger Positionen im letzten Versuch
 */
import { useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { OrderingGame } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, Icon, cx } from '@/components/ui';
import { InlineMd, Markdown } from '@/components/blocks/Markdown';
import { shuffleNotIdentity } from '@/features/quiz/random';
import { GameFrame, GripIcon, MetaPill, ResultPanel, scoreMessage } from './GameShell';
import s from './OrderingGameView.module.css';

const MAX_ATTEMPTS = 3;
const SOLVED_SCORE = [1, 0.7, 0.4];

export function OrderingGameView({ game }: { game: OrderingGame }) {
  const { recordGame } = useProgress();
  const correctIds = game.steps.map((st) => st.id);
  const byId = new Map(game.steps.map((st) => [st.id, st]));
  const n = correctIds.length;

  const [roundNo, setRoundNo] = useState(0);
  const [order, setOrder] = useState<string[]>(() => shuffleNotIdentity(correctIds));
  const [attempts, setAttempts] = useState(0);
  const [marks, setMarks] = useState<boolean[] | null>(null);
  const [result, setResult] = useState<{ solved: boolean; score: number; correctPositions: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [moved, setMoved] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');
  const recordedRounds = useRef(new Set<number>());
  const listRef = useRef<HTMLOListElement>(null);

  const finished = result !== null;

  const move = (from: number, to: number) => {
    if (finished || to < 0 || to >= n || from === to) return;
    setOrder((o) => {
      const next = o.slice();
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
    setMoved(order[from]);
    setMarks(null);
    setAnnounce(`Schritt auf Position ${to + 1} verschoben.`);
  };

  const check = () => {
    if (finished) return;
    const m = order.map((id, i) => id === correctIds[i]);
    const correctPositions = m.filter(Boolean).length;
    const att = attempts + 1;
    setAttempts(att);
    setMarks(m);
    const solved = correctPositions === n;
    if (solved || att >= MAX_ATTEMPTS) {
      const score = solved ? SOLVED_SCORE[att - 1] ?? 0.4 : 0.3 * (correctPositions / n);
      setResult({ solved, score, correctPositions });
      if (!recordedRounds.current.has(roundNo)) {
        recordedRounds.current.add(roundNo);
        recordGame(game.id, score, game.title);
      }
      setAnnounce(solved ? 'Richtig! Die Reihenfolge stimmt.' : 'Keine Versuche mehr. Die richtige Reihenfolge wird angezeigt.');
    } else {
      setAnnounce(`${correctPositions} von ${n} Schritten an der richtigen Position. Noch ${MAX_ATTEMPTS - att} Versuche.`);
    }
  };

  const restart = () => {
    setRoundNo((r) => r + 1);
    setOrder(shuffleNotIdentity(correctIds));
    setAttempts(0);
    setMarks(null);
    setResult(null);
    setMoved(null);
    setAnnounce('Neue Runde gestartet.');
  };

  /* ---------- Drag & Drop (Pointer Events am Griff) ---------- */
  const onGripDown = (e: RPointerEvent<HTMLSpanElement>, id: string) => {
    if (finished || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragId(id);
  };
  const onGripMove = (e: RPointerEvent<HTMLSpanElement>) => {
    if (!dragId || !listRef.current) return;
    const items = Array.from(listRef.current.querySelectorAll<HTMLElement>('[data-step-id]'));
    const from = order.indexOf(dragId);
    let to = from;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (i < from && e.clientY < mid) to = Math.min(to, i);
      if (i > from && e.clientY > mid) to = Math.max(to, i);
    });
    if (to !== from) move(from, to);
  };
  const onGripUp = () => setDragId(null);

  const score = result?.score ?? 0;
  const remaining = MAX_ATTEMPTS - attempts;

  return (
    <GameFrame
      kind="Reihenfolge"
      icon="sliders"
      title={game.title}
      meta={
        <MetaPill icon="target" label={`${remaining} von ${MAX_ATTEMPTS} Versuchen übrig`} tone={remaining <= 1 && !finished ? 'danger' : undefined}>
          {finished ? `${attempts}/${MAX_ATTEMPTS}` : `Versuch ${Math.min(attempts + 1, MAX_ATTEMPTS)}/${MAX_ATTEMPTS}`}
        </MetaPill>
      }
    >
      <Markdown md={game.instructions} className={s.instr} />

      <ol ref={listRef} className={s.list} aria-label="Schritte in aktueller Reihenfolge">
        {order.map((id, i) => {
          const mark = marks?.[i];
          return (
            <li
              key={`${roundNo}-${id}`}
              data-step-id={id}
              className={cx(
                s.item,
                mark === true && s.ok,
                mark === false && s.bad,
                dragId === id && s.dragging,
                moved === id && !marks && s.moved,
              )}
            >
              <span
                className={cx(s.grip, finished && s.gripOff)}
                aria-hidden
                onPointerDown={(e) => onGripDown(e, id)}
                onPointerMove={onGripMove}
                onPointerUp={onGripUp}
                onPointerCancel={onGripUp}
              >
                <GripIcon />
              </span>
              <span className={s.pos}>{i + 1}</span>
              <span className={s.text}>
                <InlineMd text={byId.get(id)?.text ?? ''} />
              </span>
              {mark !== undefined && (
                <span className={s.mark}>
                  <Icon name={mark ? 'check' : 'x'} size={16} strokeWidth={2.6} />
                  <span className="visually-hidden">{mark ? 'richtige Position' : 'falsche Position'}</span>
                </span>
              )}
              {!finished && (
                <span className={s.arrows}>
                  <button
                    type="button"
                    className={s.arrow}
                    aria-label={`Schritt ${i + 1} nach oben`}
                    aria-disabled={i === 0 || undefined}
                    onClick={() => move(i, i - 1)}
                  >
                    <Icon name="chevronDown" size={18} className={s.up} />
                  </button>
                  <button
                    type="button"
                    className={s.arrow}
                    aria-label={`Schritt ${i + 1} nach unten`}
                    aria-disabled={i === n - 1 || undefined}
                    onClick={() => move(i, i + 1)}
                  >
                    <Icon name="chevronDown" size={18} />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </div>

      {!finished && (
        <div className={s.footer}>
          {marks && (
            <span className={s.feedback}>
              <Icon name="info" size={16} /> {marks.filter(Boolean).length} von {n} richtig platziert · noch {remaining}{' '}
              {remaining === 1 ? 'Versuch' : 'Versuche'}
            </span>
          )}
          <Button icon="check" onClick={check}>
            Reihenfolge prüfen
          </Button>
        </div>
      )}

      {finished && result && (
        <div className={s.end}>
          {!result.solved && (
            <div className={s.solution}>
              <h4 className={s.solTitle}>Richtige Reihenfolge</h4>
              <ol className={s.solList}>
                {game.steps.map((st) => (
                  <li key={st.id}>
                    <InlineMd text={st.text} />
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className={s.explain}>
            <Icon name="lightbulb" size={18} />
            <Markdown md={game.explanation} />
          </div>
          <ResultPanel
            score={score}
            heading={result.solved ? `Gelöst im ${attempts}. Versuch` : 'Nicht ganz – sieh dir die Lösung an'}
            message={scoreMessage(score)}
            stats={[
              { label: 'Versuche', value: `${attempts} / ${MAX_ATTEMPTS}` },
              { label: 'Richtig platziert', value: `${result.correctPositions} / ${n}` },
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
