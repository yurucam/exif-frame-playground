import React, { useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import EditorLayout from "./components/EditorLayout";
import SettingsModal from "./components/SettingsModal";
import { useEditorStore } from "./store/editorStore";
import { useLayoutStore } from "./store/layoutStore";

function App() {
  const { svgCode, setDebouncedSvgCode, setError, setIsDebouncing } =
    useEditorStore();

  const { setIsMobile, setIsTablet } = useLayoutStore();

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

  return (
    <div className="playground">
      <Header />
      <SettingsModal />
      <Toolbar />
      <EditorLayout />
    </div>
  );
}

export default App;
