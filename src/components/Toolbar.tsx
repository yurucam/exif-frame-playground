import React from "react";
import { useEditorStore } from "../store/editorStore";

function Toolbar() {
  const { formatSvgCode } = useEditorStore();

  return (
    <div className="toolbar">
      <div className="version">v1.0.0</div>
      <div className="toolbar-buttons">
        <button className="toolbar-button" onClick={formatSvgCode}>
          코드 정리
        </button>
        <button className="toolbar-button">내보내기</button>
        <button className="toolbar-button">공유</button>
      </div>
    </div>
  );
}

export default Toolbar;
