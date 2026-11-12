/**
 * Missionsauswahl, Live-Checkliste, Hinweise und Debriefing.
 */
import { useState } from 'react';
import { Button, Chip, Icon, ProgressBar, cx } from '@/components/ui';
import { REQUIRED_BREATHS, type Mission, type MissionCriterion } from './missions';
import s from './VentilatorSimulator.module.css';

interface Props {
  missions: Mission[];
  activeId: string;
  solvedIds: string[];
  criteria: MissionCriterion[];
  streak: number;
  success: boolean;
  onSelect: (id: string) => void;
  onRestart: () => void;
}

export function MissionPanel({ missions, activeId, solvedIds, criteria, streak, success, onSelect, onRestart }: Props) {
  const mission = missions.find((m) => m.id === activeId) ?? missions[0];
  const [hintsShown, setHintsShown] = useState(0);
  const [lastId, setLastId] = useState(mission.id);
  if (lastId !== mission.id) {
    setLastId(mission.id);
    setHintsShown(0);
  }
  const solvedCount = missions.filter((m) => solvedIds.includes(m.id)).length;

  return (
    <section className={s.missions} aria-label="Simulator-Missionen">
      <div className={s.missionHead}>
        <div>
          <h3 className={s.h3}>Missionen</h3>
          <span className={s.muted}>
            {solvedCount} von {missions.length} gelöst
          </span>
        </div>
        <ProgressBar value={solvedCount / missions.length} label="Missionsfortschritt" className={s.missionProgress} />
      </div>
      <ul className={s.missionList}>
        {missions.map((m, i) => {
          const solved = solvedIds.includes(m.id);
          return (
            <li key={m.id}>
            <button
              type="button"
              className={cx(s.missionItem, m.id === mission.id && s.missionActive, solved && s.missionSolved)}
              onClick={() => onSelect(m.id)}
              aria-current={m.id === mission.id ? 'true' : undefined}
            >
              <span className={s.missionNo}>{solved ? <Icon name="check" size={14} /> : i + 1}</span>
              <span className={s.missionText}>
                <strong>{m.title}</strong>
                <small>{m.short}</small>
              </span>
            </button>
            </li>
          );
        })}
      </ul>

      <div className={cx(s.missionCard, success && s.missionCardSuccess)}>
        <div className={s.missionCardHead}>
          <h4 className={s.h4}>
            <Icon name={success ? 'trophy' : 'target'} size={18} /> {mission.title}
          </h4>
          <Chip tone="primary" icon="user">
            {mission.patientLabel}
          </Chip>
        </div>
        <p className={s.goal}>{mission.goal}</p>

        <ul className={s.criteria} aria-label="Zielkriterien">
          {criteria.map((c) => (
            <li key={c.label} className={c.ok ? s.critOk : s.critOpen}>
              <Icon name={c.ok ? 'check' : 'x'} size={14} />
              <span>{c.label}</span>
              <span className={s.critValue}>{c.value}</span>
            </li>
          ))}
        </ul>

        {!success && (
          <div className={s.streak} aria-live="polite">
            <span>
              Ziel gehalten: {Math.min(streak, REQUIRED_BREATHS)} / {REQUIRED_BREATHS} Atemzüge
            </span>
            <ProgressBar value={Math.min(streak, REQUIRED_BREATHS) / REQUIRED_BREATHS} label="Atemzüge im Zielbereich" />
          </div>
        )}

        {success ? (
          <div className={s.debrief} role="status">
            <div className={s.debriefTitle}>
              <Icon name="sparkles" size={18} /> Mission erfüllt!
            </div>
            <p>{mission.debrief}</p>
          </div>
        ) : (
          <div className={s.hints}>
            {mission.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className={s.hint}>
                <Icon name="lightbulb" size={16} />
                <span>{h}</span>
              </div>
            ))}
            {hintsShown < mission.hints.length && (
              <Button variant="soft" size="sm" icon="lightbulb" onClick={() => setHintsShown((n) => n + 1)}>
                {hintsShown === 0 ? 'Hinweis anzeigen' : 'Weiterer Hinweis'}
              </Button>
            )}
          </div>
        )}
        <div className={s.missionActions}>
          <Button variant="ghost" size="sm" icon="reset" onClick={onRestart}>
            Mission neu starten
          </Button>
        </div>
      </div>
    </section>
  );
}
