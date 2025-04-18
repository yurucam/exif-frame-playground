import React, { useEffect } from "react";
import "./styles/index.css";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import EditorLayout from "./components/EditorLayout";
import ExamplesPage from "./components/ExamplesPage";
import SettingsModal from "./components/SettingsModal";
import ToastContainer from "./components/Toast";
import { useEditorStore } from "./store/editorStore";
import { useLayoutStore } from "./store/layoutStore";
import { useSettingsStore } from "./store/settingsStore";
import { usePageStore } from "./store/pageStore";

function App() {
  const { svgCode, setDebouncedSvgCode, setError, setIsDebouncing } =
    useEditorStore();

  const { setIsMobile, setIsTablet } = useLayoutStore();

  // 페이지 상태 가져오기
  const { activePage } = usePageStore();

  // 설정 변경 감지를 위해 settings 가져오기
  const { settings } = useSettingsStore();

  // SVG 코드 디바운싱
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSvgCode(svgCode);
      setError(null);
      setIsDebouncing(false);
    }, 500);

    setIsDebouncing(true);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [svgCode, setDebouncedSvgCode, setError, setIsDebouncing]);

  // 디바이스 크기 체크
  useEffect(() => {
    const checkDeviceSize = () => {
      const width = window.innerWidth;
      const isMobileSize = width < 768;
      const isTabletSize = width >= 768 && width <= 1024;

      setIsMobile(isMobileSize);
      setIsTablet(isTabletSize);
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);

    return () => window.removeEventListener("resize", checkDeviceSize);
  }, [setIsMobile, setIsTablet]);

  // 활성화된 페이지에 따라 컴포넌트 렌더링
  const renderActivePage = () => {
    switch (activePage) {
      case "examples":
        return <ExamplesPage />;
      case "editor":
      default:
        return (
          <>
            <Toolbar />
            <EditorLayout />
          </>
        );
    }
  };

  return (
    <div className="playground">
      <Header />
      <SettingsModal />
      {renderActivePage()}
      <ToastContainer />
    </div>
  );
}

export default App;
