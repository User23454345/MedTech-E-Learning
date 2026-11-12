/**
 * Messwertspalte und Alarmleiste des Simulators.
 */
import { Icon, cx } from '@/components/ui';
import { fmt, fmtIE, type Alarm, type BreathMetrics } from './model';
import s from './VentilatorSimulator.module.css';

interface Tile {
  key: string;
  label: React.ReactNode;
  value: string;
  unit: string;
  tone: 'p' | 'f' | 'v' | 'n';
  title: string;
  warn?: boolean;
}

export function MeasuredValues({ m, fio2 }: { m: BreathMetrics; fio2: number }) {
  const tiles: Tile[] = [
    { key: 'ppeak', label: <>P<sub>peak</sub></>, value: fmt(m.ppeak_cmH2O, 1), unit: 'cmH₂O', tone: 'p', title: 'Spitzendruck' },
    { key: 'pplat', label: <>P<sub>plat</sub>{!m.pplatMeasured && '*'}</>, value: fmt(m.pplat_cmH2O, 1), unit: 'cmH₂O', tone: 'p', title: m.pplatMeasured ? 'Plateaudruck (gemessen)' : 'Plateaudruck (Modellwert)', warn: m.pplat_cmH2O > 30 },
    { key: 'peep', label: <>PEEP<sub>tot</sub></>, value: fmt(m.peepTotal_cmH2O, 1), unit: 'cmH₂O', tone: 'p', title: 'Gesamt-PEEP inkl. intrinsischem PEEP', warn: m.autoPeep_cmH2O >= 1 },
    { key: 'pmean', label: <>P<sub>mean</sub></>, value: fmt(m.pmean_cmH2O, 1), unit: 'cmH₂O', tone: 'p', title: 'Mittlerer Atemwegsdruck' },
    { key: 'dp', label: 'ΔP', value: fmt(m.drivingPressure_cmH2O, 1), unit: 'cmH₂O', tone: 'p', title: 'Driving Pressure = Pplat − PEEP', warn: m.drivingPressure_cmH2O > 15 },
    { key: 'vte', label: <>VT<sub>e</sub></>, value: fmt(m.vte_ml), unit: 'ml', tone: 'v', title: 'Exspiratorisches Tidalvolumen' },
    { key: 'vtkg', label: 'VT/kg', value: fmt(m.vtPerKg_ml_per_kg, 1), unit: 'ml/kg', tone: 'v', title: 'Tidalvolumen pro kg Idealgewicht (PBW)', warn: m.vtPerKg_ml_per_kg > 8.5 },
    { key: 'mve', label: <>MV<sub>e</sub></>, value: fmt(m.mve_L_min, 1), unit: 'L/min', tone: 'v', title: 'Exspiratorisches Minutenvolumen' },
    { key: 'f', label: 'f', value: fmt(m.rr_per_min), unit: '/min', tone: 'n', title: 'Atemfrequenz' },
    { key: 'ie', label: 'I:E', value: fmtIE(m.ie_te_per_ti), unit: '', tone: 'n', title: 'Verhältnis Inspirations- zu Exspirationszeit' },
    { key: 'fio2', label: <>F<sub>I</sub>O<sub>2</sub></>, value: fmt(fio2, 2), unit: '', tone: 'n', title: 'Inspiratorische Sauerstofffraktion' },
    { key: 'tau', label: 'τ', value: fmt(m.tau_s, 2), unit: 's', tone: 'f', title: 'Zeitkonstante τ = R · C' },
    { key: 'paco2', label: <>P<sub>a</sub>CO<sub>2</sub>~</>, value: fmt(m.paco2Est_mmHg), unit: 'mmHg', tone: 'n', title: 'PaCO₂-Schätzung (didaktisches Modell)', warn: m.paco2Est_mmHg > 45 || m.paco2Est_mmHg < 35 },
  ];
  return (
    <div className={s.values}>
      <div className={s.valueGrid}>
        {tiles.map((t) => (
          <div key={t.key} className={cx(s.tile, s[`tone-${t.tone}`], t.warn && s.tileWarn)} title={t.title}>
            <span className={s.tileLabel}>{t.label}</span>
            <span className={s.tileValue}>{t.value}</span>
            <span className={s.tileUnit}>{t.unit}</span>
            <span className="visually-hidden">{t.title}</span>
          </div>
        ))}
      </div>
      <div className={cx(s.oxy, s[`oxy-${m.oxygenation.level}`])}>
        <Icon name="droplet" size={14} />
        <span>
          <strong>O₂-Tendenz:</strong> {m.oxygenation.text}
        </span>
      </div>
      <p className={s.footnote}>
        {!m.pplatMeasured && <>* Modellwert – am Gerät nur mit Insp.-Pause/-Hold messbar. </>}~ didaktische Schätzung, keine klinische Vorhersage.
      </p>
    </div>
  );
}

const PRIO_LABEL: Record<Alarm['priority'], string> = { high: 'Hohe Priorität', medium: 'Mittlere Priorität', low: 'Hinweis' };

export function AlarmBar({ alarms }: { alarms: Alarm[] }) {
  return (
    <div className={s.alarmBar} aria-live="polite" aria-atomic="false">
      {alarms.length === 0 ? (
        <div className={cx(s.alarm, s.alarmOk)}>
          <Icon name="check" size={16} />
          <span className={s.alarmTitle}>Keine Alarme</span>
        </div>
      ) : (
        alarms.map((a) => (
          <details key={a.id} className={cx(s.alarm, s[`alarm-${a.priority}`])}>
            <summary>
              <span className={s.alarmIcon} aria-hidden="true">
                {a.priority === 'high' ? '!!!' : a.priority === 'medium' ? '!!' : '!'}
              </span>
              <span className={s.alarmTitle}>{a.title}</span>
              <span className="visually-hidden">({PRIO_LABEL[a.priority]})</span>
              <Icon name="chevronDown" size={14} className={s.alarmChevron} />
            </summary>
            <p>{a.explanation}</p>
          </details>
        ))
      )}
    </div>
  );
}
