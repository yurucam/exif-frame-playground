import React, { useMemo } from "react";
import { useEditorStore } from "../store/editorStore";
import { useFileStore } from "../store/fileStore";

function SvgPreview() {
  const { debouncedSvgCode, error, isDebouncing, setError } = useEditorStore();
  const { files } = useFileStore();

  // 업로드된 파일을 처리하는 함수 - SVG에 필요한 정의를 추가
  const processedSvgCode = useMemo(() => {
    let code = debouncedSvgCode;
    
    // 업로드된 리소스가 없으면 원본 코드 반환
    if (files.length === 0) return code;
    
    try {
      // SVG 코드에서 <svg> 태그 찾기
      const svgTagMatch = code.match(/<svg[^>]*>/i);
      if (!svgTagMatch) return code;
      
      // 폰트 파일 처리
      const fontFiles = files.filter(file => file.type === "font");
      let fontDefs = "";
      
      if (fontFiles.length > 0) {
        // 폰트 스타일 생성
        fontDefs = `<style>\n${fontFiles.map(font => {
          return `@font-face {
  font-family: "${font.nickname}";
  src: url("${font.dataUrl}");
}`;
        }).join('\n')}\n</style>`;
      }
      
      // 이미지 파일 처리 - 닉네임 기반 참조를 dataURL로 대체
      const imageFiles = files.filter(file => file.type === "image");
      
      if (imageFiles.length > 0) {
        // SVG 코드에서 이미지 참조 확인 및 대체 준비
        // 닉네임이나 ID를 활용하여 참조할 수 있게 함
        code = code.replace(/(href=["'])([^"']+)(["'])/g, (match, p1, p2, p3) => {
          // 참조가 업로드된 파일 닉네임과 일치하는지 확인
          const referencedFile = imageFiles.find(img => 
            img.nickname === p2 || img.id === p2 || img.name === p2
          );
          if (referencedFile) {
            return `${p1}${referencedFile.dataUrl}${p3}`;
          }
          return match;
        });
        
        // 텍스트의 폰트 패밀리도 체크
        code = code.replace(/(font-family=["'])([^"']+)(["'])/g, (match, p1, p2, p3) => {
          // 참조가 업로드된 폰트 닉네임과 일치하는지 확인
          const referencedFont = fontFiles.find(font => font.nickname === p2);
          if (referencedFont) {
            return match; // 폰트 패밀리 이름은 그대로 유지
          }
          return match;
        });
      }
      
      // <svg> 태그 바로 다음에 리소스 정의 추가
      if (fontDefs) {
        code = code.replace(
          svgTagMatch[0],
          `${svgTagMatch[0]}\n  <!-- 업로드된 리소스 -->\n  ${fontDefs}`
        );
      }
      
      return code;
    } catch (e) {
      console.error("SVG 코드 처리 중 오류:", e);
      return code;
    }
  }, [debouncedSvgCode, files]);

  const getSvgPreview = () => {
    try {
      return { __html: processedSvgCode };
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
