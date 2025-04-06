import { create } from "zustand";
import { useSettingsStore } from "./settingsStore";

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

  // 레이아웃 계산 도우미
  getPreviewLayout: () => {
    containerDirection: string;
    editorDimension: string;
    previewDimension: string;
    flexDirection: React.CSSProperties["flexDirection"];
  };
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

  // 레이아웃 계산 도우미 함수
  getPreviewLayout: () => {
    const { isMobile, isTablet } = get();
    // 설정 스토어에서 직접 값을 호출할 때 발생할 수 있는 순환 참조 방지
    const settings = useSettingsStore.getState().settings;
    const previewPosition = settings.previewPosition;

    // 모바일/태블릿에서는 항상 수직 레이아웃
    if (isMobile || isTablet) {
      return {
        containerDirection: "vertical",
        editorDimension: "height",
        previewDimension: "height",
        flexDirection: "column" as React.CSSProperties["flexDirection"],
      };
    }

    // PC에서는 설정에 따라 레이아웃 결정
    switch (previewPosition) {
      case "right":
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row" as React.CSSProperties["flexDirection"],
        };
      case "left":
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          // 미리보기가 왼쪽에 있도록 순서 조정
          flexDirection: "row-reverse" as React.CSSProperties["flexDirection"],
        };
      case "bottom":
        return {
          containerDirection: "vertical",
          editorDimension: "height",
          previewDimension: "height",
          flexDirection: "column" as React.CSSProperties["flexDirection"],
        };
      case "top":
        return {
          containerDirection: "vertical",
          editorDimension: "height",
          previewDimension: "height",
          // 미리보기가 위에 있도록 순서 조정
          flexDirection:
            "column-reverse" as React.CSSProperties["flexDirection"],
        };
      default:
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row" as React.CSSProperties["flexDirection"],
        };
    }
  },
}));
