/**
 * Modul-Registry. Neues Gerät hinzufügen:
 * 1. Ordner unter src/data/modules/<geraet>/ mit Lektionen anlegen
 * 2. Modul hier in `ALL_MODULES` eintragen
 */
import type { DeviceModule } from '@/types/content';
import { ventilatorModule } from './ventilator';
import { upcomingModules } from './upcoming';

export const ALL_MODULES: DeviceModule[] = [ventilatorModule, ...upcomingModules];
export const AVAILABLE_MODULES = ALL_MODULES.filter((m) => m.status === 'available');

export const getModule = (id: string | undefined) => ALL_MODULES.find((m) => m.id === id);
export const getLesson = (moduleId: string | undefined, lessonId: string | undefined) =>
  getModule(moduleId)?.lessons.find((l) => l.id === lessonId);
