/**
 * FLAGSTAR STATE MACHINE (v6.0 — Single Control Point)
 * 
 * This is the ONLY entity allowed to control navigation state.
 * UI emits intent → StateMachine enforces truth → UIEngine renders.
 * 
 * States:
 *   PUBLIC_HOME       → Landing page
 *   AUTH_LOGIN         → Login terminal
 *   ADMIN_DASHBOARD    → Admin control center
 *   ADMIN_SETUP_WIZARD → Mandatory provisioning gateway
 *   CUSTOMER_DASHBOARD → Customer terminal
 * 
 * Rules:
 *   - Only StateMachine.transition() can change navigation
 *   - UI components NEVER set window.location.hash directly
 *   - Router only translates URL → state (no side effects)
 */

export type AppState =
  | 'PUBLIC_HOME'
  | 'AUTH_LOGIN'
  | 'ADMIN_DASHBOARD'
  | 'ADMIN_SETUP_WIZARD'
  | 'CUSTOMER_DASHBOARD';

// Route ↔ State mapping (bidirectional)
const ROUTE_MAP: Record<string, AppState> = {
  '/':               'PUBLIC_HOME',
  '/login':          'AUTH_LOGIN',
  '/admin':          'ADMIN_DASHBOARD',
  '/admin/dashboard':'ADMIN_DASHBOARD',
  '/admin/setup':    'ADMIN_SETUP_WIZARD',
  '/customer':       'CUSTOMER_DASHBOARD',
};

const STATE_TO_HASH: Record<AppState, string> = {
  PUBLIC_HOME:        '#/',
  AUTH_LOGIN:         '#/login',
  ADMIN_DASHBOARD:    '#/admin',
  ADMIN_SETUP_WIZARD: '#/admin/setup',
  CUSTOMER_DASHBOARD: '#/customer',
};

type StateListener = (state: AppState) => void;

let _currentState: AppState = 'PUBLIC_HOME';
const _listeners = new Set<StateListener>();

function notify() {
  _listeners.forEach(fn => fn(_currentState));
}

export const StateMachine = {
  /**
   * Returns the current state. Read-only.
   */
  getState: (): AppState => _currentState,

  /**
   * Resolve a hash path to an AppState.
   * Returns null if path is unrecognized.
   */
  resolveRoute: (path: string): AppState | null => {
    const clean = path.replace(/^#/, '').replace(/\/$/, '') || '/';
    return ROUTE_MAP[clean] || null;
  },

  /**
   * SINGLE TRANSITION POINT — the ONLY way to change navigation state.
   * 
   * 1. Loop prevention guard
   * 2. Update internal state
   * 3. Sync hash (without triggering hashchange loop)
   * 4. Notify all subscribers (UIEngine)
   */
  transition: (newState: AppState) => {
    // LOOP PREVENTION: If already in this state, do nothing
    if (_currentState === newState) return;

    _currentState = newState;

    // Sync the URL hash to reflect the new state
    const targetHash = STATE_TO_HASH[newState];
    if (window.location.hash !== targetHash) {
      // Use replaceState to avoid polluting browser history
      history.replaceState(null, '', targetHash);
    }

    notify();
  },

  /**
   * Subscribe to state changes. Returns unsubscribe function.
   */
  subscribe: (listener: StateListener) => {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },
};
