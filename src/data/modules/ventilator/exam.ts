import type { Exam, Question } from '@/types/content';

// PLATZHALTER – wird durch die inhaltliche Ausarbeitung ersetzt.
const pool: Question[] = [
  { id: 'vent-x-placeholder', kind: 'truefalse', prompt: 'PEEP steht für positiven endexspiratorischen Druck.', correct: true, explanation: 'Positive End-Expiratory Pressure.', topic: 'Parameter', difficulty: 1 },
];

export const ventilatorExam: Exam = { questionCount: 1, passScore: 0.8, pool, xp: 150 };
export const ventilatorPracticePool: Question[] = pool;
