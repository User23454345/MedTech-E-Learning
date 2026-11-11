import type { Source } from '@/types/content';

/**
 * Literatur & Normen für das Modul „Beatmungsgerät“.
 * IDs werden in Inhalten über Blöcke vom Typ `sources` referenziert.
 */
export const ventilatorSources: Source[] = [
  { id: 'rathgeber', kind: 'buch', label: 'Rathgeber J. – Grundlagen der maschinellen Beatmung', detail: 'Thieme, Stuttgart' },
  { id: 'larsen', kind: 'buch', label: 'Larsen R., Mathes A. – Beatmung: Indikationen, Techniken, Krankheitsbilder', detail: 'Springer, Berlin/Heidelberg' },
  { id: 'oczenski', kind: 'buch', label: 'Oczenski W. (Hrsg.) – Atmen – Atemhilfen: Atemphysiologie und Beatmungstechnik', detail: 'Thieme, Stuttgart' },
  { id: 'tobin', kind: 'buch', label: 'Tobin M. J. (Hrsg.) – Principles and Practice of Mechanical Ventilation', detail: '3. Aufl., McGraw-Hill, 2013' },
  { id: 'west', kind: 'buch', label: 'West J. B., Luks A. M. – West’s Respiratory Physiology: The Essentials', detail: 'Wolters Kluwer' },
  { id: 'chatburn', kind: 'artikel', label: 'Chatburn R. L., El-Khatib M., Mireles-Cabodevila E. – A taxonomy for mechanical ventilation: 10 fundamental maxims', detail: 'Respiratory Care 2014; 59(11): 1747–1763' },
  { id: 'ardsnet', kind: 'artikel', label: 'ARDS Network – Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and ARDS', detail: 'N Engl J Med 2000; 342: 1301–1308' },
  { id: 'amato', kind: 'artikel', label: 'Amato M. B. P. et al. – Driving pressure and survival in the acute respiratory distress syndrome', detail: 'N Engl J Med 2015; 372: 747–755' },
  { id: 'berlin', kind: 'artikel', label: 'ARDS Definition Task Force – Acute respiratory distress syndrome: the Berlin Definition', detail: 'JAMA 2012; 307(23): 2526–2533' },
  { id: 's3-beatmung', kind: 'leitlinie', label: 'S3-Leitlinie „Invasive Beatmung und Einsatz extrakorporaler Verfahren bei akuter respiratorischer Insuffizienz“', detail: 'AWMF-Registernr. 001-021', url: 'https://register.awmf.org/de/leitlinien/detail/001-021' },
  { id: 'iso80601-2-12', kind: 'norm', label: 'DIN EN ISO 80601-2-12 – Besondere Festlegungen für die Sicherheit einschließlich der wesentlichen Leistungsmerkmale von Beatmungsgeräten für die Intensivpflege', detail: 'Norm für Intensivbeatmungsgeräte' },
  { id: 'iec60601-1-8', kind: 'norm', label: 'IEC 60601-1-8 – Alarmsysteme in medizinischen elektrischen Geräten', detail: 'Allgemeine Festlegungen, Prüfungen und Richtlinien für Alarmsysteme' },
  { id: 'mpbetreibv', kind: 'norm', label: 'Medizinprodukte-Betreiberverordnung (MPBetreibV)', detail: 'Einweisung, sicherheitstechnische Kontrollen, Bestandsverzeichnis', url: 'https://www.gesetze-im-internet.de/mpbetreibv/' },
  { id: 'mdr', kind: 'norm', label: 'Verordnung (EU) 2017/745 über Medizinprodukte (MDR)', detail: 'Amtsblatt der EU, L 117' },
];
