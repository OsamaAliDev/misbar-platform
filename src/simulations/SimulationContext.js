import { createContext, useContext, useEffect } from 'react';

/**
 * SimulationContext
 * ---------------------------------------------------------------------------
 * The Playground owns the run state and the challenge bar; every simulation
 * owns its own parameters and physics. This context is the small contract
 * between them:
 *
 *   running          boolean — is the animation playing?
 *   setRunning(b)    play / pause (simulations may auto-pause, e.g. at the
 *                    end of the track)
 *   toggleRunning()  used by the shared Play/Pause button
 *   reset()          used by the shared "إعادة ضبط" button; the Playground
 *                    remounts the simulation with its default parameters
 *   reportChallenge(met)  a simulation reports whether its challenge
 *                    condition is currently satisfied
 */
export const SimulationContext = createContext(null);

/** Access the Playground ↔ simulation contract. */
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used inside the Playground.');
  return context;
}

/**
 * Report a simulation's challenge condition to the Playground whenever it
 * changes.
 * @param {boolean} met
 */
export function useChallengeReport(met) {
  const { reportChallenge } = useSimulation();
  useEffect(() => {
    reportChallenge(Boolean(met));
  }, [met, reportChallenge]);
}
