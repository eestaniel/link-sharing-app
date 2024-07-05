import { create } from 'zustand';

interface LinksStore {
  sessionId: string;
  setSessionId: (sessionId: string) => void;

  currentPage: string;
  setCurrentPage: (currentPage: string) => void;
}

export const useLinksStore = create<LinksStore>((set) => ({
  // State Initialization
  sessionId: '',
  currentPage: '',

  // Actions
  setSessionId: (sessionId: string) => set({ sessionId }),
  setCurrentPage: (currentPage: string) => set({ currentPage }),
}));
