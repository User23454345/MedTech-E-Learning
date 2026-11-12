/**
 * Abschlusstest eines Moduls: Startbildschirm → Prüfung ohne Feedback →
 * Auswertung (siehe ExamResultView).
 *
 * Ziehung: `exam.questionCount` Fragen themen-ausgewogen per Seed je Versuch.
 * `recordExam` (und bei Bestehen `completeLesson`) werden genau einmal pro
 * Versuch im Klick-Handler „Abgeben“ aufgerufen (Ref-Guard über den Seed).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DeviceModule, Exam } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, Card, Icon, cx } from '@/components/ui';
import { QuestionView } from './QuestionView';
import { ExamResultView, type ExamOutcome } from './ExamResultView';
import { drawBalanced, isAnswered, isCorrect, topicScores, type Answer, type PreparedQuestion } from './quizLogic';
import { newSeed } from './random';
import s from './Exam.module.css';

type Phase = 'start' | 'running' | 'result';

export function ExamRunner({ module }: { module: DeviceModule }) {
  const exam = module.exam;
  if (!exam || exam.pool.length === 0) {
    return (
      <Card className={s.empty}>
        <Icon name="info" size={22} />
        <p>Für dieses Modul ist noch kein Abschlusstest verfügbar.</p>
      </Card>
    );
  }
  return <ExamFlow module={module} exam={exam} />;
}

function ExamFlow({ module, exam }: { module: DeviceModule; exam: Exam }) {
  const { state, recordExam, completeLesson } = useProgress();
  const prev = state.exams[module.id];
  const examLesson = module.lessons.find((l) => l.kind === 'pruefung');

  const [phase, setPhase] = useState<Phase>('start');
  const [seed, setSeed] = useState<number | null>(null);
  const items = useMemo<PreparedQuestion[]>(() => (seed === null ? [] : drawBalanced(exam.pool, exam.questionCount, seed)), [seed, exam]);
  const [answers, setAnswers] = useState<(Answer | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [outcome, setOutcome] = useState<ExamOutcome | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const submittedSeeds = useRef(new Set<number>());
  const rootRef = useRef<HTMLDivElement>(null);

  const count = Math.min(exam.questionCount, exam.pool.length);
  const topics = useMemo(() => [...new Set(exam.pool.map((q) => q.topic))], [exam]);

  const begin = () => {
    setSeed(newSeed());
    setAnswers(Array.from({ length: count }, () => null));
    setIndex(0);
    setOutcome(null);
    setConfirmOpen(false);
    setStartedAt(Date.now());
    setPhase('running');
  };

  // Beim Phasenwechsel an den Anfang des Tests scrollen
  useEffect(() => {
    if (phase !== 'start') {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      rootRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }, [phase]);

  const answeredCount = answers.filter(isAnswered).length;
  const unanswered = count - answeredCount;

  const submit = () => {
    if (seed === null || submittedSeeds.current.has(seed)) return;
    submittedSeeds.current.add(seed);
    const correctCount = items.reduce((acc, it, i) => acc + (isCorrect(it.question, answers[i]) ? 1 : 0), 0);
    const score = items.length ? correctCount / items.length : 0;
    const passed = score >= exam.passScore;
    const ts = topicScores(items, answers);
    const wasPassedBefore = !!prev?.passed;
    const prevBest = prev?.bestScore ?? 0;
    recordExam(module.id, score, passed, correctCount, ts, exam.xp);
    if (passed && examLesson) completeLesson(module.id, examLesson.id, examLesson.xp, examLesson.title || 'Abschlusstest');
    setOutcome({
      items,
      answers: answers.slice(),
      correctCount,
      score,
      passed,
      topicScores: ts,
      firstPass: passed && !wasPassedBefore,
      newBest: score > prevBest,
      durationMs: Date.now() - startedAt,
    });
    setConfirmOpen(false);
    setPhase('result');
  };

  const requestSubmit = () => (unanswered > 0 ? setConfirmOpen(true) : submit());

  /* ---------------- Start ---------------- */
  if (phase === 'start') {
    return (
      <div ref={rootRef} className={s.anchor}>
        <Card className={s.start}>
          <div className={s.startHero}>
            <span className={s.startIcon} aria-hidden>
              <Icon name="award" size={30} />
            </span>
            <div>
              <div className={s.eyebrow}>Abschlusstest</div>
              <h2 className={s.startTitle}>{module.title}</h2>
              <p className={s.startLead}>
                Zeige, was du gelernt hast. Während des Tests gibt es keine Rückmeldung – die ausführliche Auswertung mit Erklärungen
                erhältst du nach der Abgabe.
              </p>
            </div>
          </div>
          <dl className={s.facts}>
            <div className={s.fact}>
              <dt>Fragen</dt>
              <dd>{count}</dd>
            </div>
            <div className={s.fact}>
              <dt>Bestehensgrenze</dt>
              <dd>{Math.round(exam.passScore * 100)} %</dd>
            </div>
            <div className={s.fact}>
              <dt>Themen</dt>
              <dd>{topics.length}</dd>
            </div>
            <div className={s.fact}>
              <dt>Bonus bei Bestehen</dt>
              <dd>+{exam.xp} XP</dd>
            </div>
          </dl>
          {prev ? (
            <div className={s.prev}>
              <Icon name={prev.passed ? 'award' : 'chart'} size={18} />
              <span>
                Bisher {prev.attempts} {prev.attempts === 1 ? 'Versuch' : 'Versuche'} · Bestwert {Math.round(prev.bestScore * 100)} % · letzter Versuch{' '}
                {Math.round(prev.lastScore * 100)} %{prev.passed && ' · bestanden'}
              </span>
            </div>
          ) : (
            <div className={s.prev}>
              <Icon name="sparkles" size={18} />
              <span>Dein erster Versuch – viel Erfolg!</span>
            </div>
          )}
          <ul className={s.rules}>
            <li>Die Fragen werden bei jedem Versuch neu und ausgewogen über alle Themen gezogen.</li>
            <li>Du kannst frei zwischen den Fragen wechseln und Antworten bis zur Abgabe ändern.</li>
            <li>Zahlenwerte dürfen mit Komma oder Punkt als Dezimaltrennzeichen eingegeben werden (ohne Tausenderpunkt).</li>
          </ul>
          <Button size="lg" icon="play" onClick={begin}>
            Test starten
          </Button>
        </Card>
      </div>
    );
  }

  /* ---------------- Ergebnis ---------------- */
  if (phase === 'result' && outcome) {
    return (
      <div ref={rootRef} className={s.anchor}>
        <ExamResultView module={module} exam={exam} outcome={outcome} onRetry={begin} />
      </div>
    );
  }

  /* ---------------- Laufender Test ---------------- */
  const cur = items[index];
  if (!cur) return null;
  return (
    <div ref={rootRef} className={cx(s.anchor, s.runner)}>
      <Card className={s.runCard}>
        <div className={s.runHead}>
          <div>
            <div className={s.eyebrow}>Abschlusstest · {module.shortTitle}</div>
            <div className={s.runCount}>
              Frage {index + 1} <span className={s.muted}>von {count}</span>
            </div>
          </div>
          <div className={s.runProgress} aria-label={`${answeredCount} von ${count} beantwortet`}>
            <div className={s.runBar}>
              <div className={s.runFill} style={{ width: `${(answeredCount / count) * 100}%` }} />
            </div>
            <span>
              {answeredCount}/{count} beantwortet
            </span>
          </div>
        </div>

        <div key={`${seed}-${index}`} className={s.qSlide}>
          <QuestionView
            question={cur.question}
            order={cur.order}
            answer={answers[index] ?? null}
            mode="exam"
            onAnswer={(a) => setAnswers((prevA) => prevA.map((x, i) => (i === index ? a : x)))}
            autoFocus
          />
        </div>

        <div className={s.nav}>
          <Button variant="secondary" icon="chevronLeft" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
            Zurück
          </Button>
          {index < count - 1 ? (
            <Button iconRight="chevronRight" onClick={() => setIndex((i) => Math.min(count - 1, i + 1))}>
              Weiter
            </Button>
          ) : (
            <Button variant="accent" icon="check" onClick={requestSubmit}>
              Abgeben
            </Button>
          )}
        </div>
      </Card>

      <Card compact className={s.overview}>
        <h3 className={s.ovTitle}>Übersicht</h3>
        <div className={s.grid} role="list">
          {items.map((it, i) => {
            const done = isAnswered(answers[i]);
            return (
              <div role="listitem" key={it.question.id}>
                <button
                  type="button"
                  className={cx(s.cell, done && s.cellDone, i === index && s.cellCur)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`Frage ${i + 1}, ${done ? 'beantwortet' : 'offen'}`}
                  onClick={() => setIndex(i)}
                >
                  {i + 1}
                </button>
              </div>
            );
          })}
        </div>
        <div className={s.legend} aria-hidden>
          <span>
            <i className={cx(s.lg, s.cellDone)} /> beantwortet
          </span>
          <span>
            <i className={s.lg} /> offen
          </span>
        </div>
        <Button block variant={unanswered === 0 ? 'accent' : 'secondary'} icon="check" onClick={requestSubmit}>
          Abgeben
        </Button>
      </Card>

      {confirmOpen && (
        <div className={s.backdrop} onClick={() => setConfirmOpen(false)}>
          <ConfirmDialog unanswered={unanswered} onCancel={() => setConfirmOpen(false)} onConfirm={submit} />
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({ unanswered, onCancel, onConfirm }: { unanswered: number; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => prevFocus?.focus?.();
  }, []);
  return (
    <div
      className={s.dialog}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exam-confirm-title"
      aria-describedby="exam-confirm-desc"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
        if (e.key === 'Tab') {
          // Fokus im Dialog halten
          e.preventDefault();
          (document.activeElement === cancelRef.current ? confirmRef : cancelRef).current?.focus();
        }
      }}
    >
      <span className={s.dialogIcon} aria-hidden>
        <Icon name="alert" size={24} />
      </span>
      <h3 id="exam-confirm-title">Test wirklich abgeben?</h3>
      <p id="exam-confirm-desc">
        {unanswered === 1 ? 'Eine Frage ist' : `${unanswered} Fragen sind`} noch unbeantwortet. Unbeantwortete Fragen werden als falsch gewertet.
      </p>
      <div className={s.dialogActions}>
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          Weiter bearbeiten
        </Button>
        <Button ref={confirmRef} variant="accent" onClick={onConfirm}>
          Trotzdem abgeben
        </Button>
      </div>
    </div>
  );
}
