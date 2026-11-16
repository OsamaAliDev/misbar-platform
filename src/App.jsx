import { useCallback, useEffect, useRef, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import GameHeader from './components/GameHeader.jsx';
import PlaygroundView from './components/PlaygroundView.jsx';
import { ALL_CATEGORY_ID, getExperimentById, getExperimentCopy } from './data/experiments.js';
import { useI18n } from './i18n/index.jsx';
import { GAME_VIEWS, VIEWS, useNavigation } from './state/navigation.jsx';
import { useStudent } from './state/student.jsx';
import CatalogView from './views/CatalogView.jsx';
import DashboardView from './views/DashboardView.jsx';
import HeroSelectView from './views/game/HeroSelectView.jsx';
import LobbyView from './views/game/LobbyView.jsx';
import RanksView from './views/game/RanksView.jsx';
import VaultView from './views/game/VaultView.jsx';

/**
 * Screens that need a chosen hero. A first-time student who opens one of
 * them is sent to hero select first. Deep links into the lab and the
 * dashboard are not interrupted (the lab guide falls back to Nour).
 */
const REQUIRES_HERO = new Set([VIEWS.CATALOG, VIEWS.LOBBY, VIEWS.VAULT, VIEWS.RANKS]);

/** Browser-tab title for the current route. */
function documentTitleFor(view, params, t) {
  const site = t('common.siteName');
  if (view === VIEWS.PLAYGROUND) {
    const experiment = getExperimentById(params.experimentId);
    return `${experiment ? getExperimentCopy(t, experiment.id).title : t('lab.notFound.eyebrow')} | ${site}`;
  }
  if (view === VIEWS.DASHBOARD) return `${t('app.dashboardTitle')} | ${site}`;
  if (GAME_VIEWS.includes(view)) return `${t(`game.titles.${view}`)} | ${site}`;
  return `${site} | ${t('app.libraryTitle')}`;
}

/**
 * <App /> — application shell.
 *
 * Renders exactly one view:
 *   catalog & dashboard  default cream, shared app header
 *   playground (lab)     default cream, its own header; fits the viewport on desktop
 *   lobby · heroes ·     default night (explicit theme lives on html, see
 *   vault · ranks        index.css), shared game header
 *
 * The catalog's search/filter state lives here so it survives a round trip
 * to another screen.
 */
export default function App() {
  const { view, params, navigate } = useNavigation();
  const { student } = useStudent();
  const { t } = useI18n();

  const [catalogFilters, setCatalogFilters] = useState({ query: '', category: ALL_CATEGORY_ID });
  const updateCatalogFilters = useCallback(
    (patch) => setCatalogFilters((current) => ({ ...current, ...patch })),
    [],
  );

  const openCatalog = useCallback(() => navigate(VIEWS.CATALOG), [navigate]);
  const openDashboard = useCallback(() => navigate(VIEWS.DASHBOARD), [navigate]);
  const openLobby = useCallback(() => navigate(VIEWS.LOBBY), [navigate]);
  const openPlayground = useCallback(
    (experimentId) => navigate(VIEWS.PLAYGROUND, { experimentId }),
    [navigate],
  );

  // First visit: no hero yet → show hero select right away (no flash of the
  // requested screen) and correct the URL without adding a history entry.
  const mustPickHero = !student.heroId && REQUIRES_HERO.has(view);
  const activeView = mustPickHero ? VIEWS.HEROES : view;
  useEffect(() => {
    if (mustPickHero) navigate(VIEWS.HEROES, {}, { replace: true });
  }, [mustPickHero, navigate]);

  // A key that changes whenever the visible screen changes.
  const routeKey = activeView === VIEWS.PLAYGROUND ? `${activeView}/${params.experimentId}` : activeView;

  // On every screen change (not on first load): update the tab title, scroll
  // to the top and move keyboard/screen-reader focus to the new heading.
  const isFirstRender = useRef(true);
  useEffect(() => {
    document.title = documentTitleFor(activeView, params, t);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById('view-heading')?.focus({ preventScroll: true });
  }, [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  let content;
  switch (activeView) {
    case VIEWS.PLAYGROUND:
      content = <PlaygroundView experimentId={params.experimentId} onBack={openCatalog} />;
      break;
    case VIEWS.DASHBOARD:
      content = <DashboardView onBack={openCatalog} />;
      break;
    case VIEWS.HEROES:
      content = <HeroSelectView onContinue={openLobby} />;
      break;
    case VIEWS.LOBBY:
      content = <LobbyView onEnterLibrary={openCatalog} />;
      break;
    case VIEWS.VAULT:
      content = <VaultView />;
      break;
    case VIEWS.RANKS:
      content = <RanksView />;
      break;
    default:
      content = (
        <CatalogView
          filters={catalogFilters}
          onFiltersChange={updateCatalogFilters}
          onStartExperiment={openPlayground}
        />
      );
  }

  const isPlayground = activeView === VIEWS.PLAYGROUND;
  const isGame = GAME_VIEWS.includes(activeView);

  let header = null;
  if (isGame) header = <GameHeader currentView={activeView} />;
  else if (!isPlayground) {
    header = <AppHeader onOpenDashboard={openDashboard} isDashboardOpen={activeView === VIEWS.DASHBOARD} />;
  }

  const shellClass = ['app-shell', isPlayground && 'app-shell--fit', isGame && 'app-shell--game']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      <div className="app-container app-layout">
        {header}
        <main key={routeKey} className="app-main view-enter">
          {content}
        </main>
      </div>
    </div>
  );
}
