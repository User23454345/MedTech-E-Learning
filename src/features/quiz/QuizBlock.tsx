/**
 * Quiz-Block innerhalb einer Lektion: Fragen nacheinander mit sofortigem
 * Feedback, Fortschrittspunkten und Mini-Auswertung.
 *
 * XP: `recordAnswer` wird nur beim ERSTEN Versuch je Frage und Mount
 * aufgerufen (Ref-Set), damit „Nochmal“ kein XP-Farming erlaubt.
 */
import { useMemo, useRef, useState } from 'react';
import type { Question } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, cx } from '@/components/ui';
import { GameFrame, ResultPanel, scoreMessage } from '@/features/games/GameShell';
import { QuestionView } from './QuestionView';
import { isCorrect, prepareAll, type Answer } from './quizLogic';
import s from './QuizBlock.module.css';

export function QuizBlock({ title, questions, contextId }: { title?: string; questions: Question[]; contextId: string }) {
  const { recordAnswer } = useProgress();
  const [round, setRound] = useState(0);
  // Optionen je Durchgang neu mischen (round als Abhängigkeit)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const prepared = useMemo(() => prepareAll(questions), [questions, round]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(Answer | null)[]>(() => questions.map(() => null));
  const [done, setDone] = useState(false);
  const recorded = useRef(new Set<string>());

  if (questions.length === 0) return null;

  const n = prepared.length;
  const cur = prepared[Math.min(index, n - 1)];
  const curAnswer = answers[index] ?? null;
  const correctCount = prepared.reduce((acc, p, i) => acc + (isCorrect(p.question, answers[i]) ? 1 : 0), 0);

  const handleAnswer = (a: Answer) => {
    if (answers[index]) return;
    const ok = isCorrect(cur.question, a);
    setAnswers((prev) => prev.map((x, i) => (i === index ? a : x)));
    const key = `${contextId}::${cur.question.id}`;
    if (!recorded.current.has(key)) {
      recorded.current.add(key);
      recordAnswer(ok);
    }
  };

  const next = () => {
    if (index < n - 1) setIndex(index + 1);
    else setDone(true);
  };

  const restart = () => {
    setRound((r) => r + 1);
    setAnswers(questions.map(() => null));
    setIndex(0);
    setDone(false);
  };

  const score = correctCount / n;

  return (
    <GameFrame
      kind="Wissenscheck"
      icon="target"
      title={title ?? 'Teste dein Wissen'}
      meta={
        <div className={s.dots} aria-hidden>
          {prepared.map((p, i) => {
            const a = answers[i];
            return (
              <span
                key={p.question.id + i}
                className={cx(s.dot, a ? (isCorrect(p.question, a) ? s.dotOk : s.dotBad) : i === index && !done ? s.dotCur : undefined)}
              />
            );
          })}
        </div>
      }
    >
      {done ? (
        <ResultPanel
          score={score}
          heading={`${correctCount} von ${n} richtig`}
          message={scoreMessage(score)}
          actions={
            <Button variant="secondary" icon="shuffle" onClick={restart}>
              Nochmal
            </Button>
          }
        />
      ) : (
        <div key={`${round}-${index}`} className={s.slide}>
          <QuestionView
            question={cur.question}
            order={cur.order}
            answer={curAnswer}
            onAnswer={handleAnswer}
            mode="quiz"
            label={`Frage ${index + 1} von ${n}`}
            autoFocus={index > 0 || round > 0}
          />
          {curAnswer && (
            <div className={s.footer}>
              <Button onClick={next} iconRight={index < n - 1 ? 'arrowRight' : 'check'} autoFocus>
                {index < n - 1 ? 'Nächste Frage' : 'Auswertung'}
              </Button>
            </div>
          )}
        </div>
      )}
    </GameFrame>
  );
}
