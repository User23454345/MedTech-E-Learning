import { describe, expect, it } from 'vitest';
import { BADGES, dailyTasksFor, gameXp, initialState, isModuleMastered, lessonKey, todayISO, type BadgeContext, type ProgressState } from './gamification';

describe('dailyTasksFor', () => {
  it('liefert für jeden Tag 2026–2035 drei definierte, verschiedene Aufgaben', () => {
    const d = new Date(2026, 0, 1);
    const end = new Date(2036, 0, 1);
    while (d < end) {
      const tasks = dailyTasksFor(todayISO(d));
      expect(tasks).toHaveLength(3);
      for (const t of tasks) {
        expect(t).toBeDefined();
        expect(typeof t.id).toBe('string');
      }
      expect(new Set(tasks.map((t) => t.id)).size).toBe(3);
      d.setDate(d.getDate() + 1);
    }
  });
});

describe('gameXp', () => {
  it('vergibt beim ersten Spiel mindestens 5 XP', () => {
    expect(gameXp(undefined, 0)).toBe(5);
    expect(gameXp(undefined, 1)).toBe(15);
  });
  it('vergibt bei Wiederholungen nur XP für Verbesserungen', () => {
    const prev = { plays: 1, bestScore: 0.6, lastAt: '' };
    expect(gameXp(prev, 0)).toBe(0);
    expect(gameXp(prev, 0.6)).toBe(0);
    expect(gameXp(prev, 1)).toBe(6);
  });
});

describe('Abzeichen „Modul gemeistert“', () => {
  const ctx: BadgeContext = { modules: [{ id: 'm1', lessonIds: ['a', 'b', 'c'], hasExam: true }] };
  const badge = BADGES.find((b) => b.id === 'module-done')!;
  const withLessons = (ids: [string, string][], s: ProgressState = initialState()): ProgressState => ({
    ...s,
    lessons: Object.fromEntries(ids.map(([m, l]) => [lessonKey(m, l), { completed: true, sectionsSeen: [] }])),
  });

  it('nicht vor bestandenem Abschlusstest', () => {
    const s = withLessons([
      ['m1', 'a'],
      ['m1', 'b'],
      ['m1', 'c'],
    ]);
    expect(isModuleMastered(s, ctx.modules[0])).toBe(false);
    expect(badge.check(s, ctx)).toBe(false);
  });
  it('nicht bei Lektionen aus verschiedenen Modulen', () => {
    const s = withLessons([
      ['m1', 'a'],
      ['m2', 'b'],
      ['m3', 'c'],
      ['m4', 'd'],
      ['m5', 'e'],
    ]);
    expect(badge.check({ ...s, exams: { m1: { attempts: 1, bestScore: 1, lastScore: 1, passed: true, lastAt: '', topicScores: {} } } }, ctx)).toBe(false);
  });
  it('wenn alle Lektionen erledigt und Test bestanden', () => {
    const s = withLessons([
      ['m1', 'a'],
      ['m1', 'b'],
      ['m1', 'c'],
    ]);
    const passed = { ...s, exams: { m1: { attempts: 1, bestScore: 0.8, lastScore: 0.8, passed: true, lastAt: '', topicScores: {} } } };
    expect(badge.check(passed, ctx)).toBe(true);
  });
});
