import type { ClinicalCase } from '@/types/content';

// STUB – wird ausgearbeitet.
export function CaseRunner({ data }: { data: ClinicalCase }) {
  return <div data-stub="case">{data.title}</div>;
}
