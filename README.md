# Vite + TypeScript + SWC + Zustand 템플릿

이 프로젝트는 다음 기술을 사용한 React 템플릿입니다:

- [Vite](https://vitejs.dev/) - 빠른 프론트엔드 빌드 도구
- [TypeScript](https://www.typescriptlang.org/) - 타입 안전성을 제공하는 JavaScript 슈퍼셋
- [SWC](https://swc.rs/) - 매우 빠른 JavaScript/TypeScript 컴파일러
- [Zustand](https://github.com/pmndrs/zustand) - 간단하고 빠른 상태 관리 라이브러리

## 기능

- **카운터**: 간단한 카운터 기능 (증가, 감소, 초기화)
- **할 일 목록**: 로컬 스토리지에 저장되는 할 일 목록 (추가, 완료 토글, 삭제)

## 시작하기

```bash
# 저장소 복제
git clone <repository-url>

# 디렉토리 이동
cd vite-ts-swc-zustand

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 빌드 및 배포

```bash
# 프로덕션용 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── components/      # 컴포넌트
│   ├── Counter.tsx  # 카운터 컴포넌트
│   └── TodoList.tsx # 할 일 목록 컴포넌트
├── store/           # Zustand 스토어
│   ├── useCounterStore.ts  # 카운터 스토어
│   └── useTodoStore.ts     # 할 일 목록 스토어
├── App.tsx          # 메인 앱 컴포넌트
└── main.tsx         # 진입점
```

## Zustand 사용 방법

이 템플릿은 Zustand를 사용한 상태 관리 예제를 포함합니다:

1. **스토어 생성**:
```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

2. **컴포넌트에서 스토어 사용**:
```typescript
import { useCounterStore } from '../store/useCounterStore';

function Counter() {
  const { count, increment } = useCounterStore();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>증가</button>
    </div>
  );
}
```
