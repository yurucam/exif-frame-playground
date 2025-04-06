import React, { useRef, useEffect } from "react";
import { useLayoutStore } from "../store/layoutStore";
import CodeEditor from "./CodeEditor";
import SvgPreview from "./SvgPreview";

function EditorLayout() {
  const {
    isMobile,
    isResizing,
    splitPosition,
    setIsResizing,
    setSplitPosition,
    getPreviewLayout,
  } = useLayoutStore();

  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 리사이저 마우스 이벤트 로직
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const { containerDirection } = getPreviewLayout();

        if (containerDirection === "vertical") {
          // 수직 분할 (위/아래 배치)
          const newPosition =
            ((e.clientY - container.top) / container.height) * 100;
          setSplitPosition(Math.min(Math.max(20, newPosition), 80));
        } else {
          // 수평 분할 (좌/우 배치)
          const newPosition =
            ((e.clientX - container.left) / container.width) * 100;
          setSplitPosition(Math.min(Math.max(20, newPosition), 80));
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

      const { containerDirection } = getPreviewLayout();
      document.body.style.cursor =
        containerDirection === "vertical" ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, getPreviewLayout, setSplitPosition, setIsResizing]);

  // 리사이저 시작 핸들러
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // containerDirection과 flexDirection 분리하여 사용
  const {
    containerDirection,
    editorDimension,
    previewDimension,
    flexDirection,
  } = getPreviewLayout();

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
        <CodeEditor isMobile={isMobile} />
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
