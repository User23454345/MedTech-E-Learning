import { NotFoundView } from './components/NotFoundView';

export default function NotFoundPage() {
  return (
    <NotFoundView code="Fehler 404" title="Diese Seite gibt es (noch) nicht">
      <p>
        Der Link ist möglicherweise veraltet oder die Adresse enthält einen Tippfehler. Kein Grund zur Sorge – dein Lernfortschritt ist sicher
        gespeichert.
      </p>
    </NotFoundView>
  );
}
