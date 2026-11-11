import { HashRouter, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '@/state/progress';
import { AppShell } from '@/components/layout/AppShell';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ModulePage from '@/pages/ModulePage';
import LessonPage from '@/pages/LessonPage';
import TrainingPage from '@/pages/TrainingPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

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
      <HashRouter>
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
