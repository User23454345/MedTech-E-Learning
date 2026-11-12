/**
 * Auswertung des Abschlusstests: Score-Ring, Bestanden/Nicht bestanden,
 * Themenbalken, Wiederholungsempfehlungen und Fragenreview.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { DeviceModule, Exam } from '@/types/content';
import { useProgress } from '@/state/progress';
import { Button, ButtonLink, Card, Chip, Icon, Segmented, cx } from '@/components/ui';
import { InlineMd } from '@/components/blocks/Markdown';
import { ResultPanel, formatTime } from '@/features/games/GameShell';
import { QuestionView } from './QuestionView';
import { answerText, isCorrect, type Answer, type PreparedQuestion } from './quizLogic';
import s from './Exam.module.css';

export interface ExamOutcome {
  items: PreparedQuestion[];
  answers: (Answer | null)[];
  correctCount: number;
  score: number;
  passed: boolean;
  topicScores: Record<string, [number, number]>;
  firstPass: boolean;
  newBest: boolean;
  durationMs: number;
}

export function ExamResultView({ module, exam, outcome, onRetry }: { module: DeviceModule; exam: Exam; outcome: ExamOutcome; onRetry: () => void }) {
  const { state } = useProgress();
  const [filter, setFilter] = useState<'alle' | 'falsch'>('alle');
  const [openId, setOpenId] = useState<string | null>(null);
  const { items, answers, correctCount, score, passed } = outcome;
  const record = state.exams[module.id];

  const topicRows = Object.entries(outcome.topicScores)
    .map(([topic, [ok, total]]) => ({ topic, ok, total, ratio: total ? ok / total : 0 }))
    .sort((a, b) => a.ratio - b.ratio);

  // Schwache Themen → Lektionen (dedupliziert)
  const weak = topicRows.filter((r) => r.ratio < exam.passScore);
  const recs: { lessonId: string; title: string; number: number; topics: string[] }[] = [];
  for (const r of weak) {
    const lessonId = exam.topicLessons[r.topic];
    const lesson = lessonId ? module.lessons.find((l) => l.id === lessonId) : undefined;
    if (!lesson) continue;
    const existing = recs.find((x) => x.lessonId === lesson.id);
    if (existing) existing.topics.push(r.topic);
    else recs.push({ lessonId: lesson.id, title: lesson.title, number: lesson.number, topics: [r.topic] });
  }

  const reviewIdx = items.map((_, i) => i).filter((i) => filter === 'alle' || !isCorrect(items[i].question, answers[i]));
  const wrongCount = items.length - correctCount;

  return (
    <div className={s.result}>
      <Card className={cx(s.resultCard, passed ? s.passed : s.failed)}>
        <ResultPanel
          score={score}
          heading={passed ? 'Bestanden!' : 'Noch nicht bestanden'}
          message={
            passed ? (
              <>
                Glückwunsch – du hast den Abschlusstest „{module.shortTitle}“ erfolgreich absolviert.
                {outcome.firstPass && ` Bonus: +${exam.xp} XP.`}
              </>
            ) : (
              <>
                Für das Bestehen sind {Math.round(exam.passScore * 100)} % nötig. Nutze die Empfehlungen unten, um gezielt zu wiederholen – beim nächsten
                Versuch werden neue Fragen gezogen.
              </>
            )
          }
          stats={[
            { label: 'Richtig', value: `${correctCount} / ${items.length}` },
            { label: 'Dauer', value: formatTime(outcome.durationMs) },
            { label: 'Bestwert', value: `${Math.round((record?.bestScore ?? score) * 100)} %` },
            { label: 'Versuche', value: record?.attempts ?? 1 },
          ]}
          actions={
            <>
              <Button icon="refresh" onClick={onRetry}>
                Neuer Versuch
              </Button>
              <ButtonLink variant="secondary" to={`/modul/${module.id}`} icon="layers">
                Zur Modulübersicht
              </ButtonLink>
            </>
          }
        >
          <div className={s.badges}>
            <Chip tone={passed ? 'success' : 'danger'} icon={passed ? 'award' : 'alert'}>
              {passed ? 'Bestanden' : 'Nicht bestanden'}
            </Chip>
            {outcome.newBest && (
              <Chip tone="xp" icon="trophy">
                Neuer Bestwert
              </Chip>
            )}
          </div>
        </ResultPanel>
      </Card>

      <div className={s.resultGrid}>
        <Card>
          <h3 className={s.sectionTitle}>
            <Icon name="chart" size={18} /> Ergebnis nach Themen
          </h3>
          <ul className={s.topics}>
            {topicRows.map((r) => {
              const ok = r.ratio >= exam.passScore;
              return (
                <li key={r.topic} className={s.topicRow}>
                  <div className={s.topicHead}>
                    <span className={s.topicName}>
                      <Icon name={ok ? 'check' : 'alert'} size={14} className={ok ? s.okIcon : s.warnIcon} />
                      {r.topic}
                    </span>
                    <span className={s.topicVal}>
                      {r.ok}/{r.total}
                    </span>
                  </div>
                  <div
                    className={s.topicBar}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(r.ratio * 100)}
                    aria-label={`${r.topic}: ${Math.round(r.ratio * 100)} Prozent`}
                  >
                    <div className={cx(s.topicFill, !ok && s.topicFillWeak)} style={{ width: `${Math.max(3, r.ratio * 100)}%` }} />
                    <span className={s.passMark} style={{ left: `${exam.passScore * 100}%` }} aria-hidden />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h3 className={s.sectionTitle}>
            <Icon name="lightbulb" size={18} /> Empfehlungen
          </h3>
          {recs.length === 0 ? (
            <p className={s.muted}>
              {weak.length === 0
                ? 'In allen Themen liegst du über der Bestehensgrenze. Stark! Vertiefe dein Wissen im Training-Bereich.'
                : 'Wiederhole die markierten Themen in den Lektionen dieses Moduls.'}
            </p>
          ) : (
            <ul className={s.recs}>
              {recs.map((r) => (
                <li key={r.lessonId}>
                  <Link className={s.rec} to={`/modul/${module.id}/lektion/${r.lessonId}`}>
                    <span className={s.recNum}>{r.number}</span>
                    <span className={s.recBody}>
                      <strong>{r.title}</strong>
                      <span className={s.muted}>Wiederholen: {r.topics.join(', ')}</span>
                    </span>
                    <Icon name="arrowRight" size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className={s.reviewHead}>
          <h3 className={s.sectionTitle}>
            <Icon name="eye" size={18} /> Fragen im Rückblick
          </h3>
          <Segmented
            label="Fragen filtern"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'alle', label: `Alle (${items.length})` },
              { value: 'falsch', label: `Nur falsche (${wrongCount})` },
            ]}
          />
        </div>
        {reviewIdx.length === 0 ? (
          <p className={s.muted}>Keine falschen Antworten – hervorragend!</p>
        ) : (
          <ol className={s.review}>
            {reviewIdx.map((i) => {
              const it = items[i];
              const ok = isCorrect(it.question, answers[i]);
              const open = openId === it.question.id;
              const panelId = `rv-${it.question.id}`;
              return (
                <li key={it.question.id} className={cx(s.rvItem, ok ? s.rvOk : s.rvBad)}>
                  <button type="button" className={s.rvToggle} aria-expanded={open} aria-controls={panelId} onClick={() => setOpenId(open ? null : it.question.id)}>
                    <span className={s.rvStatus} aria-hidden>
                      <Icon name={ok ? 'check' : 'x'} size={16} strokeWidth={2.4} />
                    </span>
                    <span className={s.rvBody}>
                      <span className={s.rvNum}>
                        Frage {i + 1} · {it.question.topic}
                        <span className="visually-hidden">{ok ? ', richtig beantwortet' : ', falsch beantwortet'}</span>
                      </span>
                      <span className={s.rvPrompt}>
                        <InlineMd text={it.question.prompt} />
                      </span>
                      {!open && (
                        <span className={s.rvAnswer}>
                          Deine Antwort: <InlineMd text={answerText(it.question, answers[i])} />
                        </span>
                      )}
                    </span>
                    <Icon name="chevronDown" size={18} className={cx(s.chev, open && s.chevOpen)} />
                  </button>
                  {open && (
                    <div id={panelId} className={s.rvPanel}>
                      <QuestionView question={it.question} order={it.order} answer={answers[i]} mode="review" headingLevel="p" hidePrompt />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
