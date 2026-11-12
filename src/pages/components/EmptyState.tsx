import type { ReactNode } from 'react';
import { IconBadge, type IconName } from '@/components/ui';
import s from './EmptyState.module.css';

export function EmptyState({ icon, title, children, action }: { icon: IconName; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      <IconBadge name={icon} size={56} />
      <h3 className={s.title}>{title}</h3>
      {children && <div className={s.text}>{children}</div>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}
