import type { DeviceModule } from '@/types/content';

// STUB – wird ausgearbeitet.
export function ExamRunner({ module }: { module: DeviceModule }) {
  return <div data-stub="exam">Abschlusstest {module.shortTitle}</div>;
}
