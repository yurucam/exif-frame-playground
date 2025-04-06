import { create } from "zustand";

interface LayoutState {
  // 상태
  isMobile: boolean;
  isTablet: boolean;
  isResizing: boolean;
  splitPosition: number;

  // 액션
  setIsMobile: (isMobile: boolean) => void;
  setIsTablet: (isTablet: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setSplitPosition: (position: number) => void;
}

export const useLayoutStore = create<LayoutState>()((set, get) => ({
  // 초기 상태
  isMobile: false,
  isTablet: false,
  isResizing: false,
  splitPosition: 50, // % 단위

  // 액션
  setIsMobile: (isMobile) => set({ isMobile }),
  setIsTablet: (isTablet) => set({ isTablet }),
  setIsResizing: (isResizing) => set({ isResizing }),
  setSplitPosition: (position) => set({ splitPosition: position }),
}));
