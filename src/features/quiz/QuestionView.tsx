/**
 * Generische Darstellung einer Frage (single / multiple / truefalse / numeric).
 *
 * Modi:
 *  - "quiz":   sofortiges Feedback. Single/Wahr-Falsch werden per Klick
 *              abgegeben, Multiple/Numerisch über „Antwort prüfen“.
 *  - "exam":   keine Rückmeldung; jede Änderung wird über `onAnswer` gemeldet.
 *  - "review": schreibgeschützt mit Feedback (Prüfungsauswertung).
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Question } from '@/types/content';
import { Markdown, InlineMd } from '@/components/blocks/Markdown';
import { Button, Icon, cx } from '@/components/ui';
import { OPTION_LETTERS, correctAnswerText, isAnswered, isCorrect, parseNumber, type Answer } from './quizLogic';
import s from './QuestionView.module.css';

export type QuestionMode = 'quiz' | 'exam' | 'review';

export interface QuestionViewProps {
  question: Question;
  /** Anzeige-Reihenfolge der Optionen (Original-Indizes). Default: Originalreihenfolge. */
  order?: number[];
  answer: Answer | null;
  onAnswer?: (a: Answer) => void;
  mode: QuestionMode;
  /** z. B. "Frage 3 von 10" – wird über dem Prompt angezeigt */
  label?: string;
  /** Überschrift-Ebene des Prompts für saubere Dokumentstruktur */
  headingLevel?: 'h4' | 'h5' | 'p';
  autoFocus?: boolean;
  /** Prompt nur für Screenreader (wenn er bereits außerhalb sichtbar ist) */
  hidePrompt?: boolean;
}

const DIFF_LABEL = ['', 'Basis', 'Mittel', 'Anspruchsvoll'] as const;

const NUM_ERROR = 'Bitte eine Zahl eingeben – Komma oder Punkt als Dezimaltrennzeichen, ohne Tausenderpunkt (z. B. 1000 oder 6,5).';

/** Mini-Markdown-Einheit (cmH~2~O) als Klartext für Screenreader-Labels. */
const plainUnit = (u: string) => u.replace(/[~^]/g, '');

