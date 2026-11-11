// STUB – wird ausgearbeitet (Header, Navigation, Footer).
import { Outlet } from 'react-router-dom';
import { ToastViewport } from '@/components/ui';

export function AppShell() {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <ToastViewport />
    </>
  );
}
