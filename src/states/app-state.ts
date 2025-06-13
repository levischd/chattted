import { create } from 'zustand';

interface AppState {
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  setIsLeftSidebarOpen: (isLeftSidebarOpen: boolean) => void;
  setIsRightSidebarOpen: (isRightSidebarOpen: boolean) => void;
}

export const useAppState = create<AppState>((set) => ({
  isLeftSidebarOpen: false,
  isRightSidebarOpen: false,
  setIsLeftSidebarOpen: (isLeftSidebarOpen: boolean) =>
    set({ isLeftSidebarOpen }),
  setIsRightSidebarOpen: (isRightSidebarOpen: boolean) =>
    set({ isRightSidebarOpen }),
}));
