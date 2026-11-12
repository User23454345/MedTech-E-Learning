import { Component, Suspense, type ReactNode } from 'react';
import s from './WidgetFrame.module.css';

class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className={s.state} role="alert">
        Dieses interaktive Element konnte nicht geladen werden. Bitte lade die Seite neu.
      </div>
    ) : (
      this.props.children
    );
  }
}

/** Lazy-Widget mit Ladezustand und Fehlergrenze. */
export function WidgetFrame({ children, loadingText = 'Interaktives Element wird geladen …' }: { children: ReactNode; loadingText?: string }) {
  return (
    <Boundary>
      <Suspense
        fallback={
          <div className={s.state} aria-busy="true">
            <span className={s.spinner} aria-hidden="true" />
            {loadingText}
          </div>
        }
      >
        {children}
      </Suspense>
    </Boundary>
  );
}
