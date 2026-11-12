import { NavLink } from 'react-router-dom';
import { Icon, cx } from '@/components/ui';
import { NAV_ITEMS } from './navItems';
import s from './MobileNav.module.css';

const SHORT: Record<string, string> = { '/katalog': 'Katalog' };

/** Untere Tab-Leiste auf kleinen Bildschirmen. */
export function MobileNav() {
  return (
    <nav className={s.bar} aria-label="Hauptnavigation (mobil)">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cx(s.tab, isActive && s.active)} aria-label={item.label}>
          <span className={s.iconWrap}>
            <Icon name={item.icon} size={22} />
          </span>
          <span className={s.label}>{SHORT[item.to] ?? item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
