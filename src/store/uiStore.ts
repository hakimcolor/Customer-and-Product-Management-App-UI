import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  sidebarCollapsed: boolean;
  activeBranch: string;
  activeBranchName: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setBranch: (id: string, name: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeBranch: 'all',
      activeBranchName: 'All Branches',
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setBranch: (id, name) =>
        set({ activeBranch: id, activeBranchName: name }),
    }),
    { name: 'ui-storage' }
  )
);
