import { Link, NavLink } from 'react-router-dom';
import { Icon, cx } from '@/components/ui';
import { useProgress } from '@/state/progress';
import { LogoMark } from './LogoMark';
import { NAV_ITEMS } from './navItems';
import s from './Header.module.css';

export function Header() {
  const { level, streak, state } = useProgress();
  const pct = Math.round(level.progress * 100);
  const xpLabel = level.xpForNext
    ? `Level ${level.level}, ${level.title}: ${level.xpIntoLevel} von ${level.xpForNext} XP bis zur nächsten Stufe. Zum Profil`
    : `Level ${level.level}, ${level.title}: Höchststufe erreicht. Zum Profil`;

  return (
    <header className={s.header}>
      <div className={cx('container', s.inner)}>
        <Link to="/" className={s.brand} aria-label="MedTech Academy – zur Startseite">
          <LogoMark />
          <span className={s.brandText}>
            MedTech <span className={s.brandAccent}>Academy</span>
          </span>
        </Link>

        <nav className={s.nav} aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cx(s.navLink, isActive && s.navActive)}>
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={s.status}>
          <Link
            to="/profil"
            className={cx(s.streak, streak > 0 && s.streakActive)}
            aria-label={streak > 0 ? `Lernserie: ${streak} ${streak === 1 ? 'Tag' : 'Tage'} in Folge` : 'Noch keine Lernserie – heute starten'}
            title="Lernserie"
          >
            <Icon name="flame" size={18} />
            <span>{streak}</span>
          </Link>
          <Link to="/profil" className={s.xpPill} aria-label={xpLabel} title={`${state.xp} XP gesamt`}>
            <span className={s.lvl}>Lv {level.level}</span>
            <span className={s.xpBody}>
              <span className={s.xpText}>{state.xp} XP</span>
              <span className={s.xpTrack} aria-hidden="true">
                <span className={s.xpFill} style={{ width: `${pct}%` }} />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
