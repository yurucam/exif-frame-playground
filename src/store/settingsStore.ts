import { create } from "zustand";
import { persist } from "zustand/middleware";

// 설정 타입 정의
export interface Settings {
  tabSize: number;
  previewPosition: "auto" | "right" | "left" | "bottom" | "top";
}

interface SettingsState {
  // 상태
  settings: Settings;
  isSettingsOpen: boolean;

  // 액션
  updateSettings: (settings: Settings) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

// 설정 기본값
const DEFAULT_SETTINGS: Settings = {
  tabSize: 2,
  previewPosition: "auto",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 초기 상태
      settings: DEFAULT_SETTINGS,
      isSettingsOpen: false,

      // 액션
      updateSettings: (settings: Settings) => set({ settings }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
    }),
    {
      name: "svg-playground-settings", // 로컬 스토리지에 저장될 키 이름
      partialize: (state) => ({ settings: state.settings }), // 영구 저장할 상태만 선택
    }
  )
);
