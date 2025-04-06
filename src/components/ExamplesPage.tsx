import React, { useState } from "react";
import { useExampleStore, Example } from "../store/exampleStore";
import { useEditorStore } from "../store/editorStore";
import { usePageStore } from "../store/pageStore";
import { useToastStore } from "../store/toastStore";

function ExamplesPage() {
  const {
    examples,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    getFilteredExamples,
  } = useExampleStore();
  const { setSvgCode } = useEditorStore();
  const { setActivePage } = usePageStore();
  const { addToast } = useToastStore();

  // 고유한 카테고리 목록 추출
  const categories = Array.from(
    new Set(examples.map((example) => example.category))
  );

  // 예제 불러오기 함수
  const loadExample = (example: Example) => {
    // SVG 코드를 에디터에 설정
    setSvgCode(example.code);

    // 에디터 페이지로 이동
    setActivePage("editor");

    // 토스트 알림 표시
    addToast(`"${example.title}" 예제가 로드되었습니다.`, "success");
  };

  const filteredExamples = getFilteredExamples();

  return (
    <div className="examples-page">
      <div className="examples-header">
        <h1>SVG 예제 모음</h1>
        <p>다양한 SVG 예제를 확인하고 코드를 복사하여 사용해보세요.</p>

        {/* 검색 입력 */}
        <div className="search-box">
          <input
            type="text"
            placeholder="예제 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="category-filter">
        <button
          className={
            selectedCategory === null
              ? "category-button active"
              : "category-button"
          }
          onClick={() => setSelectedCategory(null)}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category
                ? "category-button active"
                : "category-button"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 예제 목록 */}
      <div className="examples-list">
        {filteredExamples.length === 0 ? (
          <div className="no-examples">검색 결과가 없습니다.</div>
        ) : (
          filteredExamples.map((example) => (
            <div key={example.id} className="example-item">
              <div className="example-content">
                <h3>{example.title}</h3>
                <p className="example-description">{example.description}</p>
                <div className="example-category">{example.category}</div>
              </div>
              <button
                className="load-example-button"
                onClick={() => loadExample(example)}
              >
                코드 불러오기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExamplesPage;
