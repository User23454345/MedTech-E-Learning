/**
 * Fachlogik für Fragen: Antworttypen, Auswertung, Optionsmischung und
 * themen-ausgewogene Ziehung für Prüfungen.
 *
 * Antworten werden IMMER im Index-Raum der Originaloptionen gespeichert.
 * Die gemischte Anzeige-Reihenfolge (`order`) ist davon unabhängig, dadurch
 * kann die Zuordnung zur richtigen Lösung nie verrutschen.
 */
import type { Question } from '@/types/content';
import { createRng, shuffle, shuffledIndices, type Rng } from './random';

export type Answer =
  | { kind: 'single'; index: number }
  | { kind: 'multiple'; indices: number[] }
  | { kind: 'truefalse'; value: boolean }
  | { kind: 'numeric'; raw: string };

/** Eine Frage samt Anzeige-Reihenfolge ihrer Optionen. */
export interface PreparedQuestion {
  question: Question;
  /** Anzeige-Reihenfolge als Liste von Original-Indizes (leer bei truefalse/numeric). */
  order: number[];
}

export function optionCount(q: Question): number {
  return q.kind === 'single' || q.kind === 'multiple' ? q.options.length : 0;
}

export function prepareQuestion(q: Question, rng: Rng = Math.random): PreparedQuestion {
  return { question: q, order: shuffledIndices(optionCount(q), rng) };
}

export function prepareAll(qs: readonly Question[], rng: Rng = Math.random): PreparedQuestion[] {
  return qs.map((q) => prepareQuestion(q, rng));
}

/** Zahl mit Komma oder Punkt parsen; null, wenn ungültig. */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (!cleaned || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : null;
}

export function formatNumber(v: number): string {
  return v.toLocaleString('de-DE', { maximumFractionDigits: 3 });
}

/** Gilt die Antwort als „gegeben“ (für Prüfungsübersicht)? */
export function isAnswered(a: Answer | null | undefined): boolean {
  if (!a) return false;
  switch (a.kind) {
    case 'multiple':
      return a.indices.length > 0;
    case 'numeric':
      return a.raw.trim().length > 0;
    default:
      return true;
  }
}

export function isCorrect(q: Question, a: Answer | null | undefined): boolean {
  if (!a || a.kind !== q.kind) return false;
  switch (q.kind) {
    case 'single':
      return a.kind === 'single' && a.index === q.correct;
    case 'multiple': {
      if (a.kind !== 'multiple') return false;
      const want = new Set(q.correct);
      const got = new Set(a.indices);
      return want.size === got.size && [...want].every((i) => got.has(i));
    }
    case 'truefalse':
      return a.kind === 'truefalse' && a.value === q.correct;
    case 'numeric': {
      if (a.kind !== 'numeric') return false;
      const v = parseNumber(a.raw);
      // kleine Epsilon-Reserve gegen Rundungsartefakte
      return v !== null && Math.abs(v - q.answer) <= q.tolerance + 1e-9;
    }
  }
}

/** Lesbare Darstellung der richtigen Lösung (Klartext/Mini-Markdown). */
export function correctAnswerText(q: Question): string {
  switch (q.kind) {
    case 'single':
      return q.options[q.correct];
    case 'multiple':
      return q.correct.map((i) => q.options[i]).join(' · ');
    case 'truefalse':
      return q.correct ? 'Richtig' : 'Falsch';
    case 'numeric':
      return `${formatNumber(q.answer)} ${q.unit}${q.tolerance > 0 ? ` (± ${formatNumber(q.tolerance)})` : ''}`.trim();
  }
}

/** Lesbare Darstellung der Nutzerantwort. */
export function answerText(q: Question, a: Answer | null | undefined): string {
  if (!isAnswered(a) || !a) return 'Keine Antwort';
  switch (a.kind) {
    case 'single':
      return q.kind === 'single' ? q.options[a.index] ?? '–' : '–';
    case 'multiple':
      return q.kind === 'multiple' ? a.indices.map((i) => q.options[i]).join(' · ') : '–';
    case 'truefalse':
      return a.value ? 'Richtig' : 'Falsch';
    case 'numeric':
      return `${a.raw.trim()}${q.kind === 'numeric' ? ` ${q.unit}` : ''}`;
  }
}

/**
 * Themen-ausgewogene Ziehung: Fragen werden je Thema gemischt und dann
 * reihum (Round-Robin) gezogen, bis `count` erreicht ist. Deterministisch
 * bei gleichem Seed. Die Optionen werden ebenfalls mit demselben Seed gemischt.
 */
export function drawBalanced(pool: readonly Question[], count: number, seed: number): PreparedQuestion[] {
  const rng = createRng(seed);
  const byTopic = new Map<string, Question[]>();
  for (const q of pool) {
    const list = byTopic.get(q.topic) ?? [];
    list.push(q);
    byTopic.set(q.topic, list);
  }
  const queues = shuffle([...byTopic.keys()], rng).map((t) => shuffle(byTopic.get(t) ?? [], rng));
  const target = Math.min(count, pool.length);
  const picked: Question[] = [];
  while (picked.length < target) {
    let progressed = false;
    for (const q of queues) {
      if (picked.length >= target) break;
      const next = q.shift();
      if (next) {
        picked.push(next);
        progressed = true;
      }
    }
    if (!progressed) break;
  }
  return shuffle(picked, rng).map((q) => prepareQuestion(q, rng));
}

/** Auswertung je Thema: topic -> [richtig, gesamt] */
export function topicScores(items: readonly PreparedQuestion[], answers: readonly (Answer | null)[]): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  items.forEach((it, i) => {
    const cur = out[it.question.topic] ?? [0, 0];
    out[it.question.topic] = [cur[0] + (isCorrect(it.question, answers[i]) ? 1 : 0), cur[1] + 1];
  });
  return out;
}

export const OPTION_LETTERS = 'ABCDEFGHIJ';
