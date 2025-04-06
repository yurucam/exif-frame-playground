import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// 설정 타입 정의
interface Settings {
  tabSize: number;
  previewPosition: "auto" | "right" | "left" | "bottom" | "top";
}

// 설정 모달 컴포넌트
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [tempSettings, setTempSettings] = useState<Settings>(settings);

  // 모달 열릴 때마다 현재 설정으로 초기화
  useEffect(() => {
    setTempSettings(settings);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setTempSettings((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setTempSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(tempSettings);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>설정</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>탭 크기 (공백 수)</label>
            <input
              type="number"
              name="tabSize"
              min="2"
              max="8"
              value={tempSettings.tabSize}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>미리보기 위치</label>
            <select
              name="previewPosition"
              value={tempSettings.previewPosition}
              onChange={handleChange}
            >
              <option value="auto">자동 (화면 크기에 따라)</option>
              <option value="right">오른쪽</option>
              <option value="left">왼쪽</option>
              <option value="bottom">하단</option>
              <option value="top">상단</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="save-button">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [svgCode, setSvgCode] =
    useState<string>(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 원 요소 -->
  <circle cx="50" cy="50" r="30" fill="tomato" />
  <!-- 사각형 요소 -->
  <rect x="20" y="20" width="20" height="20" fill="blue" />
</svg>`);
  const [debouncedSvgCode, setDebouncedSvgCode] = useState<string>(svgCode);
  // 코드를 줄 단위로 분리하여 저장하는 상태 추가
  const [svgCodeLines, setSvgCodeLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(50); // % 단위
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  // 실행 취소/다시 실행을 위한 히스토리 상태 추가
  const [history, setHistory] = useState<string[]>([svgCode]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const historyLimitRef = useRef<number>(50); // 최대 히스토리 개수 제한
  const isHistoryActionRef = useRef<boolean>(false); // 실행 취소/다시 실행 중인지 여부
  const lastHistoryUpdateRef = useRef<string>(svgCode); // 마지막으로 히스토리에 추가된 코드
  const historyTimerRef = useRef<number | null>(null); // 히스토리 추가를 위한 타이머

  const [settings, setSettings] = useState<Settings>({
    tabSize: 2,
    previewPosition: "auto",
  });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // 단순화된 레이아웃 함수
  const getPreviewLayout = useCallback((): {
    containerDirection: string;
    editorDimension: string;
    previewDimension: string;
    flexDirection: string;
  } => {
    // 모바일/태블릿에서는 항상 수직 레이아웃
    if (isMobile || isTablet) {
      return {
        containerDirection: "vertical",
        editorDimension: "height",
        previewDimension: "height",
        flexDirection: "column",
      };
    }

    // PC에서는 설정에 따라 레이아웃 결정
    switch (settings.previewPosition) {
      case "right":
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row",
        };
      case "left":
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          // 미리보기가 왼쪽에 있도록 순서 조정
          flexDirection: "row-reverse",
        };
      case "bottom":
        return {
          containerDirection: "vertical",
          editorDimension: "height",
          previewDimension: "height",
          flexDirection: "column",
        };
      case "top":
        return {
          containerDirection: "vertical",
          editorDimension: "height",
          previewDimension: "height",
          // 미리보기가 위에 있도록 순서 조정
          flexDirection: "column-reverse",
        };
      default:
        return {
          containerDirection: "horizontal",
          editorDimension: "width",
          previewDimension: "width",
          flexDirection: "row",
        };
    }
  }, [settings.previewPosition, isMobile, isTablet]);

  // 코드를 줄 단위로 분리하는 함수
  useEffect(() => {
    // 코드를 줄 단위로 분리
    const lines = svgCode.split("\n");
    setSvgCodeLines(lines);
  }, [svgCode]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsDebouncing(true);

    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedSvgCode(svgCode);
      setError(null);
      setIsDebouncing(false);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [svgCode]);

  useEffect(() => {
    const checkDeviceSize = () => {
      const width = window.innerWidth;
      const isMobileSize = width < 768;
      const isTabletSize = width >= 768 && width <= 1024;

      setIsMobile(isMobileSize);
      setIsTablet(isTabletSize);

      if (isMobileSize || isTabletSize) {
        setSplitPosition(50);
      }
    };

    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);

    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("svgPlaygroundSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error("설정 로드 오류:", error);
    }
  }, []);

  // 리사이저 마우스 이벤트 로직 단순화
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
  }, [isResizing, getPreviewLayout]);

  // 코드가 변경될 때 호출되는 함수
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setSvgCode(newCode);

    // 실행 취소/다시 실행 중이 아닌 경우에만 히스토리 추가 처리
    if (!isHistoryActionRef.current) {
      // 이전 타이머가 있으면 제거
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }

      // 500ms 디바운스 후 히스토리에 추가
      historyTimerRef.current = window.setTimeout(() => {
        // 마지막 히스토리 항목과 다른 경우에만 추가
        if (lastHistoryUpdateRef.current !== newCode) {
          const newHistory = history.slice(0, historyIndex + 1);
          const updatedHistory = [...newHistory, newCode];

          // 히스토리 최대 개수 제한
          if (updatedHistory.length > historyLimitRef.current) {
            updatedHistory.shift();
          }

          setHistory(updatedHistory);
          setHistoryIndex(updatedHistory.length - 1);
          lastHistoryUpdateRef.current = newCode;
        }
      }, 500);
    }
  };

  const getSvgPreview = () => {
    try {
      return { __html: debouncedSvgCode };
    } catch {
      setError("SVG 코드에 오류가 있습니다.");
      return { __html: "" };
    }
  };

  // 리사이저 시작 핸들러
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // 설정 저장 함수
  const saveSettings = (newSettings: Settings) => {
    console.log("설정 저장:", newSettings); // 디버깅용 로그
    setSettings(newSettings);
    localStorage.setItem("svgPlaygroundSettings", JSON.stringify(newSettings));
  };

  // SVG 코드 포맷팅 함수
  const formatSvgCode = () => {
    try {
      // SVG 코드를 정규식을 사용하여 포맷팅
      // 태그와 내용을 찾아서 들여쓰기 적용
      let formatted = "";
      let indentLevel = 0;
      const indentSize = settings.tabSize;

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

      // 코드 업데이트
      setSvgCode(formatted.trim());

      // 히스토리에 추가
      if (!isHistoryActionRef.current) {
        const newHistory = history.slice(0, historyIndex + 1);
        const updatedHistory = [...newHistory, formatted.trim()];

        if (updatedHistory.length > historyLimitRef.current) {
          updatedHistory.shift();
        }

        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
        lastHistoryUpdateRef.current = formatted.trim();
      }
    } catch (error) {
      console.error("코드 포맷팅 오류:", error);
      setError("SVG 코드 포맷팅 중 오류가 발생했습니다.");
    }
  };

  // SVG 구문 하이라이팅 함수
  const highlightSvgSyntax = (line: string, lineIndex: number) => {
    // 태그 및 속성 정규식 패턴
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)/g;
    const attributePattern = /([a-zA-Z][a-zA-Z0-9-]*)=["']([^"']*)["']/g;

    // 토큰 위치 저장 배열
    const tokens: { start: number; end: number; type: string }[] = [];

    // 주석 처리 로직 개선
    let match;
    const commentRanges: { start: number; end: number }[] = [];

    // 한 줄에 여러 주석 블록 처리를 위한 정규식
    const commentRegex = /<!--(.*?)-->/g;

    // 주석 범위 찾기
    while ((match = commentRegex.exec(line)) !== null) {
      commentRanges.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // 주석 토큰 추가
    commentRanges.forEach((range) => {
      for (let i = range.start; i < range.end; i++) {
        tokens.push({
          start: i,
          end: i + 1,
          type: "comment",
        });
      }
    });

    // 주석이 아닌 부분에서 태그와 속성 찾기
    if (
      commentRanges.length === 0 ||
      !isCompletelyComment(line, commentRanges)
    ) {
      // 현재 위치가 주석 내부인지 확인하는 함수
      const isInComment = (pos: number): boolean => {
        return commentRanges.some(
          (range) => pos >= range.start && pos < range.end
        );
      };

      // 태그 찾기
      while ((match = tagPattern.exec(line)) !== null) {
        // 이 태그가 주석 내부에 있는지 확인
        if (!isInComment(match.index)) {
          tokens.push({
            start: match.index + 1, // < 다음부터
            end: match.index + match[0].length,
            type: "tag",
          });
        }
      }

      // 속성 찾기
      while ((match = attributePattern.exec(line)) !== null) {
        // 이 속성이 주석 내부에 있는지 확인
        if (!isInComment(match.index)) {
          // 속성명
          tokens.push({
            start: match.index,
            end: match.index + match[1].length,
            type: "attribute",
          });

          // 속성값
          const valueStart = match.index + match[1].length + 2; // = 와 " 건너뜀
          tokens.push({
            start: valueStart,
            end: match.index + match[0].length - 1, // 마지막 " 제외
            type: "string",
          });
        }
      }

      // 기호 찾기 (<, >, /, =, ", ')
      for (let i = 0; i < line.length; i++) {
        // 현재 위치가 주석 내부에 있는지 확인
        if (!isInComment(i)) {
          const char = line[i];
          if (["<", ">", "/", "="].includes(char)) {
            tokens.push({
              start: i,
              end: i + 1,
              type: "punctuation",
            });
          } else if (['"', "'"].includes(char)) {
            tokens.push({
              start: i,
              end: i + 1,
              type: "quote",
            });
          }
        }
      }
    }

    // 주석이 전체 라인을 차지하는지 확인하는 함수
    function isCompletelyComment(
      line: string,
      ranges: { start: number; end: number }[]
    ): boolean {
      // 모든 글자가 주석 범위 내에 있는지 확인
      let nonCommentChars = 0;
      for (let i = 0; i < line.length; i++) {
        if (
          !ranges.some((range) => i >= range.start && i < range.end) &&
          !line[i].match(/\s/)
        ) {
          nonCommentChars++;
        }
      }
      return nonCommentChars === 0;
    }

    // 토큰을 시작 위치로 정렬
    tokens.sort((a, b) => a.start - b.start);

    // 결과 렌더링
    const result: React.ReactNode[] = [];

    for (let i = 0; i < line.length; i++) {
      // 현재 위치에 해당하는 토큰 찾기
      const currentTokens = tokens.filter(
        (token) => token.start <= i && token.end > i
      );

      // 토큰이 있으면 해당 스타일 적용
      if (currentTokens.length > 0) {
        // 우선순위: comment > tag > attribute > string > punctuation
        const token = currentTokens.sort((a, b) => {
          const order = {
            comment: -1,
            tag: 0,
            attribute: 1,
            string: 2,
            punctuation: 3,
            quote: 4,
          };
          return (
            order[a.type as keyof typeof order] -
            order[b.type as keyof typeof order]
          );
        })[0];

        let color = "#d4d4d4"; // 기본 색상

        switch (token.type) {
          case "comment":
            color = "#6A9955"; // 주석 색상 (초록색)
            break;
          case "tag":
            color = "#569cd6"; // 태그 색상
            break;
          case "attribute":
            color = "#9cdcfe"; // 속성 색상
            break;
          case "string":
            color = "#ce9178"; // 문자열 색상
            break;
          case "punctuation":
          case "quote":
            color = "#808080"; // 기호 색상
            break;
        }

        result.push(
          <span key={`${lineIndex}-${i}`} style={{ color }}>
            {line[i]}
          </span>
        );
      } else {
        // 토큰이 없으면 기본 스타일로 표시
        result.push(<span key={`${lineIndex}-${i}`}>{line[i]}</span>);
      }
    }

    return result;
  };

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

  // 키보드 입력 처리 함수 수정
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

      // 탭은 즉시 히스토리에 추가
      if (!isHistoryActionRef.current) {
        const newHistory = history.slice(0, historyIndex + 1);
        const updatedHistory = [...newHistory, newValue];

        if (updatedHistory.length > historyLimitRef.current) {
          updatedHistory.shift();
        }

        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
        lastHistoryUpdateRef.current = newValue;
      }

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + settings.tabSize;
      }, 0);
    }

    // 실행 취소 (Cmd+Z 또는 Ctrl+Z)
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      console.log("실행 취소", historyIndex, history.length);

      if (historyIndex > 0) {
        // 히스토리 액션 플래그 설정
        isHistoryActionRef.current = true;

        // 히스토리 인덱스 감소
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        // 코드 업데이트
        setSvgCode(history[newIndex]);

        // 플래그 초기화를 위한 타이머 설정
        setTimeout(() => {
          isHistoryActionRef.current = false;
        }, 100);
      }
    }

    // 다시 실행 (Cmd+Shift+Z 또는 Ctrl+Shift+Z 또는 Ctrl+Y)
    if (
      ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) ||
      (e.ctrlKey && e.key === "y")
    ) {
      e.preventDefault();
      console.log("다시 실행", historyIndex, history.length);

      if (historyIndex < history.length - 1) {
        // 히스토리 액션 플래그 설정
        isHistoryActionRef.current = true;

        // 히스토리 인덱스 증가
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);

        // 코드 업데이트
        setSvgCode(history[newIndex]);

        // 플래그 초기화를 위한 타이머 설정
        setTimeout(() => {
          isHistoryActionRef.current = false;
        }, 100);
      }
    }
  };

  // 포커스를 잃었을 때 현재 코드를 히스토리에 추가
  const handleBlur = () => {
    if (
      !isHistoryActionRef.current &&
      lastHistoryUpdateRef.current !== svgCode
    ) {
      const newHistory = history.slice(0, historyIndex + 1);
      const updatedHistory = [...newHistory, svgCode];

      if (updatedHistory.length > historyLimitRef.current) {
        updatedHistory.shift();
      }

      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      lastHistoryUpdateRef.current = svgCode;
    }
  };

  // containerDirection과 flexDirection 분리하여 사용
  const {
    containerDirection,
    editorDimension,
    previewDimension,
    flexDirection,
  } = getPreviewLayout();

  return (
    <div className="playground">
      <header className="header">
        <div className="logo">SVG Playground</div>
        <nav className="nav">
          <button className="nav-item active">SVG 편집기</button>
          <button className="nav-item">예제</button>
          <button className="nav-item">도움말</button>
        </nav>
        <div className="actions">
          <button
            className="action-button"
            onClick={() => setIsSettingsOpen(true)}
          >
            설정
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={saveSettings}
      />

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
          <div className="preview-content">
            <div
              className="svg-display"
              style={{ backgroundColor: "white" }}
              dangerouslySetInnerHTML={getSvgPreview()}
            />
            {error && <div className="error">{error}</div>}
            {isDebouncing && !error && (
              <div className="loading-message">
                <div className="loading-spinner"></div>
                SVG 미리보기 업데이트 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
