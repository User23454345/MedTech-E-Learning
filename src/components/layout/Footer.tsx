import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui';
import { LogoMark } from './LogoMark';
import s from './Footer.module.css';

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className="container">
        <div className={s.top}>
          <div className={s.mission}>
            <div className={s.brand}>
              <LogoMark size={28} />
              <span>MedTech Academy</span>
            </div>
            <p>
              Medizintechnik verständlich machen – für Studierende, Auszubildende, Medizintechniker:innen und klinisches Personal. Wir verbinden
              physikalische Grundlagen, Geräteaufbau und klinische Praxis zu Wissen, das im Alltag trägt.
            </p>
          </div>
          <nav className={s.links} aria-label="Fußzeilennavigation">
            <Link to="/katalog">Gerätekatalog</Link>
            <Link to="/training">Quiz- &amp; Spielebereich</Link>
            <Link to="/profil">Mein Fortschritt</Link>
          </nav>
        </div>
        <p className={s.disclaimer}>
          <Icon name="info" size={16} />
          <span>
            Lerninhalte dienen der Ausbildung und ersetzen keine Geräteeinweisung nach MPBetreibV, Gebrauchsanweisung oder ärztliche Anordnung.
          </span>
        </p>
        <p className={s.copy}>© {new Date().getFullYear()} MedTech Academy · Lernfortschritt wird nur lokal in deinem Browser gespeichert.</p>
      </div>
    </footer>
  );
}
