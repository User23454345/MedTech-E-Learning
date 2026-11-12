import { describe, expect, it } from 'vitest';
import type { Block, ClinicalCase, Question } from '@/types/content';
import { WIDGET_KEYS } from '@/features/widgets';
import { ventilatorModule as mod } from './index';

const allBlocks: Block[] = mod.lessons.flatMap((l) => l.sections.flatMap((s) => s.blocks));
const lessonQuestions: Question[] = allBlocks.flatMap((b) => (b.type === 'quiz' ? b.questions : []));
const exam = mod.exam!;
const examPool = exam.pool;
const practicePool = mod.practicePool ?? [];
const allQuestions = [...lessonQuestions, ...examPool, ...practicePool];

function dupes(ids: string[]): string[] {
  const seen = new Set<string>();
  const d = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) d.add(id);
    seen.add(id);
  }
  return [...d];
}

describe('Modul Beatmungsgerät – Inhaltsintegrität', () => {
  it('hat ein Exam', () => {
    expect(mod.exam).toBeDefined();
  });

  it('Frage-IDs sind eindeutig (Lektionen + Prüfungspool)', () => {
    expect(dupes([...lessonQuestions, ...examPool].map((q) => q.id))).toEqual([]);
  });

  it('Übungspool: eigene Zusatz-IDs eindeutig und kollidieren nicht mit Lektionsfragen', () => {
    const examIds = new Set(examPool.map((q) => q.id));
    const extras = practicePool.filter((q) => !examIds.has(q.id));
    expect(dupes(extras.map((q) => q.id))).toEqual([]);
    const lessonIds = new Set(lessonQuestions.map((q) => q.id));
    expect(extras.filter((q) => lessonIds.has(q.id)).map((q) => q.id)).toEqual([]);
    // Fragen aus dem Prüfungspool im Übungspool müssen identisch (gleiches Objekt) sein
    for (const q of practicePool) {
      if (examIds.has(q.id)) expect(examPool.find((e) => e.id === q.id)).toBe(q);
    }
  });

  it('Antwortindizes liegen im gültigen Bereich', () => {
    for (const q of allQuestions) {
      if (q.kind === 'single') {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
        expect(Number.isInteger(q.correct), q.id).toBe(true);
        expect(q.correct, q.id).toBeGreaterThanOrEqual(0);
        expect(q.correct, q.id).toBeLessThan(q.options.length);
      } else if (q.kind === 'multiple') {
        expect(q.correct.length, q.id).toBeGreaterThan(0);
        expect(dupes(q.correct.map(String)), q.id).toEqual([]);
        for (const c of q.correct) {
          expect(c >= 0 && c < q.options.length, `${q.id}: ${c}`).toBe(true);
        }
      } else if (q.kind === 'numeric') {
        expect(Number.isFinite(q.answer), q.id).toBe(true);
        expect(q.tolerance, q.id).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('Prüfungsthemen sind in topicLessons hinterlegt und verweisen auf existierende Lektionen', () => {
    const lessonIds = new Set(mod.lessons.map((l) => l.id));
    for (const q of examPool) {
      expect(Object.keys(exam.topicLessons), `${q.id}: ${q.topic}`).toContain(q.topic);
    }
    for (const [topic, lessonId] of Object.entries(exam.topicLessons)) {
      expect(lessonIds.has(lessonId), `${topic} → ${lessonId}`).toBe(true);
    }
  });

  it('Prüfungspool ist groß genug', () => {
    expect(examPool.length).toBeGreaterThanOrEqual(exam.questionCount);
    expect(exam.passScore).toBeGreaterThan(0);
    expect(exam.passScore).toBeLessThanOrEqual(1);
  });

  it('Quellenverweise existieren', () => {
    const srcIds = new Set(mod.sources.map((s) => s.id));
    expect(dupes(mod.sources.map((s) => s.id))).toEqual([]);
    for (const b of allBlocks) {
      if (b.type !== 'sources') continue;
      for (const id of b.ids) expect(srcIds.has(id), id).toBe(true);
    }
  });

  it('Widget-Schlüssel existieren in der Registry', () => {
    const keys: readonly string[] = WIDGET_KEYS;
    for (const b of allBlocks) {
      if (b.type === 'widget') expect(keys, b.widget).toContain(b.widget);
    }
  });

  it('Lektionen: eindeutige IDs, fortlaufende Nummern, eindeutige Abschnitts-IDs', () => {
    expect(dupes(mod.lessons.map((l) => l.id))).toEqual([]);
    mod.lessons.forEach((l, i) => {
      expect(l.number).toBe(i + 1);
      expect(dupes(l.sections.map((s) => s.id)), l.id).toEqual([]);
    });
    expect(mod.lessons.filter((l) => l.kind === 'pruefung')).toHaveLength(1);
  });

  it('Lernspiele: eindeutige IDs und Mindestumfang', () => {
    const gameIds: string[] = [];
    const cases: ClinicalCase[] = [];
    for (const b of allBlocks) {
      switch (b.type) {
        case 'ordering':
          gameIds.push(b.game.id);
          expect(b.game.steps.length, b.game.id).toBeGreaterThanOrEqual(3);
          expect(dupes(b.game.steps.map((s) => s.id)), b.game.id).toEqual([]);
          break;
        case 'matching':
          gameIds.push(b.game.id);
          expect(b.game.pairs.length, b.game.id).toBeGreaterThanOrEqual(4);
          expect(dupes(b.game.pairs.map((p) => p.id)), b.game.id).toEqual([]);
          break;
        case 'faultFinder':
          gameIds.push(b.game.id);
          expect(b.game.items.some((i) => i.isFault), b.game.id).toBe(true);
          expect(dupes(b.game.items.map((i) => i.id)), b.game.id).toEqual([]);
          break;
        case 'case':
          gameIds.push(b.case.id);
          cases.push(b.case);
          break;
        default:
          break;
      }
    }
    expect(dupes(gameIds)).toEqual([]);
    for (const c of cases) {
      expect(c.steps.length, c.id).toBeGreaterThanOrEqual(1);
      c.steps.forEach((st, i) => {
        expect(st.options.filter((o) => o.correct).length, `${c.id} Schritt ${i + 1}`).toBeGreaterThanOrEqual(1);
      });
    }
  });
});
