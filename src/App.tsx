import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '@/state/progress';
import { AppShell } from '@/components/layout/AppShell';
import HomePage from '@/pages/HomePage';

// Unterseiten lazy laden → kleineres Start-Bundle
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ModulePage = lazy(() => import('@/pages/ModulePage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const TrainingPage = lazy(() => import('@/pages/TrainingPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * Routen (HashRouter → funktioniert auf jedem statischen Hosting):
 *   /                                   Startseite / Dashboard
 *   /katalog[?kategorie=<id>]           Alle Geräte & Kategorien
 *   /modul/:moduleId                    Modulübersicht (6 Lektionen)
 *   /modul/:moduleId/lektion/:lessonId  Lektion (Lektion 6 = Abschlusstest)
 *   /training                           Quiz- & Spielebereich, Blitzrunde, Simulator-Missionen
 *   /profil                             Statistiken, Abzeichen, Einstellungen
 */
export default function App() {
  return (
    <ProgressProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="katalog" element={<CatalogPage />} />
            <Route path="modul/:moduleId" element={<ModulePage />} />
            <Route path="modul/:moduleId/lektion/:lessonId" element={<LessonPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProgressProvider>
  );
}
