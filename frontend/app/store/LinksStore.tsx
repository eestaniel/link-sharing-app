import {create} from 'zustand';
import {Jsonify} from "@remix-run/server-runtime/dist/jsonify"


interface LinkObject {
  id: string;  // Unique identifier for each link
  platform: string;  // Title or name of the platform
  url: string;  // URL associated with the platform
}


interface LinksStore {
  editUserDetails: any
  sessionId: string;
  setSessionId: (sessionId: string) => void;
  currentPage: string;
  setCurrentPage: (currentPage: string) => void;
  previousPage: string;
  setPreviousPage: (previousPage: string) => void;
  userDetails: UserObject;
  userLinks: LinkObject[];  // Array of link objects
  setUserLinks: (links: Link[]) => void;  // Updated to handle setting links
  addLink: (link: LinkObject) => void;
  removeLink: (id: string) => void;  // Updated to handle deletion by ID
  editLinkUrl: (id: string, url: string) => void;  // Updated to handle URL
                                                   // update by ID
  editLinkPlatform: (id: string, platform: string) => void;  // New function to
                                                             // handle platform
                                                             // update by ID
  setUserDetails: (details: Jsonify<ProfileLoaderData["profile"]>) => void;
  showToast: boolean;
  setShowToast: (showToast: boolean) => void;
}


export const useLinksStore = create<LinksStore>((set) => ({
  sessionId: '',
  currentPage: '',
  previousPage: '',
  userLinks: [],
  userDetails: {
    first_name: '',
    last_name: '',
    email: ''
  },
  showToast: false,

  editUserDetails: (details: any) => set({userDetails: details}),

  setSessionId: (sessionId) => set({sessionId}),
  setCurrentPage: (currentPage) => set({currentPage}),
  setPreviousPage: (previousPage) => set({previousPage}),

  setUserLinks: (links) => set({userLinks: links}),

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
        return {...link, url};
      }
      return link;
    })
  })),

  // Edit link platform by ID
  editLinkPlatform: (id, platform) => set((state) => ({
    userLinks: state.userLinks.map((link) => {
      if (link.id === id) {
        return {...link, platform};
      }
      return link;
    })

  })),

  setUserDetails: (details) => set({userDetails: details}),

  setShowToast: (showToast) => set({showToast}),

}));

