import React, { useEffect, useRef } from "react";
import { useEditorStore } from "../store/editorStore";
import { useSettingsStore } from "../store/settingsStore";
import { highlightSvgSyntax } from "../utils/syntaxHighlighter";

interface CodeEditorProps {
  isMobile: boolean;
}

function CodeEditor({ isMobile }: CodeEditorProps) {
  const { svgCode, svgCodeLines, setSvgCode, addToHistory, undo, redo } =
    useEditorStore();

  const { settings } = useSettingsStore();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // 스크롤 동기화를 위한 핸들러 함수
  useEffect(() => {
    const syncScroll = () => {
      if (editorRef.current && highlightRef.current) {
        highlightRef.current.scrollTop = editorRef.current.scrollTop;
        highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
      }
    };

    const editor = editorRef.current;
    if (editor) {
      // 즉시 한 번 호출하여 초기 스크롤 동기화
      syncScroll();

      // 이벤트 리스너 등록
      editor.addEventListener("scroll", syncScroll);
      editor.addEventListener("input", syncScroll);
      window.addEventListener("resize", syncScroll);

      return () => {
        editor.removeEventListener("scroll", syncScroll);
        editor.removeEventListener("input", syncScroll);
        window.removeEventListener("resize", syncScroll);
      };
    }
  }, [svgCodeLines]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setSvgCode(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 탭 키 처리
    if (e.key === "Tab") {
      e.preventDefault();

      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = " ".repeat(settings.tabSize);
      const newValue =
        svgCode.substring(0, start) + spaces + svgCode.substring(end);

      // 상태 업데이트
      setSvgCode(newValue);

      // 직접 히스토리에 추가
      addToHistory(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + settings.tabSize;
      }, 0);
    }

    // 실행 취소 (Cmd+Z 또는 Ctrl+Z)
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // 다시 실행 (Cmd+Shift+Z 또는 Ctrl+Shift+Z 또는 Ctrl+Y)
    if (
      ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) ||
      (e.ctrlKey && e.key === "y")
    ) {
      e.preventDefault();
      redo();
    }
  };

  const handleBlur = () => {
    addToHistory(svgCode);
  };

  return (
    <div className="code-input-container">
      <textarea
        ref={editorRef}
        value={svgCode}
        onChange={handleCodeChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="code-textarea"
        spellCheck={false}
        wrap="off"
      />
      <div className="code-highlight" ref={highlightRef}>
        <pre
          style={{
            margin: 0,
            padding: "15px 10px 15px 50px",
            background: "transparent",
            fontFamily:
              "'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace",
            fontSize: isMobile ? "12px" : "14px",
            lineHeight: 1.5,
            tabSize: 2,
            MozTabSize: 2,
            whiteSpace: "pre",
            overflow: "visible",
            textRendering: "geometricPrecision",
          }}
        >
          {svgCodeLines.map((line, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                minHeight: "1.5em",
                display: "block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "-40px",
                  width: "30px",
                  textAlign: "right",
                  color: "#606366",
                  userSelect: "none",
                }}
              >
                {i + 1}
              </span>
              <code style={{ whiteSpace: "pre" }}>
                {highlightSvgSyntax(line, i)}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default CodeEditor;
