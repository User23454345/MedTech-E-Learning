import type { Lesson } from '@/types/content';

// PLATZHALTER – wird durch die inhaltliche Ausarbeitung ersetzt.
export const lessonTraining: Lesson = {
  id: 'training',
  number: 5,
  kind: 'training',
  title: 'Interaktives Training',
  subtitle: 'Spiele, Fälle, Simulation',
  durationMin: 10,
  xp: 50,
  objectives: ['Platzhalter'],
  sections: [{ id: 'intro', title: 'Einführung', blocks: [{ type: 'text', md: 'Inhalt folgt.' }] }],
};
