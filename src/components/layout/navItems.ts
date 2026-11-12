import type { IconName } from '@/components/ui';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Start', icon: 'home', end: true },
  { to: '/katalog', label: 'Gerätekatalog', icon: 'grid' },
  { to: '/training', label: 'Training', icon: 'gamepad' },
  { to: '/profil', label: 'Profil', icon: 'user' },
];
