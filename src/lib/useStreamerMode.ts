import { create } from "zustand";

interface StreamerModeState {
  enabled: boolean;
  wordHidden: boolean;
  toggle: () => void;
  showWord: () => void;
  hideWord: () => void;
}

const stored = localStorage.getItem("inkognito-streamer") === "true";

export const useStreamerMode = create<StreamerModeState>((set) => ({
  enabled: stored,
  wordHidden: true,
  toggle: () =>
    set((s) => {
      const next = !s.enabled;
      localStorage.setItem("inkognito-streamer", String(next));
      return { enabled: next, wordHidden: true };
    }),
  showWord: () => set({ wordHidden: false }),
  hideWord: () => set({ wordHidden: true })
}));
