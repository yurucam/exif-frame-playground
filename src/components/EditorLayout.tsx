import React, { useRef, useEffect, useMemo, useState } from "react";
import { useLayoutStore } from "../store/layoutStore";
import { useSettingsStore } from "../store/settingsStore";
import CodeEditor from "./CodeEditor";
import SvgPreview from "./SvgPreview";
import FileManager from "./FileManager";

function EditorLayout() {
  const {
    isMobile,
    isResizing,
    splitPosition,
    setIsResizing,
    setSplitPosition,
  } = useLayoutStore();

  // FileManager 표시 여부 상태 추가
  const [showFileManager, setShowFileManager] = useState(false);

  // 설정 상태를 명시적으로 구독
  const { settings } = useSettingsStore();

  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // previewPosition이 변경될 때마다 레이아웃 계산을 다시 하기 위해 useMemo 사용
  const {
    containerDirection,
    editorDimension,
    previewDimension,
    flexDirection,
  } = useMemo(() => {
    // 모바일에서는 기본값을 bottom으로 설정
    let effectivePosition = settings.previewPosition;
    if (isMobile) {
      effectivePosition = "bottom";
    }

    switch (effectivePosition) {
      case "right":
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row" as const,
        };
      case "left":
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row-reverse" as const,
        };
      case "bottom":
        return {
          containerDirection: "vertical",
          editorDimension: "height",
          previewDimension: "height",
          flexDirection: "column" as const,
        };
      case "top":
        return {
          containerDirection: "vertical",
          editorDimension: "height",
          previewDimension: "height",
          flexDirection: "column-reverse" as const,
        };
      default:
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row" as const,
        };
    }
  }, [settings.previewPosition, isMobile]);

  // 리사이저 마우스 이벤트 로직
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();

        if (containerDirection === "vertical") {
          // 수직 분할 (위/아래 배치)
          const newPosition =
            ((e.clientY - container.top) / container.height) * 100;

          // flexDirection이 column-reverse인 경우 위치 반전 처리
          if (flexDirection === "column-reverse") {
            setSplitPosition(Math.min(Math.max(20, 100 - newPosition), 80));
          } else {
            setSplitPosition(Math.min(Math.max(20, newPosition), 80));
          }
        } else {
          // 수평 분할 (좌/우 배치)
          const newPosition =
            ((e.clientX - container.left) / container.width) * 100;

          // flexDirection이 row-reverse인 경우 위치 반전 처리
          if (flexDirection === "row-reverse") {
            setSplitPosition(Math.min(Math.max(20, 100 - newPosition), 80));
          } else {
            setSplitPosition(Math.min(Math.max(20, newPosition), 80));
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      document.body.style.cursor =
        containerDirection === "vertical" ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    containerDirection,
    flexDirection,
    setSplitPosition,
    setIsResizing,
  ]);

  // 리사이저 시작 핸들러
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // FileManager 토글 함수
  const toggleFileManager = () => {
    setShowFileManager(prev => !prev);
  };

  return (
    <div
      className={`editor-container ${containerDirection}`}
      ref={containerRef}
      style={{ flexDirection }}
    >
      <div
        className="editor-area"
        style={{
          [editorDimension]: `${splitPosition}%`,
        }}
      >
        <div className="editor-wrapper">
          <CodeEditor isMobile={isMobile} />
          
          {/* 파일 관리자 토글 버튼 */}
          <div className="file-manager-toggle">
            <button onClick={toggleFileManager}>
              {showFileManager ? "파일 관리자 닫기 ▲" : "파일 관리자 열기 ▼"}
            </button>
          </div>
          
          {/* 파일 관리자 컴포넌트 */}
          {showFileManager && <FileManager />}
        </div>
      </div>

      <div
        className="resizer"
        ref={resizeRef}
        onMouseDown={handleResizeStart}
        style={{
          cursor: editorDimension === "height" ? "row-resize" : "col-resize",
        }}
      >
        <div className="resizer-line" />
        <div className="resizer-handle">
          <div className="resizer-handle-icon"></div>
        </div>
      </div>

      <div
        className="preview-area"
        style={{
          [previewDimension]: `${100 - splitPosition}%`,
        }}
      >
        <SvgPreview />
      </div>
    </div>
  );
}

export default EditorLayout;
