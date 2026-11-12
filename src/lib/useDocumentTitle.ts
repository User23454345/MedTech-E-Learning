import { useEffect } from 'react';

export const APP_TITLE = 'MedTech Academy';
const DEFAULT_TITLE = `${APP_TITLE} – Medizintechnik verstehen`;

/**
 * Setzt `document.title` für die aktuelle Seite („<Titel> – MedTech Academy“).
 * Ohne Titel wird der Standardtitel verwendet. Beim Verlassen der Seite wird
 * der Standardtitel wiederhergestellt.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} – ${APP_TITLE}` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}
