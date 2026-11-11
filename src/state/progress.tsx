/**
 * Globaler Lernfortschritt (localStorage-persistiert) + Benachrichtigungen.
 *
 * Komponenten verwenden ausschließlich den Hook `useProgress()`.
 * Alle Änderungen laufen über `commit`, das XP, Tagesstatistik, Serie,
 * Abzeichen und Level-Up-Toasts konsistent behandelt.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BADGES,
  XP,
  dailyTasksFor,
  emptyDaily,
  initialState,
  lessonKey,
  levelFor,
  newlyEarnedBadges,
  streakDays,
  todayISO,
  type LevelInfo,
  type ProgressState,
} from '@/lib/gamification';
import type { IconName } from '@/components/ui/Icon';

const STORAGE_KEY = 'medtech-academy:progress:v1';

export interface Toast {
  id: number;
  kind: 'xp' | 'badge' | 'level' | 'info' | 'daily';
  title: string;
  message?: string;
  icon?: IconName;
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    // Vorwärtskompatibel mit Defaults zusammenführen
    return { ...initialState(), ...parsed } as ProgressState;
  } catch {
    return initialState();
  }
}

/** Tageswechsel berücksichtigen */
function rollDaily(s: ProgressState): ProgressState {
  const today = todayISO();
  return s.daily.date === today ? s : { ...s, daily: emptyDaily(today) };
}

export interface ProgressApi {
  state: ProgressState;
  level: LevelInfo;
  streak: number;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  notify: (t: Omit<Toast, 'id'>) => void;

  /** Ruft man beim Öffnen einer Lektion auf („Zuletzt bearbeitet“) */
  visitLesson: (moduleId: string, lessonId: string) => void;
  markSectionSeen: (moduleId: string, lessonId: string, sectionId: string) => void;
  completeLesson: (moduleId: string, lessonId: string, xp: number, title?: string) => void;
  isLessonCompleted: (moduleId: string, lessonId: string) => boolean;

  /** Einzelne beantwortete Frage (Quizblock, Fallbeispiel …). Vergibt XP bei richtig. */
  recordAnswer: (correct: boolean) => void;
  /** Lernspiel beendet. score 0..1. Vergibt XP abhängig vom Score. */
  recordGame: (gameId: string, score: number, title?: string) => void;
  /** Abschlusstest. */
  recordExam: (
    moduleId: string,
    score: number,
    passed: boolean,
    correctCount: number,
    topicScores: Record<string, [number, number]>,
    passXp: number,
  ) => void;
  /** Simulator-Mission gelöst (idempotent). */
  solveSimChallenge: (challengeId: string, title?: string) => void;
  /** Blitzrunde beendet. */
  recordBlitz: (points: number) => void;
  /** Frei vergebene XP (z. B. Fallbeispiel gelöst). */
  awardXp: (amount: number, reason: string) => void;

