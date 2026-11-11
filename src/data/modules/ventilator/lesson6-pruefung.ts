import type { Lesson } from '@/types/content';

// PLATZHALTER – wird durch die inhaltliche Ausarbeitung ersetzt.
export const lessonPruefung: Lesson = {
  id: 'pruefung',
  number: 6,
  kind: 'pruefung',
  title: 'Wissen überprüfen',
  subtitle: 'Abschlusstest',
  durationMin: 10,
  xp: 50,
  objectives: ['Platzhalter'],
  sections: [{ id: 'intro', title: 'Einführung', blocks: [{ type: 'text', md: 'Inhalt folgt.' }] }],
};
