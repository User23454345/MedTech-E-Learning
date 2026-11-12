/**
 * Prüfungsmodus des Geräte-Explorers: „Klicke auf: <Komponente>“.
 */
import { useCallback, useState } from 'react';
import { VENT_COMPONENTS, type VentComponentId } from './deviceData';
import type { QuizMark } from './DeviceDiagram';

export const QUIZ_ROUNDS = 8;

export type QuizPhase = 'ask' | 'feedback' | 'done';

export interface QuizState {
  targets: VentComponentId[];
  round: number;
  score: number;
  phase: QuizPhase;
  lastCorrect: boolean | null;
  marks: Partial<Record<VentComponentId, QuizMark>>;
  /** Zähler, damit die Shake-Animation bei erneutem Fehler neu startet */
  attemptKey: number;
}

function pickTargets(): VentComponentId[] {
  const ids = VENT_COMPONENTS.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, QUIZ_ROUNDS);
}

const fresh = (): QuizState => ({
  targets: pickTargets(),
  round: 0,
  score: 0,
  phase: 'ask',
  lastCorrect: null,
  marks: {},
  attemptKey: 0,
});

export function useComponentQuiz(onFinish: (score01: number) => void) {
  const [q, setQ] = useState<QuizState>(fresh);

  const answer = useCallback((id: VentComponentId) => {
    setQ((prev) => {
      if (prev.phase !== 'ask') return prev;
      const target = prev.targets[prev.round];
      const correct = id === target;
      const marks: QuizState['marks'] = correct ? { [id]: 'correct' } : { [id]: 'wrong', [target]: 'reveal' };
      return {
        ...prev,
        phase: 'feedback',
        lastCorrect: correct,
        score: prev.score + (correct ? 1 : 0),
        marks,
        attemptKey: prev.attemptKey + 1,
      };
    });
  }, []);

  // Seiteneffekt (onFinish) bewusst außerhalb des State-Updaters (StrictMode ruft Updater doppelt auf)
  const next = useCallback(() => {
    if (q.phase !== 'feedback') return;
    if (q.round + 1 >= q.targets.length) {
      onFinish(q.score / q.targets.length);
      setQ({ ...q, phase: 'done', marks: {} });
      return;
    }
    setQ({ ...q, round: q.round + 1, phase: 'ask', lastCorrect: null, marks: {} });
  }, [q, onFinish]);

  const restart = useCallback(() => setQ(fresh()), []);

  return { quiz: q, target: q.targets[q.round], answer, next, restart };
}
