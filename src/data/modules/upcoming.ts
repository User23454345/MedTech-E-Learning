import type { DeviceModule } from '@/types/content';

/** Geplante Module – erscheinen im Katalog als „In Vorbereitung“. */
const soon = (m: Pick<DeviceModule, 'id' | 'title' | 'shortTitle' | 'category' | 'tagline' | 'icon' | 'level' | 'durationMin'>): DeviceModule => ({
  ...m,
  status: 'coming-soon',
  description: m.tagline,
  outcomes: [],
  lessons: [],
  sources: [],
});

export const upcomingModules: DeviceModule[] = [
  soon({ id: 'patientenmonitor', title: 'Patientenmonitor', shortTitle: 'Patientenmonitor', category: 'monitoring', icon: 'monitor', level: 'Einsteiger', durationMin: 90, tagline: 'EKG, SpO₂, NIBP und Alarme – Vitalparameter sicher überwachen.' }),
  soon({ id: 'defibrillator', title: 'Defibrillator / AED', shortTitle: 'Defibrillator', category: 'defibrillation', icon: 'zap', level: 'Einsteiger', durationMin: 90, tagline: 'Biphasische Schocks, Impedanz und synchronisierte Kardioversion.' }),
  soon({ id: 'ekg', title: '12-Kanal-EKG', shortTitle: 'EKG-Gerät', category: 'ekg', icon: 'activity', level: 'Einsteiger', durationMin: 100, tagline: 'Ableitungen, Filter und Artefakte – vom Elektrodenpotenzial zur Kurve.' }),
  soon({ id: 'infusionspumpe', title: 'Volumetrische Infusionspumpe', shortTitle: 'Infusionspumpe', category: 'infusion', icon: 'droplet', level: 'Einsteiger', durationMin: 75, tagline: 'Peristaltik, Okklusionsalarme und Dosisfehler-Reduktionssysteme.' }),
  soon({ id: 'spritzenpumpe', title: 'Spritzenpumpe', shortTitle: 'Spritzenpumpe', category: 'spritzenpumpe', icon: 'syringe', level: 'Fortgeschritten', durationMin: 60, tagline: 'Anlaufverhalten, Compliance des Systems und Bolus nach Okklusion.' }),
  soon({ id: 'ultraschall', title: 'Ultraschallgerät', shortTitle: 'Ultraschall', category: 'ultraschall', icon: 'waves', level: 'Fortgeschritten', durationMin: 120, tagline: 'Piezoeffekt, Impedanz, Doppler – wie aus Echos Bilder werden.' }),
  soon({ id: 'roentgen', title: 'Röntgenanlage', shortTitle: 'Röntgengerät', category: 'roentgen', icon: 'scan', level: 'Fortgeschritten', durationMin: 120, tagline: 'Röhre, Spektrum, Schwächung und Strahlenschutz.' }),
  soon({ id: 'anaesthesie', title: 'Anästhesiearbeitsplatz', shortTitle: 'Narkosegerät', category: 'anaesthesie', icon: 'mask', level: 'Experte', durationMin: 150, tagline: 'Kreissystem, Verdampfer und Frischgasfluss im Zusammenspiel.' }),
  soon({ id: 'dialyse', title: 'Hämodialysegerät', shortTitle: 'Dialysegerät', category: 'dialyse', icon: 'filter', level: 'Experte', durationMin: 150, tagline: 'Diffusion, Konvektion und Ultrafiltration im extrakorporalen Kreislauf.' }),
];
