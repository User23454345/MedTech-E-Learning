/**
 * Reine (seiteneffektfreie) Gamification-Logik: Level, Abzeichen,
 * Tagesaufgaben, Serien. Wird vom ProgressProvider genutzt und ist
 * separat testbar.
 */
import type { IconName } from '@/components/ui/Icon';

/* ------------------------------------------------------------------ */
/* Zustand                                                              */
/* ------------------------------------------------------------------ */

export interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  /** IDs der bereits angesehenen Abschnitte */
  sectionsSeen: string[];
}

export interface ExamResult {
  attempts: number;
  bestScore: number; // 0..1
  lastScore: number;
  passed: boolean;
  lastAt: string;
  /** Themenauswertung des letzten Versuchs: topic -> [richtig, gesamt] */
  topicScores: Record<string, [number, number]>;
}

export interface GameResult {
  plays: number;
  bestScore: number; // 0..1
  lastAt: string;
}

export interface DailyState {
  date: string; // YYYY-MM-DD
  quizCorrect: number;
  lessons: number;
  games: number;
  xp: number;
  claimed: string[]; // erledigte Tagesaufgaben (IDs), Bonus bereits gutgeschrieben
}

export interface ProgressState {
  version: 1;
  xp: number;
  lessons: Record<string, LessonProgress>; // key = `${moduleId}/${lessonId}`
  exams: Record<string, ExamResult>; // key = moduleId
  games: Record<string, GameResult>; // key = gameId
  answers: { total: number; correct: number };
  badges: Record<string, string>; // badgeId -> earnedAt ISO
  activity: Record<string, number>; // YYYY-MM-DD -> XP an diesem Tag
  recent: { moduleId: string; lessonId: string; at: string }[];
  daily: DailyState;
  simulator: { challengesSolved: string[] };
  blitz: { best: number; plays: number };
  profile: { name: string };
}

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function emptyDaily(date = todayISO()): DailyState {
  return { date, quizCorrect: 0, lessons: 0, games: 0, xp: 0, claimed: [] };
}

export function initialState(): ProgressState {
  return {
    version: 1,
    xp: 0,
    lessons: {},
    exams: {},
    games: {},
    answers: { total: 0, correct: 0 },
    badges: {},
    activity: {},
    recent: [],
    daily: emptyDaily(),
    simulator: { challengesSolved: [] },
    blitz: { best: 0, plays: 0 },
    profile: { name: '' },
  };
}

/* ------------------------------------------------------------------ */
/* Level                                                                */
/* ------------------------------------------------------------------ */

export interface LevelDef {
  level: number;
  minXp: number;
  title: string;
}

/** Bewusst professionelle, nicht verspielte Stufenbezeichnungen. */
export const LEVELS: LevelDef[] = [
  { level: 1, minXp: 0, title: 'Orientierung' },
  { level: 2, minXp: 100, title: 'Grundverständnis' },
  { level: 3, minXp: 250, title: 'Systemverständnis' },
  { level: 4, minXp: 450, title: 'Anwendungssicherheit' },
  { level: 5, minXp: 700, title: 'Fachkompetenz' },
  { level: 6, minXp: 1000, title: 'Vertiefte Expertise' },
  { level: 7, minXp: 1400, title: 'Spezialist:in' },
  { level: 8, minXp: 1900, title: 'Expert:in' },
  { level: 9, minXp: 2500, title: 'Referenz' },
  { level: 10, minXp: 3200, title: 'Mentor:in' },
];

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNext: number | null; // null = Maximalstufe
  progress: number; // 0..1
  nextTitle: string | null;
}

export function levelFor(xp: number): LevelInfo {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].minXp) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  if (!next) {
    return { level: cur.level, title: cur.title, xpIntoLevel: xp - cur.minXp, xpForNext: null, progress: 1, nextTitle: null };
  }
  const span = next.minXp - cur.minXp;
  return {
    level: cur.level,
    title: cur.title,
    xpIntoLevel: xp - cur.minXp,
    xpForNext: span,
    progress: Math.min(1, (xp - cur.minXp) / span),
    nextTitle: next.title,
  };
}

/* ------------------------------------------------------------------ */
/* XP-Regeln (zentral, damit sie konsistent bleiben)                    */
/* ------------------------------------------------------------------ */

export const XP = {
  correctAnswer: 5,
  firstTryBonus: 0, // bewusst 0 – kann später aktiviert werden
  gameBase: 15, // × Score (0..1), mindestens 5
  caseSolved: 25,
  simChallenge: 30,
  examPerCorrect: 4,
  dailyTask: 20,
  blitzPerCorrect: 3,
} as const;

/* ------------------------------------------------------------------ */
/* Serien (Streak)                                                      */
/* ------------------------------------------------------------------ */

