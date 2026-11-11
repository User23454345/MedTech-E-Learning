import type { Lesson } from '@/types/content';
import { ventilatorExam } from './exam';

const passPercent = Math.round(ventilatorExam.passScore * 100);
const topics = Object.keys(ventilatorExam.topicLessons);

/**
 * Lektion 6 – Wissen überprüfen: kurze Einführung in den Abschlusstest.
 * Der ExamRunner wird von der Lektionsseite automatisch nach den Abschnitten gerendert.
 */
export const lessonPruefung: Lesson = {
  id: 'pruefung',
  number: 6,
  kind: 'pruefung',
  title: 'Wissen überprüfen',
  subtitle: 'Abschlusstest mit Auswertung nach Themen',
  durationMin: 20,
  xp: 100,
  objectives: [
    'Das eigene Wissen zum Beatmungsgerät in einem Abschlusstest überprüfen',
    `Mindestens ${passPercent} % der Fragen richtig beantworten`,
    'Wissenslücken anhand der Auswertung nach Themen gezielt schließen',
  ],
  sections: [
    {
      id: 'ablauf',
      title: 'So funktioniert der Abschlusstest',
      blocks: [
        {
          type: 'text',
          md: `Du hast alle Lektionen bearbeitet – jetzt zeigst du, was du kannst. Der Abschlusstest besteht aus **${ventilatorExam.questionCount} Fragen**, die bei jedem Durchgang neu und ausgewogen aus einem größeren Fragenpool zusammengestellt werden. Du begegnest Single- und Multiple-Choice-Fragen, Richtig-/Falsch-Aussagen und kleinen Rechenaufgaben.

**Bestanden** hast du ab **${passPercent} %** richtigen Antworten. Für das Bestehen erhältst du zusätzlich **${ventilatorExam.xp} XP**.`,
        },
        {
          type: 'steps',
          title: 'Ablauf',
          steps: [
            {
              title: 'Fragen beantworten',
              md: 'Lies jede Frage in Ruhe. Bei Multiple-Choice-Fragen können mehrere Antworten richtig sein; bei Rechenaufgaben gibst du eine Zahl in der angegebenen Einheit ein.',
            },
            {
              title: 'Auswertung nach Themen',
              md: `Am Ende siehst du dein Ergebnis aufgeschlüsselt nach Themen: ${topics.join(', ')}.`,
            },
            {
              title: 'Aus Fehlern lernen',
              md: 'Zu jeder falsch beantworteten Frage erhältst du eine Erklärung, warum die richtige Antwort richtig ist – und wo der Denkfehler lag. Für schwächere Themen bekommst du eine Empfehlung, welche Lektion du wiederholen solltest.',
            },
            {
              title: 'Wiederholen',
              md: 'Du kannst den Test beliebig oft wiederholen. Da die Fragen jedes Mal neu gezogen werden, lohnt sich ein zweiter Durchgang auch nach dem Bestehen.',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'remember',
          title: 'Tipps für die Vorbereitung',
          md: `- **Formeln verstehen statt auswendig lernen:** Bewegungsgleichung (P~aw~ = PEEP + V/C + R · V̇), Compliance, τ = R · C, MV = V~T~ · f und ΔP = P~plat~ − PEEP.
- **PBW rechnen üben:** Männer 50 + 0,91 · (Größe − 152,4), Frauen 45,5 + 0,91 · (Größe − 152,4).
- **Einheiten beachten:** ml und L, L/min und L/s – viele Fehler entstehen bei der Umrechnung.
- **Kurven mitdenken:** Was passiert bei VC und was bei PC, wenn Resistance oder Compliance sich ändern?
- **Erst lesen, dann klicken:** Achte auf Wörter wie „nicht“, „immer“ oder „am wahrscheinlichsten“.
- **Blitzrunde nutzen:** Im Trainingsbereich kannst du mit kurzen Fragen in 60 Sekunden gezielt üben.`,
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Hinweis',
          md: 'Der Test prüft Verständnis und Grundlagenwissen. Er ersetzt keine gerätespezifische Einweisung nach MPBetreibV; konkrete Einstellungen richten sich immer nach ärztlicher Anordnung, Gebrauchsanweisung und lokalen SOPs.',
        },
      ],
    },
  ],
};
