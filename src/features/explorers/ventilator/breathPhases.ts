/**
 * Erklärtexte zu den Phasen des volumenkontrollierten Atemhubs (Mini-Markdown).
 * Zahlen passen zu den Modellparametern in breathModel.ts.
 */
import type { PhaseId } from './breathModel';

export type ValveState = 'open' | 'closed' | 'peep';

export interface PhaseText {
  inspValve: ValveState;
  expValve: ValveState;
  flowDir: string;
  pressure: string;
  body: string;
  note?: string;
}

export const PHASE_TEXT: Record<PhaseId, PhaseText> = {
  trigger: {
    inspValve: 'closed',
    expValve: 'peep',
    flowDir: 'kein Flow (V̇ ≈ 0)',
    pressure: 'P~aw~ = PEEP = 5 cmH~2~O',
    body:
      'Der Atemhub wird ausgelöst. Beim **Zeittrigger** startet das Gerät nach Ablauf der Zykluszeit 60 s / f – hier bei f = 15/min alle 4 s. Beim **Patiententrigger** erkennt das Gerät eine Einatembemühung: einen Druckabfall unter PEEP (**Drucktrigger**) oder einen Flow zur Patientin bzw. zum Patienten oberhalb der Triggerschwelle (**Flowtrigger**). Bis dahin ruht die Lunge auf dem endexspiratorischen Volumen, das Exspirationsventil hält den PEEP.',
    note: 'Ein zu empfindlich eingestellter Trigger kann durch Leckagen oder Kondenswasser Fehlauslösungen (Autotriggerung) verursachen.',
  },
  insp: {
    inspValve: 'open',
    expValve: 'closed',
    flowDir: 'konstant +30 L/min zur Lunge',
    pressure: 'steigt linear auf P~peak~ = 20 cmH~2~O',
    body:
      'Das Inspirationsventil gibt einen **konstanten Flow** von 30 L/min (0,5 L/s) ab, das Exspirationsventil ist **geschlossen** – das Gas kann nur in die Lunge. Zu Beginn springt der Druck um den resistiven Anteil R · V̇ = 10 cmH~2~O/(L/s) · 0,5 L/s = 5 cmH~2~O (Tubus und Atemwege). Danach steigt er linear, weil die Lunge mit jedem Milliliter elastisch gespannt wird (V/C). Nach 1,0 s sind 500 ml abgegeben: P~peak~ = PEEP + V~T~/C + R · V̇ = 5 + 10 + 5 = 20 cmH~2~O.',
  },
  pause: {
    inspValve: 'closed',
    expValve: 'closed',
    flowDir: 'kein Flow (V̇ = 0)',
    pressure: 'fällt auf P~plat~ = 15 cmH~2~O',
    body:
      '**Beide Ventile sind geschlossen**, das Volumen wird in der Lunge gehalten. Ohne Flow entfällt der resistive Druckanteil R · V̇: Der Atemwegsdruck fällt vom Spitzen- auf den **Plateaudruck** P~plat~ = PEEP + V~T~/C = 15 cmH~2~O – näherungsweise der endinspiratorische Alveolardruck. Die Differenz P~peak~ − P~plat~ (5 cmH~2~O) spiegelt die Resistance, der **Driving Pressure** ΔP = P~plat~ − PEEP = 10 cmH~2~O die Compliance (ΔP = V~T~/C).',
    note: 'Modell: In der Realität sinkt der Druck in der Pause nicht nur stufenförmig, sondern noch leicht weiter – durch Umverteilung des Gases zwischen Lungenbezirken und viskoelastische Eigenschaften des Gewebes.',
  },
  exp: {
    inspValve: 'closed',
    expValve: 'open',
    flowDir: 'negativ, von −60 L/min exponentiell abnehmend',
    pressure: 'P~aw~ fällt auf PEEP, P~alv~ sinkt exponentiell',
    body:
      'Das Inspirationsventil bleibt zu, das **Exspirationsventil öffnet**. Die Ausatmung ist **passiv**: Die elastischen Rückstellkräfte von Lunge und Thoraxwand treiben das Gas gegen den Atemwegswiderstand hinaus. Der Flow ist negativ und startet mit −(P~plat~ − PEEP)/R = −10/10 L/s = −1 L/s (−60 L/min). Er nimmt exponentiell ab: V̇(t) = −(P~plat~ − PEEP)/R · e^−t/τ^ mit der Zeitkonstante τ = R · C = 0,5 s. Nach 3 τ = 1,5 s sind etwa 95 % des Tidalvolumens ausgeatmet.',
    note: 'Modell: Mit einem idealen Exspirationsventil fällt der Atemwegsdruck am Y-Stück sofort auf PEEP; der Alveolardruck (gestrichelt) folgt erst mit dem Volumen. Real erzeugen Schläuche und Ventil einen kleinen zusätzlichen Widerstand.',
  },
  peep: {
    inspValve: 'closed',
    expValve: 'peep',
    flowDir: 'gegen 0 (Restfluss)',
    pressure: 'P~aw~ = PEEP = 5 cmH~2~O',
    body:
      'Das Exspirationsventil **regelt** nun so, dass der Druck im System nicht unter den eingestellten **PEEP** von 5 cmH~2~O fällt. Der Flow geht gegen null, die Lunge bleibt oberhalb ihres entspannten Volumens **teilweise gebläht**: Alveolen bleiben offen, das endexspiratorische Lungenvolumen und damit die Oxygenierung werden verbessert. Danach beginnt mit dem nächsten Trigger der neue Atemzug.',
    note: 'Ist die Exspirationszeit zu kurz (deutlich unter ca. 3 τ), wird nicht vollständig ausgeatmet: Es entsteht ein intrinsischer PEEP (Air-Trapping) – typisch bei obstruktiven Erkrankungen mit hoher Resistance und damit großem τ.',
  },
};

export const VALVE_LABEL: Record<ValveState, string> = {
  open: 'offen',
  closed: 'geschlossen',
  peep: 'regelt PEEP',
};
