import { describe, expect, it } from 'vitest';
import type { Question } from '@/types/content';
import { drawBalanced, isCorrect, parseNumber, prepareQuestion, topicScores } from './quizLogic';
import { createRng, shuffleNotIdentity } from './random';

const base = { explanation: 'x', difficulty: 1 as const };
const pool: Question[] = [
  ...Array.from({ length: 6 }, (_, i): Question => ({ ...base, id: `a${i}`, prompt: 'A', topic: 'A', kind: 'truefalse', correct: true })),
  ...Array.from({ length: 2 }, (_, i): Question => ({ ...base, id: `b${i}`, prompt: 'B', topic: 'B', kind: 'single', options: ['x', 'y', 'z'], correct: 2 })),
  ...Array.from({ length: 4 }, (_, i): Question => ({ ...base, id: `c${i}`, prompt: 'C', topic: 'C', kind: 'numeric', answer: 6, tolerance: 0.5, unit: 'ml/kg' })),
];

describe('quizLogic', () => {
  it('parst Komma- und Punktzahlen', () => {
    expect(parseNumber('6,5')).toBe(6.5);
    expect(parseNumber(' 7.25 ')).toBe(7.25);
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('')).toBeNull();
  });
  it('prüft numerische Toleranz', () => {
    const q = pool[8];
    expect(isCorrect(q, { kind: 'numeric', raw: '6,5' })).toBe(true);
    expect(isCorrect(q, { kind: 'numeric', raw: '6,6' })).toBe(false);
  });
  it('Optionsmischung verändert die Lösungszuordnung nicht', () => {
    const q = pool[6];
    const p = prepareQuestion(q, createRng(3));
    expect([...p.order].sort()).toEqual([0, 1, 2]);
    expect(isCorrect(q, { kind: 'single', index: 2 })).toBe(true);
  });
  it('zieht themen-ausgewogen und deterministisch', () => {
    const a = drawBalanced(pool, 6, 42);
    const b = drawBalanced(pool, 6, 42);
    expect(a.map((x) => x.question.id)).toEqual(b.map((x) => x.question.id));
    const ts = topicScores(a, a.map(() => null));
    expect(ts.A[1]).toBe(2);
    expect(ts.B[1]).toBe(2);
    expect(ts.C[1]).toBe(2);
    expect(new Set(a.map((x) => x.question.id)).size).toBe(6);
    expect(drawBalanced(pool, 50, 1)).toHaveLength(pool.length);
  });
  it('shuffleNotIdentity liefert nie die Ausgangsreihenfolge', () => {
    for (let i = 0; i < 50; i++) expect(shuffleNotIdentity(['a', 'b'])).toEqual(['b', 'a']);
  });
});
