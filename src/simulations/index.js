import FractionsSimulation from './FractionsSimulation.jsx';
import LeverSimulation from './LeverSimulation.jsx';
import MotionSimulation from './MotionSimulation.jsx';
import OpticsSimulation from './OpticsSimulation.jsx';
import OrbitSimulation from './OrbitSimulation.jsx';
import StatesOfMatterSimulation from './StatesOfMatterSimulation.jsx';

/**
 * Simulation registry — experiment id (src/data/experiments.js) → simulation.
 *
 *   Component  the simulation (renders <SimulationWorkspace />)
 *   autoPlay   start animating as soon as the Playground opens?
 *              (the cart and the counting animation wait for the student)
 */
const SIMULATIONS = {
  'motion-acceleration': { Component: MotionSimulation, autoPlay: false },
  'lever-balance': { Component: LeverSimulation, autoPlay: true },
  'planet-orbits': { Component: OrbitSimulation, autoPlay: true },
  'fractions-area': { Component: FractionsSimulation, autoPlay: false },
  'light-refraction': { Component: OpticsSimulation, autoPlay: true },
  'matter-states': { Component: StatesOfMatterSimulation, autoPlay: true },
};

/**
 * @param {string} experimentId
 * @returns {{ Component: import('react').ComponentType, autoPlay: boolean } | null}
 */
export function getSimulation(experimentId) {
  return SIMULATIONS[experimentId] ?? null;
}
