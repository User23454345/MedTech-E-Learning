import type { DeviceModule } from '@/types/content';
import { lessonGrundlagen } from './lesson1-grundlagen';
import { lessonAufbau } from './lesson2-aufbau';
import { lessonFunktion } from './lesson3-funktion';
import { lessonBedienung } from './lesson4-bedienung';
import { lessonTraining } from './lesson5-training';
import { lessonPruefung } from './lesson6-pruefung';
import { ventilatorExam, ventilatorPracticePool } from './exam';
import { ventilatorSources } from './sources';

export const ventilatorModule: DeviceModule = {
  id: 'beatmungsgeraet',
  title: 'Beatmungsgerät (Intensivrespirator)',
  shortTitle: 'Beatmungsgerät',
  category: 'beatmung',
  status: 'available',
  tagline: 'Vom Atemgasfluss bis zum PEEP – verstehen, wie maschinelle Beatmung wirklich funktioniert.',
  description:
    'Ein Intensivbeatmungsgerät übernimmt oder unterstützt die Atemarbeit kritisch kranker Patient:innen. In diesem Modul erkundest du Aufbau und Komponenten, verstehst die Physik eines maschinellen Atemzugs und steuerst selbst einen Beatmungssimulator.',
  icon: 'lungs',
  level: 'Einsteiger',
  durationMin: 120,
  outcomes: [
    'Aufbau eines Intensivrespirators und den Weg des Atemgases erklären',
    'Die Bewegungsgleichung der Atmung anwenden: Druck, Volumen, Flow, Compliance, Resistance',
    'Volumen- und druckkontrollierte Beatmung unterscheiden',
    'Parameter wie Tidalvolumen, PEEP, Atemfrequenz, FiO₂ und I:E sicher einordnen',
    'Beatmungskurven lesen und typische Alarme und Risiken erkennen',
  ],
  lessons: [lessonGrundlagen, lessonAufbau, lessonFunktion, lessonBedienung, lessonTraining, lessonPruefung],
  exam: ventilatorExam,
  practicePool: ventilatorPracticePool,
  sources: ventilatorSources,
};
