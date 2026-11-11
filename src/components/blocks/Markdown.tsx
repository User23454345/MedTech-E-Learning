/**
 * Minimaler, sicherer Markdown-Renderer (kein dangerouslySetInnerHTML).
 *
 * Unterstützt:
 *  - Absätze (Leerzeile), Zeilenumbruch innerhalb eines Absatzes = Leerzeichen
 *  - Listen: "- " / "* " und "1. "
 *  - **fett**, *kursiv*, `code`, [Link](url)
 *  - Tiefgestellt ~x~ (z. B. F~I~O~2~, cmH~2~O) und hochgestellt ^x^ (z. B. m^2^)
 */
import { Fragment, type ReactNode } from 'react';

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|~[^~\s]+~|\^[^^\s]+\^)/g;

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const parts = text.split(INLINE);
  return parts.map((p, i) => {
    const k = `${keyPrefix}-${i}`;
    if (!p) return null;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={k}>{renderInline(p.slice(2, -2), k)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={k}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={k}>{renderInline(p.slice(1, -1), k)}</em>;
    if (p.startsWith('~') && p.endsWith('~') && p.length > 2) return <sub key={k}>{p.slice(1, -1)}</sub>;
    if (p.startsWith('^') && p.endsWith('^') && p.length > 2) return <sup key={k}>{p.slice(1, -1)}</sup>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
    if (link) {
      const href = link[2];
      const external = /^https?:/.test(href);
      return (
        <a key={k} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {link[1]}
        </a>
      );
    }
    return <Fragment key={k}>{p}</Fragment>;
  });
}

export function Markdown({ md, className }: { md: string; className?: string }) {
  const blocks = md.trim().split(/\n\s*\n/);
  return (
    <div className={className}>
      {blocks.map((b, bi) => {
        const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length && lines.every((l) => /^[-*] /.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.slice(2), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.length && lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\d+\. /, ''), `${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={bi}>{renderInline(lines.join(' '), `${bi}`)}</p>;
      })}
    </div>
  );
}

/** Inline-Variante ohne umschließenden Absatz (für Fragen, Optionen, Labels). */
export function InlineMd({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
