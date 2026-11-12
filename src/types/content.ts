/**
 * Inhaltsmodell der Plattform.
 *
 * Jedes Gerät ist ein `DeviceModule` mit sechs Lektionen in einheitlicher
 * Struktur. Lektionen bestehen aus Abschnitten (`Section`), diese aus
 * typisierten Inhaltsblöcken (`Block`). Neue Geräte werden ausschließlich
 * über Daten hinzugefügt – die UI rendert alles generisch.
 */

import type { IconName } from '@/components/ui/Icon';

/* ------------------------------------------------------------------ */
/* Kategorien & Quellen                                                 */
/* ------------------------------------------------------------------ */

export type CategoryId =
  | 'beatmung'
  | 'monitoring'
  | 'defibrillation'
  | 'ekg'
  | 'infusion'
  | 'spritzenpumpe'
  | 'ultraschall'
  | 'roentgen'
  | 'anaesthesie'
  | 'dialyse';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: IconName;
}

/** Literatur-/Normverweis. `id` wird in Texten als [[src:id]] referenziert. */
export interface Source {
  id: string;
  /** Kurzzitat, z. B. "Rathgeber J. – Grundlagen der maschinellen Beatmung" */
  label: string;
  /** Verlag, Auflage, Jahr, Kapitel o. Ä. */
  detail?: string;
  url?: string;
  kind: 'buch' | 'leitlinie' | 'norm' | 'artikel' | 'web';
}

/* ------------------------------------------------------------------ */
/* Fragen                                                               */
/* ------------------------------------------------------------------ */

interface QuestionBase {
  /** Global eindeutig, z. B. "vent-q-peep-01" */
  id: string;
  /** Fragetext (Mini-Markdown erlaubt) */
  prompt: string;
  /** Erklärung, die nach der Antwort angezeigt wird – IMMER begründen, warum. */
  explanation: string;
  /** Themen-Tag für die Auswertung nach Themen, z. B. "Parameter", "Physik" */
  topic: string;
  difficulty: 1 | 2 | 3;
}

export interface SingleChoiceQuestion extends QuestionBase {
  kind: 'single';
  options: string[];
  /** Index der richtigen Option */
  correct: number;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  kind: 'multiple';
  options: string[];
  /** Indizes aller richtigen Optionen */
  correct: number[];
}

export interface TrueFalseQuestion extends QuestionBase {
  kind: 'truefalse';
  correct: boolean;
}

