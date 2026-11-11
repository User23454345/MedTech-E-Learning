import type { Question } from '@/types/content';

// STUB – wird ausgearbeitet.
export function QuizBlock({ title, questions, contextId }: { title?: string; questions: Question[]; contextId: string }) {
  return <div data-stub="quiz" data-context={contextId}>{title} ({questions.length} Fragen)</div>;
}
