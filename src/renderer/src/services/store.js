// Thin accessor for the preload IPC bridge exposed on window.store.
// Components import { store } from here instead of reaching for the global,
// which keeps the data-access seam in one place.
export const store = window.store;
