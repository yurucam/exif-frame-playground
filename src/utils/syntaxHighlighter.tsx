import React, { ReactNode } from "react";

// SVG 구문 하이라이팅 함수
export const highlightSvgSyntax = (
  line: string,
  lineIndex: number
): ReactNode[] => {
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
  if (commentRanges.length === 0 || !isCompletelyComment(line, commentRanges)) {
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
