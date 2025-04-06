import React from "react";
import { useEditorStore } from "../store/editorStore";

function SvgPreview() {
  const { debouncedSvgCode, error, isDebouncing, setError } = useEditorStore();

  const getSvgPreview = () => {
    try {
      return { __html: debouncedSvgCode };
    } catch {
      setError("SVG 코드에 오류가 있습니다.");
      return { __html: "" };
    }
  };

  return (
    <div className="preview-content">
      <div
        className="svg-display"
        style={{ backgroundColor: "#161616" }}
        dangerouslySetInnerHTML={getSvgPreview()}
      />
      {error && <div className="error">{error}</div>}
      {isDebouncing && !error && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <div className="loading-text">SVG 미리보기 업데이트 중...</div>
        </div>
      )}
    </div>
  );
}

export default SvgPreview;
