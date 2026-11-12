/**
 * Abgeleitete Fortschrittsinformationen pro Modul/Lektion (rein, ohne Seiteneffekte).
 * Wird von Seiten (Start, Katalog, Modul, Lektion, Training) gemeinsam genutzt.
 */
import type { ClinicalCase, DeviceModule, FaultFinderGame, Lesson, LessonKind, MatchingGame, OrderingGame } from '@/types/content';
import { lessonKey, type ProgressState } from '@/lib/gamification';

export const LESSON_KIND_LABEL: Record<LessonKind, string> = {
  grundlagen: 'Grundlagen',
  aufbau: 'Aufbau',
  funktion: 'Funktion',
  bedienung: 'Bedienung',
  training: 'Training',
  pruefung: 'Prüfung',
};

/** Anzahl Lektionen (1..n), die vor dem Abschlusstest erledigt sein müssen. */
export const EXAM_PREREQ_MAX_NUMBER = 4;

export function isLessonDone(state: ProgressState, module: DeviceModule, lesson: Lesson): boolean {
  if (state.lessons[lessonKey(module.id, lesson.id)]?.completed) return true;
  // Prüfungslektion gilt auch als erledigt, sobald der Test bestanden wurde
  return lesson.kind === 'pruefung' && !!state.exams[module.id]?.passed;
}

export interface ModuleProgress {
  completed: number;
  total: number;
  ratio: number;
}

export function moduleProgress(state: ProgressState, module: DeviceModule): ModuleProgress {
  const total = module.lessons.length;
  const completed = module.lessons.filter((l) => isLessonDone(state, module, l)).length;
  return { completed, total, ratio: total ? completed / total : 0 };
}

/** Lektionen, die für den Abschlusstest noch fehlen (leer = freigeschaltet). */
export function missingExamPrereqs(state: ProgressState, module: DeviceModule): Lesson[] {
  return module.lessons.filter((l) => l.kind !== 'pruefung' && l.number <= EXAM_PREREQ_MAX_NUMBER && !isLessonDone(state, module, l));
}

export function isLessonLocked(state: ProgressState, module: DeviceModule, lesson: Lesson): boolean {
  if (lesson.kind !== 'pruefung') return false;
  if (state.exams[module.id]?.attempts) return false;
  return missingExamPrereqs(state, module).length > 0;
}

/** Erste nicht abgeschlossene, freigeschaltete Lektion (oder undefined, wenn alles erledigt). */
export function nextLesson(state: ProgressState, module: DeviceModule): Lesson | undefined {
  return module.lessons.find((l) => !isLessonDone(state, module, l) && !isLessonLocked(state, module, l));
}

export const lessonPath = (moduleId: string, lessonId: string) => `/modul/${moduleId}/lektion/${lessonId}`;

export function formatDuration(min: number): string {
  if (min < 60) return `${min} Min.`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} Std. ${m} Min.` : `${h} Std.`;
}

/* ------------------------------------------------------------------ */
/* Lernspiele aus allen Lektionen sammeln                               */
/* ------------------------------------------------------------------ */

export type GameEntry =
  | { kind: 'matching'; id: string; title: string; game: MatchingGame; module: DeviceModule; lesson: Lesson }
  | { kind: 'ordering'; id: string; title: string; game: OrderingGame; module: DeviceModule; lesson: Lesson }
  | { kind: 'faultFinder'; id: string; title: string; game: FaultFinderGame; module: DeviceModule; lesson: Lesson }
  | { kind: 'case'; id: string; title: string; game: ClinicalCase; module: DeviceModule; lesson: Lesson };

export const GAME_KIND_LABEL: Record<GameEntry['kind'], string> = {
  matching: 'Zuordnen',
  ordering: 'Reihenfolge',
  faultFinder: 'Fehlersuche',
  case: 'Praxisfall',
};

export function collectGames(modules: DeviceModule[]): GameEntry[] {
  const out: GameEntry[] = [];
  const seen = new Set<string>();
  for (const module of modules) {
    for (const lesson of module.lessons) {
      for (const section of lesson.sections) {
        for (const b of section.blocks) {
          let e: GameEntry | null = null;
          if (b.type === 'matching') e = { kind: 'matching', id: b.game.id, title: b.game.title, game: b.game, module, lesson };
          else if (b.type === 'ordering') e = { kind: 'ordering', id: b.game.id, title: b.game.title, game: b.game, module, lesson };
          else if (b.type === 'faultFinder') e = { kind: 'faultFinder', id: b.game.id, title: b.game.title, game: b.game, module, lesson };
          else if (b.type === 'case') e = { kind: 'case', id: b.case.id, title: b.case.title, game: b.case, module, lesson };
          if (e && !seen.has(e.id)) {
            seen.add(e.id);
            out.push(e);
          }
        }
      }
    }
  }
  return out;
}
