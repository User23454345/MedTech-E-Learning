import type { Category } from '@/types/content';

export const CATEGORIES: Category[] = [
  { id: 'beatmung', name: 'Beatmungsgeräte', description: 'Maschinelle Unterstützung oder Übernahme der Atmung.', icon: 'lungs' },
  { id: 'monitoring', name: 'Patientenmonitore', description: 'Kontinuierliche Überwachung der Vitalparameter.', icon: 'monitor' },
  { id: 'defibrillation', name: 'Defibrillatoren', description: 'Elektrische Therapie lebensbedrohlicher Rhythmusstörungen.', icon: 'zap' },
  { id: 'ekg', name: 'EKG-Geräte', description: 'Ableitung und Analyse der elektrischen Herzaktivität.', icon: 'activity' },
  { id: 'infusion', name: 'Infusionspumpen', description: 'Präzise volumetrische Flüssigkeits- und Medikamentengabe.', icon: 'droplet' },
  { id: 'spritzenpumpe', name: 'Spritzenpumpen', description: 'Hochpräzise Dosierung kleiner Volumina.', icon: 'syringe' },
  { id: 'ultraschall', name: 'Ultraschallgeräte', description: 'Bildgebung mit Schallwellen – ohne ionisierende Strahlung.', icon: 'waves' },
  { id: 'roentgen', name: 'Röntgengeräte', description: 'Projektionsradiographie mit Röntgenstrahlung.', icon: 'scan' },
  { id: 'anaesthesie', name: 'Anästhesiegeräte', description: 'Narkosegasdosierung, Beatmung und Überwachung in einem System.', icon: 'mask' },
  { id: 'dialyse', name: 'Dialysegeräte', description: 'Extrakorporale Blutreinigung bei Nierenversagen.', icon: 'filter' },
];

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
