/**
 * Praxisfall: Ausgangslage + Vitalwerte, dann Entscheidungsschritte.
 * Pro Schritt muss die richtige Option gefunden werden, um weiterzukommen.
 *
 * Score je Schritt = 1 − Fehlversuche / Anzahl falscher Optionen (min. 0);
 * Gesamt-Score = Mittelwert aller Schritte.
 */
import { useRef, useState } from 'react';
import type { ClinicalCase } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, Icon, cx } from '@/components/ui';
import { InlineMd, Markdown } from '@/components/blocks/Markdown';
import { shuffledIndices } from '@/features/quiz/random';
import { GameFrame, MetaPill, ResultPanel, scoreMessage } from './GameShell';
import s from './CaseRunner.module.css';

const STATUS = {
  ok: { label: 'im Normbereich', icon: 'check' },
  warn: { label: 'auffällig', icon: 'alert' },
  alarm: { label: 'kritisch', icon: 'bell' },
} as const;

function makeOrders(data: ClinicalCase): number[][] {
  return data.steps.map((st) => shuffledIndices(st.options.length));
}

export function CaseRunner({ data }: { data: ClinicalCase }) {
  const { recordGame } = useProgress();
  const total = data.steps.length;
  const [roundNo, setRoundNo] = useState(0);
  const [orders, setOrders] = useState<number[][]>(() => makeOrders(data));
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<number[][]>(() => data.steps.map(() => []));
  const [solved, setSolved] = useState<(number | null)[]>(() => data.steps.map(() => null));
  const [showDebrief, setShowDebrief] = useState(false);
  const [lastPick, setLastPick] = useState<number | null>(null);
  const recordedRounds = useRef(new Set<number>());
  const nextBtn = useRef<HTMLButtonElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);

  const stepScore = (i: number) => {
    const wrongOpts = Math.max(1, data.steps[i].options.filter((o) => !o.correct).length);
    return Math.max(0, 1 - wrong[i].length / wrongOpts);
  };
  const scoreWith = (w: number[][]) =>
    total
      ? w.reduce((acc, picks, i) => acc + Math.max(0, 1 - picks.length / Math.max(1, data.steps[i].options.filter((o) => !o.correct).length)), 0) / total
      : 0;
  const totalScore = scoreWith(wrong);
  const totalWrong = wrong.reduce((a, w) => a + w.length, 0);

  const cur = data.steps[step];
  const curSolved = solved[step] !== null;
  const allSolved = solved.every((x) => x !== null);

  const pick = (opt: number) => {
    if (!cur || curSolved || wrong[step].includes(opt)) return;
    setLastPick(opt);
    if (cur.options[opt].correct) {
      const nextSolved = solved.map((x, i) => (i === step ? opt : x));
      setSolved(nextSolved);
      if (nextSolved.every((x) => x !== null) && !recordedRounds.current.has(roundNo)) {
        recordedRounds.current.add(roundNo);
        recordGame(data.id, scoreWith(wrong), data.title);
      }
      window.setTimeout(() => nextBtn.current?.focus({ preventScroll: true }), 0);
    } else {
      setWrong((w) => w.map((x, i) => (i === step ? [...x, opt] : x)));
    }
  };

  const advance = () => {
    setLastPick(null);
    if (step < total - 1) {
      setStep(step + 1);
      window.setTimeout(() => stepHeading.current?.focus(), 0);
    } else setShowDebrief(true);
  };

  const restart = () => {
    setRoundNo((r) => r + 1);
    setOrders(makeOrders(data));
    setStep(0);
    setWrong(data.steps.map(() => []));
    setSolved(data.steps.map(() => null));
    setShowDebrief(false);
    setLastPick(null);
  };

  const progress = (solved.filter((x) => x !== null).length / Math.max(1, total)) * 100;

  return (
    <GameFrame
      kind="Praxisfall"
      icon="stethoscope"
      title={data.title}
      meta={
        <MetaPill icon="target" label={`Schritt ${Math.min(step + 1, total)} von ${total}`}>
          {showDebrief ? 'Abgeschlossen' : `Schritt ${Math.min(step + 1, total)}/${total}`}
        </MetaPill>
      }
    >
      <div className={s.setting}>
        <Icon name="home" size={16} />
        <span>{data.setting}</span>
      </div>

      <div className={s.presentation}>
        <Markdown md={data.presentation} />
      </div>

      {data.vitals && data.vitals.length > 0 && (
        <ul className={s.vitals} aria-label="Vitalparameter und Messwerte">
          {data.vitals.map((v) => {
            const st = v.status ?? 'ok';
            return (
              <li key={v.label} className={cx(s.vital, s[`v-${st}`])}>
                <span className={s.vLabel}>
                  <InlineMd text={v.label} />
                </span>
                <span className={s.vValue}>
                  <InlineMd text={v.value} />
                </span>
                {v.status && (
                  <span className={s.vStatus}>
                    <Icon name={STATUS[st].icon} size={12} strokeWidth={2.4} />
                    {STATUS[st].label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className={s.progress} aria-hidden>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* bisherige Entscheidungen */}
      {(step > 0 || showDebrief) && (
        <ol className={s.history} aria-label="Bisherige Entscheidungen">
          {data.steps.slice(0, showDebrief ? total : step).map((st, i) => {
            const chosen = solved[i];
            return (
              <li key={i} className={s.histItem}>
                <span className={s.histIcon} aria-hidden>
                  <Icon name="check" size={14} strokeWidth={2.6} />
                </span>
                <div>
                  <div className={s.histPrompt}>
                    <InlineMd text={st.prompt} />
                  </div>
                  {chosen !== null && (
                    <div className={s.histAnswer}>
                      <InlineMd text={st.options[chosen].text} />
                      {wrong[i].length > 0 && (
                        <span className={s.histWrong}>
                          {' '}
                          · {wrong[i].length} {wrong[i].length === 1 ? 'Fehlversuch' : 'Fehlversuche'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {!showDebrief && cur && (
        <div key={`${roundNo}-${step}`} className={s.step}>
          <h4 ref={stepHeading} tabIndex={-1} className={s.stepPrompt}>
            <span className={s.stepNo}>Schritt {step + 1}</span>
            <InlineMd text={cur.prompt} />
          </h4>
          <div className={s.options} role="group" aria-label="Handlungsoptionen">
            {orders[step].map((oi) => {
              const o = cur.options[oi];
              const isWrong = wrong[step].includes(oi);
              const isRight = solved[step] === oi;
              return (
                <div key={oi} className={s.optWrap}>
                  <button
                    type="button"
                    className={cx(s.option, isWrong && s.optWrong, isRight && s.optRight, curSolved && !isRight && s.optDim)}
                    aria-disabled={isWrong || curSolved || undefined}
                    onClick={() => pick(oi)}
                  >
                    <span className={s.optIcon} aria-hidden>
                      {isRight ? <Icon name="check" size={16} strokeWidth={2.6} /> : isWrong ? <Icon name="x" size={16} strokeWidth={2.6} /> : <Icon name="chevronRight" size={16} />}
                    </span>
                    <span className={s.optText}>
                      <InlineMd text={o.text} />
                      {(isWrong || isRight) && <span className="visually-hidden">{isRight ? ' – richtig' : ' – falsch'}</span>}
                    </span>
                  </button>
                  {(isWrong || isRight) && (
                    <div
                      className={cx(s.fb, isRight ? s.fbOk : s.fbBad)}
                      role={lastPick === oi ? 'status' : undefined}
                      aria-live={lastPick === oi ? 'polite' : undefined}
                    >
                      <strong>{isRight ? 'Richtig. ' : 'Nicht die beste Wahl. '}</strong>
                      <InlineMd text={o.feedback} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {curSolved && (
            <div className={s.footer}>
              <span className={s.stepScore}>
                {stepScore(step) >= 0.999 ? 'Auf Anhieb richtig!' : `Schritt gelöst nach ${wrong[step].length} ${wrong[step].length === 1 ? 'Fehlversuch' : 'Fehlversuchen'}`}
              </span>
              <Button ref={nextBtn} onClick={advance} iconRight={step < total - 1 ? 'arrowRight' : 'book'}>
                {step < total - 1 ? 'Weiter' : 'Zur Nachbesprechung'}
              </Button>
            </div>
          )}
        </div>
      )}

      {showDebrief && allSolved && (
        <div className={s.debrief}>
          <div className={s.debriefBox}>
            <h4 className={s.debriefTitle}>
              <Icon name="lightbulb" size={18} /> Nachbesprechung
            </h4>
            <Markdown md={data.debrief} className={s.debriefText} />
          </div>
          <ResultPanel
            score={totalScore}
            heading={totalWrong === 0 ? 'Fall souverän gelöst' : 'Fall gelöst'}
            message={scoreMessage(totalScore)}
            stats={[
              { label: 'Schritte', value: total },
              { label: 'Fehlversuche', value: totalWrong },
            ]}
            actions={
              <Button variant="secondary" icon="refresh" onClick={restart}>
                Fall neu starten
              </Button>
            }
          />
        </div>
      )}
    </GameFrame>
  );
}