export function streakDays(activity: Record<string, number>, today = new Date()): number {
  let streak = 0;
  const d = new Date(today);
  // Heute zählt, wenn aktiv; sonst ab gestern rückwärts (Serie nicht verloren bis Tagesende)
  if (!activity[todayISO(d)]) d.setDate(d.getDate() - 1);
  while (activity[todayISO(d)] && activity[todayISO(d)] > 0) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/* Tagesaufgaben                                                        */
/* ------------------------------------------------------------------ */

export interface DailyTaskDef {
  id: string;
  title: string;
  icon: IconName;
  target: number;
  value: (d: DailyState) => number;
}

const DAILY_POOL: DailyTaskDef[] = [
  { id: 'quiz5', title: '5 Fragen richtig beantworten', icon: 'target', target: 5, value: (d) => d.quizCorrect },
  { id: 'quiz10', title: '10 Fragen richtig beantworten', icon: 'target', target: 10, value: (d) => d.quizCorrect },
  { id: 'lesson1', title: 'Eine Lektion abschließen', icon: 'book', target: 1, value: (d) => d.lessons },
  { id: 'game1', title: 'Ein Lernspiel absolvieren', icon: 'gamepad', target: 1, value: (d) => d.games },
  { id: 'game2', title: 'Zwei Lernspiele absolvieren', icon: 'gamepad', target: 2, value: (d) => d.games },
  { id: 'xp60', title: '60 XP an einem Tag sammeln', icon: 'zap', target: 60, value: (d) => d.xp },
];

/** Drei deterministische Tagesaufgaben je Datum (für alle Nutzer gleich). */
export function dailyTasksFor(date: string): DailyTaskDef[] {
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const quiz = DAILY_POOL.filter((t) => t.id.startsWith('quiz'))[h % 2];
  const act = [DAILY_POOL[2], DAILY_POOL[3], DAILY_POOL[4]][(h >> 3) % 3];
  const xp = DAILY_POOL[5];
  return [quiz, act, xp];
}

/* ------------------------------------------------------------------ */
/* Abzeichen                                                            */
/* ------------------------------------------------------------------ */

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  tier: 'bronze' | 'silber' | 'gold';
  check: (s: ProgressState) => boolean;
}

const completedLessons = (s: ProgressState) => Object.values(s.lessons).filter((l) => l.completed).length;

export const BADGES: BadgeDef[] = [
  { id: 'first-steps', title: 'Erster Schritt', description: 'Die erste Lektion abgeschlossen.', icon: 'book', tier: 'bronze', check: (s) => completedLessons(s) >= 1 },
  { id: 'curious', title: 'Wissbegierig', description: '25 Fragen richtig beantwortet.', icon: 'lightbulb', tier: 'bronze', check: (s) => s.answers.correct >= 25 },
  { id: 'sharp', title: 'Treffsicher', description: '100 Fragen richtig beantwortet.', icon: 'target', tier: 'silber', check: (s) => s.answers.correct >= 100 },
  { id: 'player', title: 'Spielerisch gelernt', description: 'Drei verschiedene Lernspiele absolviert.', icon: 'gamepad', tier: 'bronze', check: (s) => Object.keys(s.games).length >= 3 },
  { id: 'perfectionist', title: 'Fehlerfrei', description: 'Ein Lernspiel mit 100 % abgeschlossen.', icon: 'star', tier: 'silber', check: (s) => Object.values(s.games).some((g) => g.bestScore >= 1) },
  { id: 'simulator', title: 'Am Regler', description: 'Erste Simulator-Mission gelöst.', icon: 'sliders', tier: 'bronze', check: (s) => s.simulator.challengesSolved.length >= 1 },
  { id: 'sim-master', title: 'Beatmungsstratege', description: 'Alle Simulator-Missionen gelöst.', icon: 'lungs', tier: 'gold', check: (s) => s.simulator.challengesSolved.length >= 5 },
  { id: 'module-done', title: 'Modul gemeistert', description: 'Alle Lektionen eines Moduls abgeschlossen.', icon: 'layers', tier: 'silber', check: (s) => completedLessons(s) >= 5 },
  { id: 'exam-pass', title: 'Zertifiziert', description: 'Einen Abschlusstest bestanden.', icon: 'award', tier: 'gold', check: (s) => Object.values(s.exams).some((e) => e.passed) },
  { id: 'exam-perfect', title: 'Bestnote', description: 'Einen Abschlusstest mit 100 % bestanden.', icon: 'trophy', tier: 'gold', check: (s) => Object.values(s.exams).some((e) => e.bestScore >= 1) },
  { id: 'streak3', title: 'Dranbleiben', description: 'An 3 Tagen in Folge gelernt.', icon: 'flame', tier: 'bronze', check: (s) => streakDays(s.activity) >= 3 },
  { id: 'streak7', title: 'Lernroutine', description: 'An 7 Tagen in Folge gelernt.', icon: 'flame', tier: 'gold', check: (s) => streakDays(s.activity) >= 7 },
  { id: 'blitz', title: 'Blitzmerker', description: 'In der Blitzrunde 10 Punkte erreicht.', icon: 'zap', tier: 'silber', check: (s) => s.blitz.best >= 10 },
];

export function newlyEarnedBadges(s: ProgressState): BadgeDef[] {
  return BADGES.filter((b) => !s.badges[b.id] && b.check(s));
}
