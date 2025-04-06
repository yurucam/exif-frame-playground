import { create } from "zustand";

// 예제 항목 인터페이스 정의
export interface Example {
  id: string;
  title: string;
  description: string;
  code: string;
  category:
    | "기본"
    | "애니메이션"
    | "도형"
    | "텍스트"
    | "필터"
    | "패턴"
    | "고급";
}

interface ExampleState {
  // 상태
  examples: Example[];
  selectedCategory: string | null;
  searchQuery: string;

  // 액션
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredExamples: () => Example[];
}

// 예제 데이터
const EXAMPLE_DATA: Example[] = [
  {
    id: "simple-circle",
    title: "기본 원",
    description: "가장 기본적인 원 도형 예제",
    category: "기본",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>`,
  },
  {
    id: "simple-rectangle",
    title: "기본 사각형",
    description: "가장 기본적인 사각형 도형 예제",
    category: "기본",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="blue" />
</svg>`,
  },
  {
    id: "simple-line",
    title: "기본 선",
    description: "가장 기본적인 선 예제",
    category: "기본",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <line x1="10" y1="10" x2="90" y2="90" stroke="green" stroke-width="5" />
</svg>`,
  },
  {
    id: "multi-shape",
    title: "다중 도형",
    description: "여러 도형을 조합한 예제",
    category: "기본",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="40" height="40" fill="blue" />
  <circle cx="70" cy="30" r="20" fill="red" />
  <line x1="10" y1="70" x2="90" y2="70" stroke="green" stroke-width="5" />
</svg>`,
  },
  {
    id: "path-example",
    title: "기본 패스",
    description: "간단한 패스를 사용한 예제",
    category: "기본",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M10,30 L90,30 L50,70 Z" fill="purple" />
</svg>`,
  },
  {
    id: "star-shape",
    title: "별 모양",
    description: "패스를 이용한 별 모양 그리기",
    category: "도형",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50,10 L61,35 L87,35 L65,50 L75,75 L50,60 L25,75 L35,50 L13,35 L39,35 Z" fill="gold" />
</svg>`,
  },
  {
    id: "rounded-rect",
    title: "둥근 사각형",
    description: "모서리가 둥근 사각형 예제",
    category: "도형",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" rx="15" ry="15" fill="coral" />
</svg>`,
  },
  {
    id: "polygon",
    title: "다각형",
    description: "정육각형 다각형 예제",
    category: "도형",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="teal" />
</svg>`,
  },
  {
    id: "ellipse",
    title: "타원",
    description: "기본 타원 예제",
    category: "도형",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="50" rx="40" ry="20" fill="orange" />
</svg>`,
  },
  {
    id: "text-basic",
    title: "기본 텍스트",
    description: "간단한 텍스트 예제",
    category: "텍스트",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="50" font-family="Arial" font-size="12">SVG 텍스트 예제</text>
</svg>`,
  },
  {
    id: "text-path",
    title: "텍스트 패스",
    description: "곡선을 따라 텍스트 배치하기",
    category: "텍스트",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path id="curve" d="M10,50 Q50,10 90,50" fill="transparent" />
  <text>
    <textPath href="#curve" font-family="Arial" font-size="8">
      곡선을 따라 텍스트가 배치됩니다
    </textPath>
  </text>
</svg>`,
  },
  {
    id: "styled-text",
    title: "스타일 텍스트",
    description: "다양한 스타일이 적용된 텍스트",
    category: "텍스트",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="30" font-family="Arial" font-size="10" fill="blue">파란색 텍스트</text>
  <text x="10" y="50" font-family="Arial" font-size="10" font-weight="bold">굵은 텍스트</text>
  <text x="10" y="70" font-family="Arial" font-size="10" font-style="italic">이탤릭 텍스트</text>
</svg>`,
  },
  {
    id: "basic-animation",
    title: "기본 애니메이션",
    description: "원의 크기 변화 애니메이션",
    category: "애니메이션",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="20" fill="red">
    <animate 
      attributeName="r" 
      values="20;40;20" 
      dur="2s" 
      repeatCount="indefinite" />
  </circle>
</svg>`,
  },
  {
    id: "motion-animation",
    title: "움직임 애니메이션",
    description: "원의 위치 이동 애니메이션",
    category: "애니메이션",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="50" r="10" fill="blue">
    <animate 
      attributeName="cx" 
      values="20;80;20" 
      dur="3s" 
      repeatCount="indefinite" />
  </circle>
</svg>`,
  },
  {
    id: "color-animation",
    title: "색상 변화",
    description: "도형의 색상이 변하는 애니메이션",
    category: "애니메이션",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="60" height="60" fill="purple">
    <animate 
      attributeName="fill" 
      values="purple;green;blue;purple" 
      dur="4s" 
      repeatCount="indefinite" />
  </rect>
</svg>`,
  },
  {
    id: "transform-animation",
    title: "변환 애니메이션",
    description: "도형의 회전 애니메이션",
    category: "애니메이션",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="35" y="35" width="30" height="30" fill="orange">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      from="0 50 50" 
      to="360 50 50" 
      dur="3s" 
      repeatCount="indefinite" />
  </rect>
</svg>`,
  },
  {
    id: "blur-filter",
    title: "블러 필터",
    description: "가우시안 블러 필터 적용 예제",
    category: "필터",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="blur">
      <feGaussianBlur stdDeviation="3" />
    </filter>
  </defs>
  <rect x="20" y="20" width="60" height="60" fill="blue" filter="url(#blur)" />
</svg>`,
  },
  {
    id: "shadow-filter",
    title: "그림자 필터",
    description: "그림자 효과 필터 적용 예제",
    category: "필터",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="4" dy="4" stdDeviation="2" flood-color="black" flood-opacity="0.5" />
    </filter>
  </defs>
  <rect x="20" y="20" width="60" height="60" fill="yellow" filter="url(#shadow)" />
</svg>`,
  },
  {
    id: "linear-gradient",
    title: "선형 그라데이션",
    description: "선형 그라데이션 패턴 예제",
    category: "패턴",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="blue" />
      <stop offset="100%" stop-color="red" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="80" height="80" fill="url(#gradient)" />
</svg>`,
  },
  {
    id: "radial-gradient",
    title: "방사형 그라데이션",
    description: "방사형 그라데이션 패턴 예제",
    category: "패턴",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="radial">
      <stop offset="0%" stop-color="white" />
      <stop offset="100%" stop-color="darkblue" />
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#radial)" />
</svg>`,
  },
  {
    id: "pattern-example",
    title: "반복 패턴",
    description: "반복되는 패턴 예제",
    category: "패턴",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="2" fill="red" />
    </pattern>
  </defs>
  <rect x="10" y="10" width="80" height="80" fill="url(#dots)" />
</svg>`,
  },
  {
    id: "clipping-path",
    title: "클리핑 패스",
    description: "클리핑 패스를 이용한 이미지 자르기",
    category: "고급",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="heart">
      <path d="M50,30 A20,20 0,0,1 90,30 A20,20 0,0,1 50,70 A20,20 0,0,1 10,30 A20,20 0,0,1 50,30 Z" />
    </clipPath>
  </defs>
  <rect x="10" y="10" width="80" height="80" fill="purple" clip-path="url(#heart)" />
</svg>`,
  },
  {
    id: "mask-example",
    title: "마스크 효과",
    description: "마스크를 이용한 투명도 조절",
    category: "고급",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="fade">
      <linearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="white" />
        <stop offset="100%" stop-color="black" />
      </linearGradient>
      <rect x="0" y="0" width="100" height="100" fill="url(#maskGradient)" />
    </mask>
  </defs>
  <rect x="0" y="0" width="100" height="100" fill="blue" mask="url(#fade)" />
</svg>`,
  },
  {
    id: "compound-path",
    title: "복합 패스",
    description: "복잡한 패스를 이용한 도형 그리기",
    category: "고급",
    code: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M30,10 L70,10 L90,50 L70,90 L30,90 L10,50 Z M30,30 L50,50 L30,70 Z" fill="teal" />
</svg>`,
  },
];

// 예제 스토어 생성
export const useExampleStore = create<ExampleState>()((set, get) => ({
  // 초기 상태
  examples: EXAMPLE_DATA,
  selectedCategory: null,
  searchQuery: "",

  // 액션
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // 필터링된 예제 목록 반환
  getFilteredExamples: () => {
    const { examples, selectedCategory, searchQuery } = get();

    return examples.filter((example) => {
      // 카테고리 필터링
      const categoryMatch =
        !selectedCategory || example.category === selectedCategory;

      // 검색어 필터링 (제목 또는 설명에 검색어가 포함되는지)
      const searchMatch =
        !searchQuery ||
        example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        example.description.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });
  },
}));
