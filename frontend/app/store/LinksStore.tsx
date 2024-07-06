import { create } from 'zustand';

interface LinksStore {
  sessionId: string;
  setSessionId: (sessionId: string) => void;

  currentPage: string;
  setCurrentPage: (currentPage: string) => void;

  userLinks: string[];
  addLink: (link: string) => void;
}

export const useLinksStore = create<LinksStore>((set) => ({
  // State Initialization
  sessionId: '',
  currentPage: '',
  userLinks: [],

  // Actions
  setSessionId: (sessionId: string) => set({ sessionId }),

  setCurrentPage: (currentPage: string) => set({ currentPage }),

  addLink: (link: string) => set((state) => ({
    userLinks: [...state.userLinks, link]
  })),
}));
