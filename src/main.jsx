// Global design-system styles MUST be imported before any component so that
// component stylesheets come later in the cascade and can refine the base
// primitives (.btn, .card, :focus-visible …).
import './index.css';
import './App.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { NavigationProvider } from './state/navigation.jsx';
import { StudentProvider } from './state/student.jsx';

/**
 * Entry point.
 *  - <StudentProvider>    shared student profile (nickname, avatar, stars)
 *  - <NavigationProvider> current view: catalog | playground | dashboard
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StudentProvider>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </StudentProvider>
  </StrictMode>,
);
