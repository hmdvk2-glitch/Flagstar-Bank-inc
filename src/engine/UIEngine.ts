import { useState, useEffect } from 'react';
import { StateMachine, AppState } from './StateMachine';

/**
 * UIEngine Hook (v6.0)
 * 
 * Reactive binding between StateMachine state and React rendering.
 * Components use this hook to determine what to render.
 * Components NEVER navigate directly — they call StateMachine.transition().
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(StateMachine.getState());

  useEffect(() => {
    return StateMachine.subscribe(setState);
  }, []);

  return state;
}
