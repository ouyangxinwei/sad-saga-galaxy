export const RESET_GEMS = 9999;

export function createResetState(defaultState) {
  return { ...defaultState, gems: RESET_GEMS };
}

export function persistResetState(storage, key, state) {
  try {
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
