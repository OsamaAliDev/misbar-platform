import { useCallback, useEffect, useRef, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import { ALL_CATEGORY_ID, getExperimentById } from './data/experiments.js';
import { VIEWS, useNavigation } from './state/navigation.jsx';
import CatalogView from './views/CatalogView.jsx';
import DashboardView from './views/DashboardView.jsx';
import PlaygroundView from './views/PlaygroundView.jsx';

const SITE_NAME = 'مِسبار';

/** Browser-tab title for the current route. */
function documentTitleFor(view, params) {
  if (view === VIEWS.PLAYGROUND) {
    const experiment = getExperimentById(params.experimentId);
    return `${experiment ? experiment.title : 'ساحة التجارب'} | ${SITE_NAME}`;
  }
  if (view === VIEWS.DASHBOARD) return `لوحة المعلم وولي الأمر | ${SITE_NAME}`;
  return `${SITE_NAME} | مكتبة التجارب التفاعلية`;
}

/**
 * <App /> — application shell.
 *
 * Renders the shared header and exactly one of the three views. The
 * catalog's search/filter state lives here so it survives a round trip to
 * the Playground or Dashboard placeholder.
 */
export default function App() {
  const { view, params, navigate } = useNavigation();
  const [catalogFilters, setCatalogFilters] = useState({ query: '', category: ALL_CATEGORY_ID });

  const updateCatalogFilters = useCallback(
    (patch) => setCatalogFilters((current) => ({ ...current, ...patch })),
    [],
  );

  const openCatalog = useCallback(() => navigate(VIEWS.CATALOG), [navigate]);
  const openDashboard = useCallback(() => navigate(VIEWS.DASHBOARD), [navigate]);
  const openPlayground = useCallback(
    (experimentId) => navigate(VIEWS.PLAYGROUND, { experimentId }),
    [navigate],
  );

  // A key that changes whenever the visible screen changes.
  const routeKey = view === VIEWS.PLAYGROUND ? `${view}/${params.experimentId}` : view;

  // On every screen change (not on first load): update the tab title, scroll
  // to the top and move keyboard/screen-reader focus to the new heading.
  const isFirstRender = useRef(true);
  useEffect(() => {
    document.title = documentTitleFor(view, params);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById('view-heading')?.focus({ preventScroll: true });
  }, [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  let content;
  if (view === VIEWS.PLAYGROUND) {
    content = <PlaygroundView experimentId={params.experimentId} onBack={openCatalog} />;
  } else if (view === VIEWS.DASHBOARD) {
    content = <DashboardView onBack={openCatalog} />;
  } else {
    content = (
      <CatalogView
        filters={catalogFilters}
        onFiltersChange={updateCatalogFilters}
        onStartExperiment={openPlayground}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="app-container app-layout">
        <AppHeader onOpenDashboard={openDashboard} isDashboardOpen={view === VIEWS.DASHBOARD} />
        <main key={routeKey} className="app-main view-enter">
          {content}
        </main>
      </div>
    </div>
  );
}