  setName: (name: string) => void;
  reset: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => rollDaily(load()));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Speicher voll / privat – Fortschritt bleibt in der Sitzung erhalten */
    }
  }, [state]);

  const notify = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastId.current++;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.kind === 'xp' ? 2600 : 4800);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), []);

  /**
   * Zentrale Mutationsfunktion: wendet `fn` an, verbucht `xp`, prüft
   * Tagesaufgaben, Abzeichen und Level-Up und erzeugt Toasts.
   */
  // Spiegel des aktuellen Zustands, damit Mutationen synchron und ohne
  // doppelte Seiteneffekte (StrictMode) berechnet werden können.
  const stateRef = useRef(state);
  stateRef.current = state;

  const apply = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  /**
   * Zentrale Mutationsfunktion: wendet `fn` an, verbucht `xp`, prüft
   * Tagesaufgaben, Abzeichen und Level-Up und erzeugt Toasts.
   */
  const commit = useCallback(
    (fn: (s: ProgressState) => ProgressState, xp = 0, xpReason?: string) => {
      const pending: Omit<Toast, 'id'>[] = [];
      const prev = rollDaily(stateRef.current);
      let s = fn(prev);
      const today = todayISO();
      if (xp > 0) {
        s = {
          ...s,
          xp: s.xp + xp,
          activity: { ...s.activity, [today]: (s.activity[today] ?? 0) + xp },
          daily: { ...s.daily, xp: s.daily.xp + xp },
        };
        if (xpReason) pending.push({ kind: 'xp', title: `+${xp} XP`, message: xpReason, icon: 'zap' });
      }
      // Tagesaufgaben (Bonus kann weitere Aufgaben wie „XP sammeln“ erfüllen → Schleife)
      for (let guard = 0; guard < 4; guard++) {
        let bonus = 0;
        for (const task of dailyTasksFor(s.daily.date)) {
          if (!s.daily.claimed.includes(task.id) && task.value(s.daily) >= task.target) {
            s = { ...s, daily: { ...s.daily, claimed: [...s.daily.claimed, task.id] } };
            bonus += XP.dailyTask;
            pending.push({ kind: 'daily', title: 'Tagesaufgabe erledigt', message: `${task.title} · +${XP.dailyTask} XP`, icon: 'calendar' });
          }
        }
        if (!bonus) break;
        s = {
          ...s,
          xp: s.xp + bonus,
          activity: { ...s.activity, [today]: (s.activity[today] ?? 0) + bonus },
          daily: { ...s.daily, xp: s.daily.xp + bonus },
        };
      }
      // Abzeichen
      const earned = newlyEarnedBadges(s);
      if (earned.length) {
        const now = new Date().toISOString();
        s = { ...s, badges: { ...s.badges, ...Object.fromEntries(earned.map((b) => [b.id, now])) } };
        for (const b of earned) pending.push({ kind: 'badge', title: `Abzeichen: ${b.title}`, message: b.description, icon: b.icon });
      }
      // Level-Up
      const before = levelFor(prev.xp).level;
      const after = levelFor(s.xp);
      if (after.level > before) pending.push({ kind: 'level', title: `Level ${after.level} erreicht`, message: after.title, icon: 'trophy' });
      apply(s);
      pending.forEach(notify);
    },
    [notify, apply],
  );

  const update = useCallback((fn: (s: ProgressState) => ProgressState) => apply(fn(stateRef.current)), [apply]);

  const api = useMemo<ProgressApi>(() => {
    return {
      state,
      level: levelFor(state.xp),
      streak: streakDays(state.activity),
      toasts,
      dismissToast,
      notify,

      visitLesson: (moduleId, lessonId) =>
        update((s) => ({
          ...s,
          recent: [{ moduleId, lessonId, at: new Date().toISOString() }, ...s.recent.filter((r) => !(r.moduleId === moduleId && r.lessonId === lessonId))].slice(0, 6),
        })),

      markSectionSeen: (moduleId, lessonId, sectionId) =>
        update((s) => {
          const k = lessonKey(moduleId, lessonId);
          const cur = s.lessons[k] ?? { completed: false, sectionsSeen: [] };
          if (cur.sectionsSeen.includes(sectionId)) return s;
          return { ...s, lessons: { ...s.lessons, [k]: { ...cur, sectionsSeen: [...cur.sectionsSeen, sectionId] } } };
        }),

      completeLesson: (moduleId, lessonId, xp, title) => {
        const k = lessonKey(moduleId, lessonId);
        if (stateRef.current.lessons[k]?.completed) return;
        commit(
          (s) => {
            const cur = s.lessons[k] ?? { completed: false, sectionsSeen: [] };
            if (cur.completed) return s;
            return {
              ...s,
              lessons: { ...s.lessons, [k]: { ...cur, completed: true, completedAt: new Date().toISOString() } },
              daily: { ...s.daily, lessons: s.daily.lessons + 1 },
            };
          },
          xp,
          title ? `Lektion abgeschlossen: ${title}` : 'Lektion abgeschlossen',
        );
      },
      isLessonCompleted: (moduleId, lessonId) => !!state.lessons[lessonKey(moduleId, lessonId)]?.completed,

      recordAnswer: (correct) =>
        commit(
          (s) => ({
            ...s,
            answers: { total: s.answers.total + 1, correct: s.answers.correct + (correct ? 1 : 0) },
            daily: { ...s.daily, quizCorrect: s.daily.quizCorrect + (correct ? 1 : 0) },
          }),
          correct ? XP.correctAnswer : 0,
        ),

      recordGame: (gameId, score, title) => {
        const xp = Math.max(5, Math.round(XP.gameBase * score));
        commit(
          (s) => {
            const prev = s.games[gameId];
            return {
              ...s,
              games: {
                ...s.games,
                [gameId]: { plays: (prev?.plays ?? 0) + 1, bestScore: Math.max(prev?.bestScore ?? 0, score), lastAt: new Date().toISOString() },
              },
              daily: { ...s.daily, games: s.daily.games + 1 },
            };
          },
          xp,
          title ? `${title} · ${Math.round(score * 100)} %` : `Lernspiel · ${Math.round(score * 100)} %`,
        );
      },

      recordExam: (moduleId, score, passed, correctCount, topicScores, passXp) => {
        const firstPass = passed && !stateRef.current.exams[moduleId]?.passed;
        const xp = correctCount * XP.examPerCorrect + (firstPass ? passXp : 0);
        commit(
          (s) => {
            const prev = s.exams[moduleId];
            return {
              ...s,
              exams: {
                ...s.exams,
                [moduleId]: {
                  attempts: (prev?.attempts ?? 0) + 1,
                  bestScore: Math.max(prev?.bestScore ?? 0, score),
                  lastScore: score,
                  passed: (prev?.passed ?? false) || passed,
                  lastAt: new Date().toISOString(),
                  topicScores,
                },
              },
              answers: { total: s.answers.total + Object.values(topicScores).reduce((a, [, t]) => a + t, 0), correct: s.answers.correct + correctCount },
              daily: { ...s.daily, quizCorrect: s.daily.quizCorrect + correctCount },
            };
          },
          xp,
          firstPass ? 'Abschlusstest bestanden!' : 'Abschlusstest ausgewertet',
        );
      },

      solveSimChallenge: (challengeId, title) => {
        if (stateRef.current.simulator.challengesSolved.includes(challengeId)) return;
        commit(
          (s) =>
            s.simulator.challengesSolved.includes(challengeId)
              ? s
              : { ...s, simulator: { challengesSolved: [...s.simulator.challengesSolved, challengeId] }, daily: { ...s.daily, games: s.daily.games + 1 } },
          XP.simChallenge,
          title ? `Mission gelöst: ${title}` : 'Simulator-Mission gelöst',
        );
      },

      recordBlitz: (points) =>
        commit(
          (s) => ({ ...s, blitz: { best: Math.max(s.blitz.best, points), plays: s.blitz.plays + 1 }, daily: { ...s.daily, games: s.daily.games + 1 } }),
          points * XP.blitzPerCorrect,
          `Blitzrunde · ${points} Punkte`,
        ),

      awardXp: (amount, reason) => commit((s) => s, amount, reason),

      setName: (name) => update((s) => ({ ...s, profile: { ...s.profile, name } })),
      reset: () => {
        apply(initialState());
        notify({ kind: 'info', title: 'Fortschritt zurückgesetzt', icon: 'reset' });
      },
    };
  }, [state, toasts, dismissToast, notify, commit, update, apply]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress muss innerhalb von <ProgressProvider> verwendet werden');
  return v;
}

export { BADGES };
