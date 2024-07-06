import { create } from 'zustand';

interface LinkObject {
  id: string;  // Unique identifier for each link
  platform: string;  // Title or name of the platform
  url: string;  // URL associated with the platform
}

interface LinksStore {
  sessionId: string;
  setSessionId: (sessionId: string) => void;
  currentPage: string;
  setCurrentPage: (currentPage: string) => void;
  userLinks: LinkObject[];  // Array of link objects
  addLink: (link: LinkObject) => void;
  removeLink: (id: string) => void;  // Updated to handle deletion by ID
  editLinkUrl: (id: string, url: string) => void;  // Updated to handle URL update by ID
}

export const useLinksStore = create<LinksStore>((set) => ({
  sessionId: '',
  currentPage: '',
  userLinks: [],

  setSessionId: (sessionId) => set({ sessionId }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  addLink: (link) => set((state) => ({
    userLinks: [...state.userLinks, link]
  })),

  // Remove link by ID
  removeLink: (id) => set((state) => ({
    userLinks: state.userLinks.filter((link) => link.id !== id)
  })),

  // Edit link URL by ID
  editLinkUrl: (id, url) => set((state) => ({
    userLinks: state.userLinks.map((link) => {
      if (link.id === id) {
        return { ...link, url };
      }
      return link;
    })
  })),
}));
