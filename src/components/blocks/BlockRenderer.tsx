/**
 * Rendert die typisierten Inhaltsblöcke einer Lektion.
 * Interaktive Blöcke (Quiz, Spiele, Widgets) delegieren an die Features.
 */
import { Suspense, Component, type ReactNode } from 'react';
import type { Block, CalloutVariant, DeviceModule } from '@/types/content';
import { Icon, type IconName } from '@/components/ui';
import { InlineMd, Markdown } from './Markdown';
import { WIDGETS } from '@/features/widgets';
import { QuizBlock } from '@/features/quiz/QuizBlock';
import { MatchingGameView } from '@/features/games/MatchingGameView';
import { OrderingGameView } from '@/features/games/OrderingGameView';
import { FaultFinderView } from '@/features/games/FaultFinderView';
import { CaseRunner } from '@/features/games/CaseRunner';
import s from './blocks.module.css';

const CALLOUT: Record<CalloutVariant, { icon: IconName; label: string }> = {
  info: { icon: 'info', label: 'Hinweis' },
  clinical: { icon: 'stethoscope', label: 'Aus der Praxis' },
  warning: { icon: 'alert', label: 'Patientensicherheit' },
  model: { icon: 'layers', label: 'Modell vs. Realität' },
  deep: { icon: 'flask', label: 'Vertiefung' },
  remember: { icon: 'lightbulb', label: 'Merke' },
};

class WidgetBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? <div className={s.widgetLoading}>Dieses interaktive Element konnte nicht geladen werden.</div> : this.props.children;
  }
}

export function BlockView({ block, module, contextId }: { block: Block; module: DeviceModule; contextId: string }) {
  switch (block.type) {
    case 'text':
      return <Markdown md={block.md} className={s.prose} />;
    case 'heading':
      return <h3 className={s.heading}>{block.text}</h3>;
    case 'callout': {
      const c = CALLOUT[block.variant];
      return (
        <aside className={`${s.callout} ${s[`co-${block.variant}`] ?? ''}`}>
          <Icon name={c.icon} size={22} className={s.calloutIcon} />
          <div>
            <div className={s.calloutLabel}>{c.label}</div>
            {block.title && <div className={s.calloutTitle}>{block.title}</div>}
            <Markdown md={block.md} className={s.prose} />
          </div>
        </aside>
      );
    }
    case 'keyTerms':
      return (
        <dl className={s.terms}>
          {block.terms.map((t) => (
            <div key={t.term} className={s.term}>
              <dt className={s.termName}>
                <InlineMd text={t.term} />
              </dt>
              <dd className={s.termDef} style={{ margin: 0 }}>
                <InlineMd text={t.definition} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'formula':
      return (
        <figure className={s.formula} style={{ margin: 0 }}>
          <div className={s.formulaExpr} aria-label={`Formel: ${block.expression}`}>
            <InlineMd text={block.expression} />
          </div>
          <figcaption className={s.formulaBody}>
            <Markdown md={block.explanation} className={s.prose} />
            {block.variables && (
              <div className={s.vars}>
                {block.variables.map((v) => (
                  <div key={v.symbol} style={{ display: 'contents' }}>
                    <span className={s.varSym}>
                      <InlineMd text={v.symbol} />
                    </span>
                    <span>
                      <InlineMd text={v.meaning} />
                    </span>
                    <span className={s.varUnit}>{v.unit ? <InlineMd text={v.unit} /> : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </figcaption>
        </figure>
      );
    case 'steps':
      return (
        <div>
          {block.title && <h4>{block.title}</h4>}
          <ol className={s.steps}>
            {block.steps.map((st, i) => (
              <li key={i} className={s.step}>
                <div className={s.stepTitle}>
                  <InlineMd text={st.title} />
                </div>
                <Markdown md={st.md} className={s.prose} />
              </li>
            ))}
          </ol>
        </div>
      );
    case 'facts':
      return (
        <div className={s.facts}>
          {block.items.map((f, i) => (
            <div key={i} className={s.fact}>
              <div className={s.factValue}>
                <InlineMd text={f.value} />
              </div>
              <div className={s.factLabel}>
                <InlineMd text={f.label} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className={s.tableWrap}>
          <table className={s.table}>
            {block.caption && <caption>{block.caption}</caption>}
            <thead>
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col">
                    <InlineMd text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <InlineMd text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'widget': {
      const W = WIDGETS[block.widget];
      if (!W) return <div className={s.widgetLoading}>Unbekanntes Widget „{block.widget}“</div>;
      return (
        <figure className={s.widget} style={{ marginBlock: 0 }}>
          <WidgetBoundary>
            <Suspense fallback={<div className={s.widgetLoading}>Interaktives Element wird geladen …</div>}>
              <W {...(block.props ?? {})} />
            </Suspense>
          </WidgetBoundary>
          {block.caption && <figcaption className={s.widgetCaption}>{block.caption}</figcaption>}
        </figure>
      );
    }
    case 'quiz':
      return <QuizBlock title={block.title} questions={block.questions} contextId={contextId} />;
    case 'matching':
      return <MatchingGameView game={block.game} />;
    case 'ordering':
      return <OrderingGameView game={block.game} />;
    case 'faultFinder':
      return <FaultFinderView game={block.game} />;
    case 'case':
      return <CaseRunner data={block.case} />;
    case 'sources': {
      const list = block.ids.map((id) => module.sources.find((x) => x.id === id)).filter(Boolean);
      return (
        <ol className={s.sources}>
          {list.map((src) => (
            <li key={src!.id}>
              <span className={s.srcKind}>{src!.kind}</span>
              {src!.url ? (
                <a href={src!.url} target="_blank" rel="noopener noreferrer">
                  {src!.label}
                </a>
              ) : (
                src!.label
              )}
              {src!.detail && <span className="muted"> · {src!.detail}</span>}
            </li>
          ))}
        </ol>
      );
    }
  }
}

export function BlockList({ blocks, module, contextId }: { blocks: Block[]; module: DeviceModule; contextId: string }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} module={module} contextId={`${contextId}#${i}`} />
      ))}
    </div>
  );
}
