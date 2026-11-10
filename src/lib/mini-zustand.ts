/* Minimal zustand-compatible create() so we avoid an extra install.
   Implements the subset we use: create<T>((set, get) => state) with
   useStore(selector?) returning state and useSyncExternalStore. */
import { useSyncExternalStore } from 'react';

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;

export function create<T extends object>(initializer: (set: SetState<T>, get: GetState<T>) => T) {
  let state: T;
  const listeners = new Set<() => void>();
  const set: SetState<T> = (partial) => {
    const next = typeof partial === 'function' ? (partial as (s: T) => Partial<T>)(state) : partial;
    state = { ...state, ...next };
    listeners.forEach(l => l());
  };
  const get: GetState<T> = () => state;
  state = initializer(set, get);

  function useStore<U = T>(selector?: (s: T) => U): U {
    const sel = selector ?? ((s: T) => s as unknown as U);
    return useSyncExternalStore(
      (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
      () => sel(state),
      () => sel(state),
    );
  }
  useStore.getState = get;
  useStore.setState = set as unknown as (partial: Partial<T>) => void;
  return useStore;
}
