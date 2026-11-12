/**
 * Fehlersuche: Einstellungen/Befunde als Monitor-Kacheln; fehlerhafte markieren.
 * Score = (TP + TN) / n  – jede Kachel zählt gleich: korrekt markierte Fehler
 * (TP) und korrekt unmarkierte, unauffällige Einträge (TN).
 */
import { useRef, useState } from 'react';
import type { FaultFinderGame } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, Icon, cx } from '@/components/ui';
import { InlineMd, Markdown } from '@/components/blocks/Markdown';
import { GameFrame, MetaPill, ResultPanel, scoreMessage } from './GameShell';
import s from './FaultFinderView.module.css';

type Verdict = 'tp' | 'tn' | 'fp' | 'fn';

const VERDICT: Record<Verdict, { label: string; icon: 'check' | 'x' | 'alert' }> = {
  tp: { label: 'Fehler erkannt', icon: 'check' },
  tn: { label: 'Korrekt als unauffällig erkannt', icon: 'check' },
  fp: { label: 'Fälschlich markiert', icon: 'x' },
  fn: { label: 'Fehler übersehen', icon: 'alert' },
};

export function FaultFinderView({ game }: { game: FaultFinderGame }) {
  const { recordGame } = useProgress();
  const [flagged, setFlagged] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [roundNo, setRoundNo] = useState(0);
  const recordedRounds = useRef(new Set<number>());
  const n = game.items.length;

  const verdictOf = (id: string, isFault: boolean): Verdict => {
    const f = flagged.includes(id);
    return f ? (isFault ? 'tp' : 'fp') : isFault ? 'fn' : 'tn';
  };

  const counts = game.items.reduce(
    (acc, it) => {
      acc[verdictOf(it.id, it.isFault)]++;
      return acc;
    },
    { tp: 0, tn: 0, fp: 0, fn: 0 } as Record<Verdict, number>,
  );
  const score = n ? (counts.tp + counts.tn) / n : 0;
  const faults = game.items.filter((i) => i.isFault).length;

  const toggle = (id: string) => {
    if (checked) return;
    setFlagged((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  // Prüfen erst nach mindestens einer Markierung (verhindert Leer-Durchläufe)
  const canCheck = flagged.length > 0 || faults === 0;

  const check = () => {
    if (checked || !canCheck) return;
    setChecked(true);
    if (!recordedRounds.current.has(roundNo)) {
      recordedRounds.current.add(roundNo);
      recordGame(game.id, score, game.title);
    }
  };

  const restart = () => {
    setFlagged([]);
    setChecked(false);
    setRoundNo((r) => r + 1);
  };

  return (
    <GameFrame
      kind="Fehlersuche"
      icon="search"
      title={game.title}
      meta={
        <MetaPill icon="alert" label={`${flagged.length} als fehlerhaft markiert`} tone={flagged.length ? 'danger' : undefined}>
          {flagged.length} markiert
        </MetaPill>
      }
    >
      <div className={s.scenario}>
        <Icon name="stethoscope" size={18} />
        <Markdown md={game.scenario} />
      </div>
      <p className={s.hint}>
        {checked ? 'Auswertung: Jede Kachel zeigt, ob deine Einschätzung stimmt.' : 'Markiere alle Einträge, die fehlerhaft oder gefährlich sind. Erneut antippen hebt die Markierung auf.'}
      </p>

      <ul className={s.grid}>
        {game.items.map((it) => {
          const f = flagged.includes(it.id);
          const v = verdictOf(it.id, it.isFault);
          const good = v === 'tp' || v === 'tn';
          return (
            <li key={it.id} className={s.cell}>
              <button
                type="button"
                className={cx(s.tile, f && s.flagged, checked && (good ? s.good : s.badTile))}
                aria-pressed={f}
                aria-disabled={checked || undefined}
                onClick={() => toggle(it.id)}
              >
                <span className={s.tileTop}>
                  <span className={s.label}>
                    <InlineMd text={it.label} />
                  </span>
                  <span className={s.flag} aria-hidden>
                    <Icon name={f ? 'alert' : 'check'} size={14} strokeWidth={2.4} />
                  </span>
                </span>
                <span className={s.value}>
                  <InlineMd text={it.value} />
                </span>
                <span className="visually-hidden">{f ? ', als fehlerhaft markiert' : ''}</span>
              </button>
              {checked && (
                <div className={cx(s.verdict, good ? s.vGood : s.vBad)}>
                  <span className={s.vHead}>
                    <Icon name={VERDICT[v].icon} size={15} strokeWidth={2.4} />
                    {VERDICT[v].label}
                    {it.isFault ? <span className={s.tag}>Fehler</span> : <span className={cx(s.tag, s.tagOk)}>in Ordnung</span>}
                  </span>
                  <Markdown md={it.explanation} className={s.vText} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {!checked ? (
        <div className={s.footer}>
          {!canCheck && (
            <span id={`${game.id}-check-hint`} className={s.checkHint}>
              Markiere zuerst mindestens einen Eintrag.
            </span>
          )}
          <Button icon="search" onClick={check} disabled={!canCheck} aria-describedby={!canCheck ? `${game.id}-check-hint` : undefined}>
            Prüfen
          </Button>
        </div>
      ) : (
        <div className={s.end}>
          <ResultPanel
            score={score}
            heading={`${counts.tp + counts.tn} von ${n} richtig eingeschätzt`}
            message={scoreMessage(score)}
            stats={[
              { label: 'Fehler erkannt', value: `${counts.tp} / ${faults}` },
              { label: 'Übersehen', value: counts.fn },
              { label: 'Fehlalarme', value: counts.fp },
            ]}
            actions={
              <Button variant="secondary" icon="refresh" onClick={restart}>
                Nochmal
              </Button>
            }
          />
        </div>
      )}
    </GameFrame>
  );
}
