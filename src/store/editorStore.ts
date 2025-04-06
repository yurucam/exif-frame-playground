import { create } from "zustand";
import { useSettingsStore } from "./settingsStore";

interface EditorState {
  // 상태
  svgCode: string;
  debouncedSvgCode: string;
  svgCodeLines: string[];
  error: string | null;
  isDebouncing: boolean;
  history: string[];
  historyIndex: number;

  // 레퍼런스 값들
  historyLimit: number;
  isHistoryAction: boolean;
  lastHistoryUpdate: string;

  // 액션
  setSvgCode: (code: string) => void;
  setDebouncedSvgCode: (code: string) => void;
  setError: (error: string | null) => void;
  setIsDebouncing: (isDebouncing: boolean) => void;
  updateCodeLines: () => void;

  // 히스토리 관련 액션
  addToHistory: (code: string) => void;
  undo: () => void;
  redo: () => void;

  // 유틸리티 함수
  formatSvgCode: () => void;
}

// SVG 코드 기본값
const DEFAULT_SVG_CODE = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 원 요소 -->
  <circle cx="50" cy="50" r="30" fill="tomato" />
  <!-- 사각형 요소 -->
  <rect x="20" y="20" width="20" height="20" fill="blue" />
</svg>`;

export const useEditorStore = create<EditorState>()((set, get) => ({
  // 초기 상태
  svgCode: DEFAULT_SVG_CODE,
  debouncedSvgCode: DEFAULT_SVG_CODE,
  svgCodeLines: DEFAULT_SVG_CODE.split("\n"),
  error: null,
  isDebouncing: false,
  history: [DEFAULT_SVG_CODE],
  historyIndex: 0,

  // 레퍼런스 값
  historyLimit: 50,
  isHistoryAction: false,
  lastHistoryUpdate: DEFAULT_SVG_CODE,

  // 액션
  setSvgCode: (code) => {
    set({ svgCode: code });
    get().updateCodeLines();

    if (!get().isHistoryAction) {
      const timer = setTimeout(() => {
        if (get().lastHistoryUpdate !== code) {
          get().addToHistory(code);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  },

  setDebouncedSvgCode: (code) => set({ debouncedSvgCode: code }),

  setError: (error) => set({ error }),

  setIsDebouncing: (isDebouncing) => set({ isDebouncing }),

  updateCodeLines: () => {
    const lines = get().svgCode.split("\n");
    set({ svgCodeLines: lines });
  },

  // 히스토리 관련 액션
  addToHistory: (code) => {
    const { history, historyIndex, historyLimit } = get();

    // 현재 위치 이후의 히스토리는 버림
    const newHistory = history.slice(0, historyIndex + 1);
    const updatedHistory = [...newHistory, code];

    // 히스토리 최대 개수 제한
    if (updatedHistory.length > historyLimit) {
      updatedHistory.shift();
    }

    set({
      history: updatedHistory,
      historyIndex: updatedHistory.length - 1,
      lastHistoryUpdate: code,
    });
  },

  undo: () => {
    const { historyIndex, history } = get();

    if (historyIndex > 0) {
      // 히스토리 액션 플래그 설정
      set({ isHistoryAction: true });

      // 히스토리 인덱스 감소
      const newIndex = historyIndex - 1;
      set({
        historyIndex: newIndex,
        svgCode: history[newIndex],
      });

      // 코드 라인 업데이트
      get().updateCodeLines();

      // 플래그 초기화를 위한 타이머 설정
      setTimeout(() => {
        set({ isHistoryAction: false });
      }, 100);
    }
  },

  redo: () => {
    const { historyIndex, history } = get();

    if (historyIndex < history.length - 1) {
      // 히스토리 액션 플래그 설정
      set({ isHistoryAction: true });

      // 히스토리 인덱스 증가
      const newIndex = historyIndex + 1;
      set({
        historyIndex: newIndex,
        svgCode: history[newIndex],
      });

      // 코드 라인 업데이트
      get().updateCodeLines();

      // 플래그 초기화를 위한 타이머 설정
      setTimeout(() => {
        set({ isHistoryAction: false });
      }, 100);
    }
  },

  // 유틸리티 함수
  formatSvgCode: () => {
    try {
      const { svgCode } = get();
      // 설정 스토어에서 tabSize 직접 가져오기
      const tabSize = useSettingsStore.getState().settings.tabSize;

      // SVG 코드를 정규식을 사용하여 포맷팅
      let formatted = "";
      let indentLevel = 0;
      const indentSize = tabSize;

      // 줄바꿈 제거하고 모든 태그 사이에 공백 정리
      let result = svgCode.replace(/>\s+</g, "><");

      // 모든 여는/닫는 태그에 줄바꿈 추가
      result = result.replace(/(<\/.*?>)|(<.*?>)/g, "\n$1$2");

      // 각 줄 처리
      const lines = result.split("\n").filter((line) => line.trim() !== "");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 빈 줄 건너뛰기
        if (line === "") continue;

        // 닫는 태그 또는 자체 닫기 태그 확인
        const isClosingTag = line.startsWith("</");
        const isSelfClosingTag = line.includes("/>") && !line.includes("<", 1);

        // 닫는 태그면 들여쓰기 감소
        if (isClosingTag) {
          indentLevel--;
        }

        // 현재 들여쓰기 수준에 맞게 공백 추가
        formatted += " ".repeat(indentLevel * indentSize) + line + "\n";

        // 여는 태그이고 자체 닫기 태그가 아니면 들여쓰기 증가
        if (!isClosingTag && !isSelfClosingTag && !line.startsWith("<!")) {
          indentLevel++;
        }
      }

      const formattedCode = formatted.trim();
      set({ svgCode: formattedCode });
      get().updateCodeLines();

      // 현재 히스토리 액션 중이 아니면 히스토리에 추가
      if (!get().isHistoryAction) {
        get().addToHistory(formattedCode);
      }
    } catch (error) {
      console.error("코드 포맷팅 오류:", error);
      set({ error: "SVG 코드 포맷팅 중 오류가 발생했습니다." });
    }
  },
}));