export interface NumericQuestion extends QuestionBase {
  kind: 'numeric';
  answer: number;
  /** absolute Toleranz */
  tolerance: number;
  unit: string;
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | NumericQuestion;

/* ------------------------------------------------------------------ */
/* Lernspiele                                                           */
/* ------------------------------------------------------------------ */

/** Zuordnungsspiel: linke Begriffe den richtigen rechten Beschreibungen zuordnen. */
export interface MatchingGame {
  id: string;
  title: string;
  instructions: string;
  pairs: { id: string; left: string; right: string }[];
}

/** Reihenfolge-Spiel: Schritte in die korrekte Reihenfolge bringen. */
export interface OrderingGame {
  id: string;
  title: string;
  instructions: string;
  /** In KORREKTER Reihenfolge angeben – die UI mischt selbst. */
  steps: { id: string; text: string }[];
  explanation: string;
}

/**
 * Fehlersuche: Eine Gerätekonfiguration / Situation wird als Liste von
 * Einstellungen/Befunden dargestellt; der Nutzer markiert die fehlerhaften.
 */
export interface FaultFinderGame {
  id: string;
  title: string;
  scenario: string;
  items: {
    id: string;
    label: string;
    value: string;
    isFault: boolean;
    /** Warum ist es (k)ein Fehler? Wird nach dem Prüfen angezeigt. */
    explanation: string;
  }[];
}

/** Praxisfall: mehrstufige Entscheidungsgeschichte aus dem klinischen Alltag. */
export interface ClinicalCase {
  id: string;
  title: string;
  setting: string;
  /** Ausgangssituation (Mini-Markdown) */
  presentation: string;
  vitals?: { label: string; value: string; status?: 'ok' | 'warn' | 'alarm' }[];
  steps: {
    prompt: string;
    options: { text: string; correct: boolean; feedback: string }[];
  }[];
  /** Fazit / Take-home-Message */
  debrief: string;
}

/* ------------------------------------------------------------------ */
/* Inhaltsblöcke                                                        */
/* ------------------------------------------------------------------ */

export type CalloutVariant =
  | 'info' // Allgemeiner Hinweis
  | 'clinical' // Praxisbezug / klinischer Alltag
  | 'warning' // Risiko / Patientensicherheit
  | 'model' // Vereinfachtes Modell vs. Realität
  | 'deep' // Vertiefung für Fortgeschrittene
  | 'remember'; // Merksatz

export type Block =
  | { type: 'text'; md: string }
  | { type: 'heading'; text: string }
  | { type: 'callout'; variant: CalloutVariant; title?: string; md: string }
  | { type: 'keyTerms'; terms: { term: string; definition: string }[] }
  | {
      type: 'formula';
      /** Formel als Klartext mit Unicode, z. B. "P_aw = V/C + R · V̇ + PEEP"; "\n" trennt mehrere Zeilen */
      expression: string;
      explanation: string;
      variables?: { symbol: string; meaning: string; unit?: string }[];
    }
  | { type: 'steps'; title?: string; steps: { title: string; md: string }[] }
  | { type: 'facts'; items: { value: string; label: string }[] }
  | {
      type: 'table';
      caption?: string;
      head: string[];
      rows: string[][];
    }
  | {
      type: 'widget';
      /** Schlüssel aus der Widget-Registry (src/features/widgets.tsx) */
      widget: string;
      props?: Record<string, unknown>;
      caption?: string;
    }
  | { type: 'quiz'; title?: string; questions: Question[] }
  | { type: 'matching'; game: MatchingGame }
  | { type: 'ordering'; game: OrderingGame }
  | { type: 'faultFinder'; game: FaultFinderGame }
  | { type: 'case'; case: ClinicalCase }
  | { type: 'sources'; ids: string[] };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export type LessonKind =
  | 'grundlagen'
  | 'aufbau'
  | 'funktion'
  | 'bedienung'
  | 'training'
  | 'pruefung';

export interface Lesson {
  /** z. B. "grundlagen" – eindeutig innerhalb des Moduls, wird in der URL verwendet */
  id: string;
  number: number;
  kind: LessonKind;
  title: string;
  subtitle: string;
  durationMin: number;
  /** XP beim Abschließen */
  xp: number;
  objectives: string[];
  sections: Section[];
}

export interface Exam {
  /** Anzahl Fragen, die zufällig (ausgewogen nach Themen) aus dem Pool gezogen werden */
  questionCount: number;
  /** Bestehensgrenze 0..1 */
  passScore: number;
  pool: Question[];
  /** XP für das Bestehen (zusätzlich gibt es XP pro richtiger Antwort) */
  xp: number;
  /** Themen-Tag → Lektions-ID, für Wiederholungsempfehlungen in der Auswertung */
  topicLessons: Record<string, string>;
}

export type ModuleStatus = 'available' | 'coming-soon';

export interface DeviceModule {
  id: string;
  title: string;
  shortTitle: string;
  category: CategoryId;
  status: ModuleStatus;
  tagline: string;
  description: string;
  icon: IconName;
  level: 'Einsteiger' | 'Fortgeschritten' | 'Experte';
  durationMin: number;
  /** Was man am Ende kann */
  outcomes: string[];
  lessons: Lesson[];
  exam?: Exam;
  sources: Source[];
  /** Fragenpool für die Blitzrunde / Wissensduelle (Training-Hub) */
  practicePool?: Question[];
}