export function QuestionView({ question: q, order, answer, onAnswer, mode, label, headingLevel = 'h4', autoFocus, hidePrompt }: QuestionViewProps) {
  const uid = useId();
  const promptId = `${uid}-prompt`;
  const fbId = `${uid}-fb`;
  const opts = q.kind === 'single' || q.kind === 'multiple' ? q.options : [];
  const displayOrder = order && order.length === opts.length ? order : opts.map((_, i) => i);

  const submitted = mode === 'review' || (mode === 'quiz' && answer !== null);
  const reveal = submitted;
  const locked = mode === 'review' || (mode === 'quiz' && answer !== null);
  const correct = reveal && isCorrect(q, answer);

  // Entwurfszustand im Quiz-Modus für Multiple & Numerisch
  const [draftMulti, setDraftMulti] = useState<number[]>([]);
  const [draftNum, setDraftNum] = useState('');
  const [numError, setNumError] = useState<string | null>(null);
  useEffect(() => {
    setDraftMulti([]);
    setDraftNum('');
    setNumError(null);
  }, [q.id]);

  const promptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoFocus) promptRef.current?.focus({ preventScroll: false });
  }, [autoFocus, q.id]);

  const emit = (a: Answer) => {
    if (locked || !onAnswer) return;
    onAnswer(a);
  };

  /*
   * Single/Wahr-Falsch: Im Prüfungs- und Review-Modus echtes Radio-Muster
   * (roving tabindex, Pfeiltasten wählen aus). Im Quiz-Modus würde Auswählen
   * sofort abgeben – dort daher eine Gruppe normaler Buttons.
   */
  const radioPattern = mode !== 'quiz';

  /* ---------- Pfeiltasten-Navigation in Optionslisten ---------- */
  const onListKey = (e: KeyboardEvent<HTMLDivElement>, selectOnMove = false) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-opt]'));
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    let n = i;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % btns.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') n = 0;
    else n = btns.length - 1;
    btns[n]?.focus();
    if (selectOnMove && mode === 'exam') btns[n]?.click();
  };

  const Prompt = headingLevel;

  /* ---------- Optionsstatus für Feedback ---------- */
  const optState = (orig: number): 'correct' | 'wrong' | 'missed' | 'selected' | 'idle' | 'dim' => {
    const selected =
      q.kind === 'single'
        ? answer?.kind === 'single' && answer.index === orig
        : q.kind === 'multiple'
          ? (answer?.kind === 'multiple' ? answer.indices : mode === 'quiz' ? draftMulti : []).includes(orig)
          : false;
    if (!reveal) return selected ? 'selected' : 'idle';
    const isRight = q.kind === 'single' ? q.correct === orig : q.kind === 'multiple' ? q.correct.includes(orig) : false;
    if (selected && isRight) return 'correct';
    if (selected && !isRight) return 'wrong';
    if (!selected && isRight) return 'missed';
    return 'dim';
  };

  const stateIcon = (st: ReturnType<typeof optState>) =>
    st === 'correct' || st === 'missed' ? <Icon name="check" size={18} strokeWidth={2.4} /> : st === 'wrong' ? <Icon name="x" size={18} strokeWidth={2.4} /> : null;

  const stateText = (st: ReturnType<typeof optState>) =>
    st === 'correct' ? ' – deine Wahl, richtig' : st === 'wrong' ? ' – deine Wahl, falsch' : st === 'missed' ? ' – richtige Antwort' : '';

  const renderChoice = () => {
    const multi = q.kind === 'multiple';
    const radio = !multi && radioPattern;
    const checkedOrig = q.kind === 'single' && answer?.kind === 'single' ? answer.index : null;
    const tabStop = checkedOrig !== null && displayOrder.includes(checkedOrig) ? checkedOrig : displayOrder[0];
    return (
      <div
        className={s.options}
        role={multi ? 'group' : radio ? 'radiogroup' : 'group'}
        aria-labelledby={promptId}
        aria-describedby={reveal ? fbId : undefined}
        onKeyDown={(e) => onListKey(e, radio)}
      >
        {displayOrder.map((orig, pos) => {
          const st = optState(orig);
          const checked = st === 'selected' || st === 'correct' || st === 'wrong';
          return (
            <button
              key={orig}
              type="button"
              data-opt
              role={multi ? 'checkbox' : radio ? 'radio' : undefined}
              aria-checked={multi || radio ? checked : undefined}
              aria-pressed={!multi && !radio ? checked : undefined}
              tabIndex={radio ? (orig === tabStop ? 0 : -1) : undefined}
              aria-disabled={locked || undefined}
              className={cx(s.option, s[`opt-${st}`], multi && s.optMulti)}
              onClick={() => {
                if (locked) return;
                if (q.kind === 'single') emit({ kind: 'single', index: orig });
                else if (mode === 'quiz') setDraftMulti((d) => (d.includes(orig) ? d.filter((x) => x !== orig) : [...d, orig]));
                else {
                  const cur = answer?.kind === 'multiple' ? answer.indices : [];
                  emit({ kind: 'multiple', indices: cur.includes(orig) ? cur.filter((x) => x !== orig) : [...cur, orig] });
                }
              }}
            >
              <span className={s.marker} aria-hidden>
                {stateIcon(st) ?? (multi ? checked ? <Icon name="check" size={16} strokeWidth={2.6} /> : null : OPTION_LETTERS[pos])}
              </span>
              <span className={s.optText}>
                <InlineMd text={opts[orig]} />
                <span className="visually-hidden">{stateText(st)}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderTrueFalse = () => {
    if (q.kind !== 'truefalse') return null;
    const chosen = answer?.kind === 'truefalse' ? answer.value : null;
    return (
      <div className={s.tf} role={radioPattern ? 'radiogroup' : 'group'} aria-labelledby={promptId} onKeyDown={(e) => onListKey(e, radioPattern)}>
        {[true, false].map((v) => {
          const sel = chosen === v;
          let st: 'idle' | 'selected' | 'correct' | 'wrong' | 'missed' | 'dim' = sel ? 'selected' : 'idle';
          if (reveal) st = sel ? (v === q.correct ? 'correct' : 'wrong') : v === q.correct ? 'missed' : 'dim';
          return (
            <button
              key={String(v)}
              type="button"
              data-opt
              role={radioPattern ? 'radio' : undefined}
              aria-checked={radioPattern ? sel : undefined}
              aria-pressed={radioPattern ? undefined : sel}
              tabIndex={radioPattern ? (sel || (chosen === null && v) ? 0 : -1) : undefined}
              aria-disabled={locked || undefined}
              className={cx(s.tfBtn, s[`opt-${st}`])}
              onClick={() => emit({ kind: 'truefalse', value: v })}
            >
              <span className={s.tfIcon} aria-hidden>
                <Icon name={v ? 'check' : 'x'} size={22} strokeWidth={2.4} />
              </span>
              {v ? 'Richtig' : 'Falsch'}
              <span className="visually-hidden">{stateText(st)}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderNumeric = () => {
    if (q.kind !== 'numeric') return null;
    const value = mode === 'quiz' && !answer ? draftNum : answer?.kind === 'numeric' ? answer.raw : '';
    // Prüfungsmodus: Inline-Validierung während der Eingabe
    const examInvalid = mode === 'exam' && value.trim().length > 0 && parseNumber(value) === null;
    const errText = numError ?? (examInvalid ? NUM_ERROR : null);
    const submitNum = () => {
      if (parseNumber(draftNum) === null) {
        setNumError(NUM_ERROR);
        return;
      }
      setNumError(null);
      emit({ kind: 'numeric', raw: draftNum });
    };
    return (
      <div className={s.numeric}>
        <form
          className={cx(s.numRow, reveal && (correct ? s.numOk : s.numBad))}
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === 'quiz') submitNum();
          }}
        >
          <label className="visually-hidden" htmlFor={`${uid}-num`}>
            Antwort in {plainUnit(q.unit)}
          </label>
          <input
            id={`${uid}-num`}
            className={s.numInput}
            inputMode="decimal"
            autoComplete="off"
            placeholder="Wert"
            value={value}
            readOnly={locked}
            aria-invalid={errText ? true : undefined}
            aria-describedby={errText ? `${uid}-numerr` : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              if (mode === 'quiz') {
                setDraftNum(raw);
                if (numError) setNumError(null);
              } else emit({ kind: 'numeric', raw });
            }}
          />
          <span className={s.unit}>
            <InlineMd text={q.unit} />
          </span>
          {reveal && (
            <span className={s.numIcon} aria-hidden>
              <Icon name={correct ? 'check' : 'x'} size={18} strokeWidth={2.4} />
            </span>
          )}
          {mode === 'quiz' && !answer && (
            <Button type="submit" size="md" disabled={!draftNum.trim()}>
              Antwort prüfen
            </Button>
          )}
        </form>
        {errText && (
          <p id={`${uid}-numerr`} className={s.numError} role={mode === 'quiz' ? 'alert' : undefined} aria-live={mode === 'exam' ? 'polite' : undefined}>
            {errText}
            {mode === 'exam' && ' Ungültige Eingaben werden als „nicht beantwortet“ gewertet.'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={s.question} data-kind={q.kind}>
      <div ref={promptRef} tabIndex={-1} className={s.promptWrap}>
        {!hidePrompt && (
          <div className={s.qMeta}>
            {label && <span>{label}</span>}
            {q.kind === 'multiple' && <span className={s.hint}>Mehrere Antworten möglich</span>}
            {q.kind === 'numeric' && <span className={s.hint}>Zahlenwert eingeben</span>}
            <span className={s.diff} title={`Schwierigkeit: ${DIFF_LABEL[q.difficulty]}`}>
              <span className="visually-hidden">Schwierigkeit: {DIFF_LABEL[q.difficulty]}</span>
              {[1, 2, 3].map((d) => (
                <span key={d} aria-hidden className={cx(s.diffDot, d <= q.difficulty && s.diffOn)} />
              ))}
            </span>
          </div>
        )}
        <Prompt id={promptId} className={cx(s.prompt, hidePrompt && 'visually-hidden')}>
          <InlineMd text={q.prompt} />
        </Prompt>
      </div>

      {(q.kind === 'single' || q.kind === 'multiple') && renderChoice()}
      {renderTrueFalse()}
      {renderNumeric()}

      {mode === 'quiz' && q.kind === 'multiple' && !answer && (
        <div className={s.checkRow}>
          <Button onClick={() => emit({ kind: 'multiple', indices: draftMulti })} disabled={draftMulti.length === 0} icon="check">
            Antwort prüfen
          </Button>
        </div>
      )}

      {reveal && (
        <div id={fbId} className={cx(s.feedback, correct ? s.fbOk : s.fbBad)} role={mode === 'quiz' ? 'status' : undefined} aria-live={mode === 'quiz' ? 'polite' : undefined}>
          <div className={s.fbHead}>
            <span className={s.fbIcon} aria-hidden>
              <Icon name={correct ? 'check' : isAnswered(answer) ? 'x' : 'alert'} size={18} strokeWidth={2.4} />
            </span>
            <strong>{correct ? 'Richtig!' : isAnswered(answer) ? 'Leider nicht richtig.' : 'Nicht beantwortet.'}</strong>
          </div>
          {!correct && (
            <p className={s.fbCorrect}>
              Richtige Antwort: <InlineMd text={correctAnswerText(q)} />
            </p>
          )}
          <Markdown md={q.explanation} className={s.fbText} />
        </div>
      )}
    </div>
  );
}
