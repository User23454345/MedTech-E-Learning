import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Icon, Segmented, cx } from '@/components/ui';
import { ALL_MODULES } from '@/data/modules';
import { CATEGORIES, categoryById } from '@/data/categories';
import type { DeviceModule } from '@/types/content';
import { ModuleCard } from './components/ModuleCard';
import { EmptyState } from './components/EmptyState';
import s from './CatalogPage.module.css';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

type LevelFilter = 'alle' | DeviceModule['level'];
const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'Einsteiger', label: 'Einsteiger' },
  { value: 'Fortgeschritten', label: 'Fortgeschritten' },
  { value: 'Experte', label: 'Experte' },
];

const norm = (t: string) => t.toLocaleLowerCase('de').normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function CatalogPage() {
  useDocumentTitle('Gerätekatalog');
  const [params, setParams] = useSearchParams();
  const catParam = params.get('kategorie');
  const activeCat = catParam && categoryById(catParam) ? catParam : null;
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<LevelFilter>('alle');

  const setCategory = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('kategorie', id);
    else next.delete('kategorie');
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return ALL_MODULES.filter((m) => {
      if (activeCat && m.category !== activeCat) return false;
      if (level !== 'alle' && m.level !== level) return false;
      if (!q) return true;
      const cat = categoryById(m.category);
      return norm([m.title, m.shortTitle, m.tagline, m.description, cat?.name ?? ''].join(' ')).includes(q);
    }).sort((a, b) => (a.status === b.status ? 0 : a.status === 'available' ? -1 : 1));
  }, [query, activeCat, level]);

  const availableCount = ALL_MODULES.filter((m) => m.status === 'available').length;
  const activeCategory = activeCat ? categoryById(activeCat) : null;
  const hasFilters = !!activeCat || level !== 'alle' || !!query.trim();

  return (
    <div className="container">
      <header className={s.header}>
        <div className="eyebrow">Gerätekatalog</div>
        <h1>{activeCategory ? activeCategory.name : 'Alle Medizingeräte'}</h1>
        <p className={s.lead}>
          {activeCategory
            ? activeCategory.description
            : `${ALL_MODULES.length} Lernmodule in ${CATEGORIES.length} Kategorien – ${availableCount} davon bereits verfügbar, weitere sind in Vorbereitung.`}
        </p>
      </header>

      <div className={s.toolbar}>
        <label className={s.search}>
          <Icon name="search" size={18} className={s.searchIcon} />
          <span className="visually-hidden">Geräte durchsuchen</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gerät, Thema oder Stichwort suchen …"
            className={s.searchInput}
          />
        </label>
        <Segmented value={level} onChange={setLevel} options={LEVEL_OPTIONS} label="Nach Niveau filtern" />
      </div>

      <div className={s.chips} role="group" aria-label="Nach Kategorie filtern">
        <button type="button" className={cx(s.chip, !activeCat && s.chipActive)} aria-pressed={!activeCat} onClick={() => setCategory(null)}>
          Alle Kategorien
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={cx(s.chip, activeCat === c.id && s.chipActive)}
            aria-pressed={activeCat === c.id}
            onClick={() => setCategory(activeCat === c.id ? null : c.id)}
          >
            <Icon name={c.icon} size={16} />
            {c.name}
          </button>
        ))}
      </div>

      <p className={s.count} aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'Modul' : 'Module'} gefunden
      </p>

      {filtered.length ? (
        <div className={s.grid}>
          {filtered.map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="search"
          title="Keine passenden Module"
          action={
            hasFilters && (
              <Button
                variant="secondary"
                icon="reset"
                onClick={() => {
                  setQuery('');
                  setLevel('alle');
                  setCategory(null);
                }}
              >
                Filter zurücksetzen
              </Button>
            )
          }
        >
          <p>Versuche einen anderen Suchbegriff oder entferne einzelne Filter.</p>
        </EmptyState>
      )}
    </div>
  );
}
