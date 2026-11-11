/**
 * Widget-Registry: Inhalte referenzieren interaktive Komponenten über
 * einen String-Schlüssel (Block `{ type: 'widget', widget: '<key>' }`).
 * Widgets werden lazy geladen, damit die Startseite schnell bleibt.
 *
 * Neues Widget: Komponente mit Default-Export anlegen und hier eintragen.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWidget = LazyExoticComponent<ComponentType<any>>;

export const WIDGETS: Record<string, AnyWidget> = {
  /** Interaktives Gerät mit anklickbaren Komponenten (Lektion 2) */
  'vent-explorer': lazy(() => import('./explorers/ventilator/VentilatorExplorer')),
  /** Animierter Atemzyklus: Ventile, Gasfluss, Drücke Schritt für Schritt (Lektion 3) */
  'vent-breath-cycle': lazy(() => import('./explorers/ventilator/BreathCycle')),
  /** Bewegungsgleichung interaktiv: P = PEEP + V/C + R·Flow (Lektion 3) */
  'vent-equation': lazy(() => import('./simulators/ventilator/EquationOfMotion')),
  /** Vollständiger Beatmungssimulator (Lektion 4/5), Props: { missions?: boolean; initialPatient?: string } */
  'vent-simulator': lazy(() => import('./simulators/ventilator/VentilatorSimulator')),
  /** Kurvendetektiv: Beatmungskurven interpretieren (Lektion 5) */
  'vent-curve-detective': lazy(() => import('./simulators/ventilator/CurveDetective')),
};
