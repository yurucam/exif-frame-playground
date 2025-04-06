import { create } from "zustand";

// 페이지 타입 정의
export type PageType = "editor" | "examples";

interface PageState {
  // 상태
  activePage: PageType;

  // 액션
  setActivePage: (page: PageType) => void;
}

export const usePageStore = create<PageState>()((set) => ({
  // 초기 상태
  activePage: "editor",

  // 액션
  setActivePage: (page) => set({ activePage: page }),
}));
