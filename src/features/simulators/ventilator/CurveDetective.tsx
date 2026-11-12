/**
 * Kurvendetektiv ('vent-curve-detective'): Muster in Beatmungskurven erkennen.
 * Kurven werden aus dem Modell erzeugt; die Referenz (lungengesund) wird blass
 * zum Vergleich gezeigt.
 */
import { useMemo, useState } from 'react';
import { Button, Chip, Icon, ProgressBar, cx } from '@/components/ui';
import { useProgress } from '@/state/progress';
import { fmt, simulateSteady } from './model';
import { CURVE_CASES, type CurveCase, type CurveOption } from './curveCases';
import { StaticWaveforms } from './StaticWaveforms';
import s from './CurveDetective.module.css';

const ROUNDS = 7;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  c: CurveCase;
  options: CurveOption[];
}

function makeRounds(): Round[] {
  return shuffle(CURVE_CASES)
    .slice(0, ROUNDS)
    .map((c) => ({ c, options: shuffle(c.options) }));
}

function RoundView({ round, index, total, onAnswered, answered }: { round: Round; index: number; total: number; answered: string | null; onAnswered: (id: string) => void }) {
  const [showRef, setShowRef] = useState(true);
  const { c } = round;
  const data = useMemo(() => {
    const main = simulateSteady(c.settings, c.patient, 3);
    const ref = simulateSteady(c.refSettings, c.refPatient, 3);
    return { main, ref };
  }, [c]);
  const m = data.main.last;
  const r = data.ref.last;
  const chosen = round.options.find((o) => o.id === answered);
  const correct = round.options.find((o) => o.correct);

  return (
    <div className={s.round}>
      <div className={s.roundHead}>
        <Chip tone="primary" icon="search">
          Fall {index + 1} von {total}
        </Chip>
        <span className={s.context}>{c.context}</span>
      </div>
      <h3 className={s.question}>{c.question}</h3>

      <StaticWaveforms
        samples={data.main.samples}
        reference={showRef ? data.ref.samples : undefined}
        ariaLabel={`Beatmungskurven des Falls: Spitzendruck ${fmt(m.ppeak_cmH2O, 1)} cmH₂O, exspiratorisches Volumen ${fmt(m.vte_ml)} ml. Referenz: Spitzendruck ${fmt(r.ppeak_cmH2O, 1)} cmH₂O, Volumen ${fmt(r.vte_ml)} ml.`}
      />

      <div className={s.valuesRow}>
        <dl className={s.values}>
          <div>
            <dt>
              P<sub>peak</sub>
            </dt>
            <dd>
              {fmt(m.ppeak_cmH2O, 1)} <span>({fmt(r.ppeak_cmH2O, 1)})</span>
            </dd>
          </div>
          {m.pplatMeasured && (
            <div>
              <dt>
                P<sub>plat</sub>
              </dt>
              <dd>
                {fmt(m.pplat_cmH2O, 1)} <span>({fmt(r.pplat_cmH2O, 1)})</span>
              </dd>
            </div>
          )}
          <div>
            <dt>
              VT<sub>i</sub>
            </dt>
            <dd>
              {fmt(m.vti_ml)} <span>({fmt(r.vti_ml)})</span>
            </dd>
          </div>
          <div>
            <dt>
              VT<sub>e</sub>
            </dt>
            <dd>
              {fmt(m.vte_ml)} <span>({fmt(r.vte_ml)})</span>
            </dd>
          </div>
        </dl>
        <label className={s.refToggle}>
          <input type="checkbox" checked={showRef} onChange={(e) => setShowRef(e.target.checked)} />
          Referenz einblenden
        </label>
      </div>
      <p className={s.valuesNote}>Werte in cmH₂O bzw. ml · in Klammern: Referenz (lungengesund, gleiche Einstellungen)</p>

      <div className={s.options} role="group" aria-label="Antwortmöglichkeiten">
        {round.options.map((o, i) => {
          const state = answered ? (o.correct ? 'correct' : o.id === answered ? 'wrong' : 'idle') : 'idle';
          return (
            <button
              key={o.id}
              type="button"
              className={cx(s.option, state === 'correct' && s.optCorrect, state === 'wrong' && s.optWrong)}
              disabled={!!answered}
              aria-pressed={answered === o.id}
              onClick={() => onAnswered(o.id)}
            >
              <span className={s.optKey}>{String.fromCharCode(65 + i)}</span>
              <span className={s.optText}>{o.text}</span>
              {state === 'correct' && <Icon name="check" size={18} />}
              {state === 'wrong' && <Icon name="x" size={18} />}
            </button>
          );
        })}
      </div>

      {answered && chosen && correct && (
        <div className={cx(s.feedback, chosen.correct ? s.fbOk : s.fbBad)} role="status">
          <div className={s.fbTitle}>
            <Icon name={chosen.correct ? 'check' : 'info'} size={18} />
            {chosen.correct ? 'Richtig erkannt!' : 'Nicht ganz.'}
          </div>
          {!chosen.correct && <p>{chosen.why}</p>}
          <p>
            <strong>{correct.text}:</strong> {correct.why}
          </p>
          <p className={s.takeaway}>
            <Icon name="lightbulb" size={16} /> {c.takeaway}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CurveDetective() {
  const { recordGame } = useProgress();
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [rounds, setRounds] = useState<Round[]>(() => makeRounds());
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);

  const answered = answers[idx] ?? null;
  const score = rounds.reduce((n, r, i) => n + (r.options.find((o) => o.id === answers[i])?.correct ? 1 : 0), 0);

  const start = () => {
    setRounds(makeRounds());
    setAnswers([]);
    setIdx(0);
    setPhase('play');
  };

  const answer = (id: string) => {
    setAnswers((a) => {
      const n = [...a];
      n[idx] = id;
      return n;
    });
  };

  const next = () => {
    if (idx + 1 < rounds.length) setIdx(idx + 1);
    else {
      setPhase('done');
      recordGame('vent-curve-detective', score / rounds.length, 'Kurvendetektiv');
    }
  };

  if (phase === 'intro') {
    return (
      <div className={s.wrap}>
        <div className={s.intro}>
          <span className={s.introIcon}>
            <Icon name="search" size={28} />
          </span>
          <div>
            <h3 className={s.h3}>Kurvendetektiv</h3>
            <p className={s.lead}>
              {ROUNDS} Fälle, je eine Beatmungssituation: Druck-, Flow- und Volumenkurve zeigen ein typisches Muster. Die blasse, gestrichelte Kurve ist die Referenz eines lungengesunden Patienten mit
              denselben Einstellungen. Erkennst du, was los ist?
            </p>
            <ul className={s.tips}>
              <li>Druck: Steigt nur P<sub>peak</sub> oder auch P<sub>plat</sub>?</li>
              <li>Flow: Erreicht der exspiratorische Flow die Nulllinie?</li>
              <li>Volumen: Kehrt die Kurve zur Nulllinie zurück?</li>
            </ul>
            <Button icon="play" onClick={start}>
              Ermittlung starten
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const pct = score / rounds.length;
    return (
      <div className={s.wrap}>
        <div className={s.result}>
          <span className={cx(s.introIcon, pct >= 0.7 && s.iconGold)}>
            <Icon name={pct >= 0.7 ? 'trophy' : 'target'} size={28} />
          </span>
          <h3 className={s.h3}>
            {score} von {rounds.length} Fällen gelöst
          </h3>
          <ProgressBar value={pct} label={`Ergebnis ${Math.round(pct * 100)} %`} className={s.resultBar} />
          <p className={s.lead}>
            {pct === 1
              ? 'Hervorragend – du liest Beatmungskurven wie ein Profi.'
              : pct >= 0.7
                ? 'Starke Leistung! Schau dir die verpassten Muster noch einmal an.'
                : 'Ein guter Anfang. Wiederhole die Merksätze und versuche es erneut – Kurvenlesen ist Übungssache.'}
          </p>
          <ul className={s.summary}>
            {rounds.map((r, i) => {
              const ok = r.options.find((o) => o.id === answers[i])?.correct;
              return (
                <li key={r.c.id} className={ok ? s.sumOk : s.sumBad}>
                  <Icon name={ok ? 'check' : 'x'} size={14} />
                  <span>{r.c.takeaway}</span>
                </li>
              );
            })}
          </ul>
          <Button icon="refresh" onClick={start}>
            Neue Runde
          </Button>
        </div>
      </div>
    );
  }

  const round = rounds[idx];
  return (
    <div className={s.wrap}>
      <div className={s.progressRow}>
        <ProgressBar value={(idx + (answered ? 1 : 0)) / rounds.length} label="Fortschritt Kurvendetektiv" />
        <span className={s.scoreChip}>
          <Icon name="star" size={14} /> {score}
        </span>
      </div>
      <RoundView key={round.c.id + idx} round={round} index={idx} total={rounds.length} answered={answered} onAnswered={answer} />
      {answered && (
        <div className={s.nextRow}>
          <Button iconRight={idx + 1 < rounds.length ? 'arrowRight' : 'trophy'} onClick={next} autoFocus>
            {idx + 1 < rounds.length ? 'Nächster Fall' : 'Auswertung'}
          </Button>
        </div>
      )}
    </div>
  );
}
