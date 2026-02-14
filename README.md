# 🎮 Jump Runner Game

2D 러너 게임 - Vite + React + TypeScript로 제작된 브라우저 기반 점프 액션 게임

![React](https://img.shields.io/badge/React-19.2.4-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff?logo=vite)
![pnpm](https://img.shields.io/badge/pnpm-9.15.4-f69220?logo=pnpm)

## 📝 소개

자동으로 전진하는 캐릭터가 장애물을 뛰어넘으며 점수를 얻는 간단하면서도 중독성 있는 러너 게임입니다.
점수가 올라갈수록 속도가 증가하고 난이도가 높아지는 레벨 시스템이 구현되어 있습니다.

### ✨ 주요 특징

- 🎯 **직관적인 컨트롤**: Spacebar 하나로 모든 조작
- 📈 **레벨 시스템**: 200점마다 레벨 업, 난이도 증가
- ⚡ **동적 난이도**: 속도 증가, 장애물 간격 감소, 연속 장애물
- 🎨 **깔끔한 UI**: CSS Module과 BEM 네이밍 적용
- 📱 **반응형 디자인**: 모바일 환경 지원
- 🚀 **최신 기술 스택**: React 19, TypeScript 5.9, Vite 7

## 🎮 게임 방법

### 조작법

- **Spacebar**: 점프
- 장애물을 뛰어넘어 점수를 획득하세요!

### 게임 규칙

1. 장애물을 성공적으로 넘으면 **10점** 획득
2. **200점**마다 레벨 업 (속도 증가 + 난이도 상승)
3. 장애물과 충돌하면 게임 오버
4. 최고 점수 달성에 도전하세요!

### 레벨별 난이도

| 레벨 | 점수 범위 | 속도 | 장애물 간격      | 연속 장애물 | 난이도        |
| ---- | --------- | ---- | ---------------- | ----------- | ------------- |
| 1    | 0-199     | 5    | 넓음 (350-500px) | 없음        | ⭐ 쉬움       |
| 2    | 200-399   | 6    | 보통 (250-350px) | 30%         | ⭐⭐ 보통     |
| 3    | 400-599   | 7    | 좁음 (200-300px) | 40%         | ⭐⭐⭐ 어려움 |
| 4+   | 600+      | 8+   | 매우 좁음        | 최대 60%    | ⭐⭐⭐⭐ 극한 |

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: v18 이상
- **pnpm**: v9.15.4 이상

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd test-game

# 의존성 설치
pnpm install
```

### 실행

```bash
# 개발 서버 실행
pnpm dev

# 브라우저에서 http://localhost:5173 접속
```

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

## 📂 프로젝트 구조

```
test-game/
├── src/
│   ├── components/
│   │   ├── Game.tsx              # 메인 게임 컴포넌트
│   │   └── Game.module.css       # 게임 스타일 (CSS Module)
│   ├── App.tsx                   # 루트 컴포넌트
│   ├── App.module.css            # 앱 스타일 (CSS Module)
│   ├── main.tsx                  # 진입점
│   ├── index.css                 # 글로벌 스타일
│   └── vite-env.d.ts             # Vite 타입 정의
├── public/                       # 정적 파일
├── index.html                    # HTML 템플릿
├── vite.config.ts                # Vite 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 프로젝트 메타데이터
├── GAME_LOGIC.md                 # 게임 로직 상세 설명
└── README.md                     # 프로젝트 문서 (현재 파일)
```

## 🛠️ 기술 스택

### 프론트엔드

- **React 19.2.4**: UI 라이브러리
- **TypeScript 5.9.3**: 타입 안정성
- **CSS Modules**: 컴포넌트 단위 스타일링
- **BEM 네이밍**: 명확한 CSS 클래스 구조

### 빌드 도구

- **Vite 7.3.1**: 빠른 개발 서버 및 빌드
- **@vitejs/plugin-react 5.1.4**: React 플러그인
- **pnpm 9.15.4**: 효율적인 패키지 관리

### 렌더링

- **Canvas API**: 2D 그래픽 렌더링
- **requestAnimationFrame**: 부드러운 애니메이션

## 🎯 핵심 기능 구현

### 1. 레벨 시스템

```typescript
const getLevel = (score: number) => Math.floor(score / 200) + 1;
```

점수에 따라 자동으로 레벨이 증가하며, 각 레벨마다 속도와 장애물 패턴이 변경됩니다.

### 2. 물리 엔진

```typescript
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
```

현실감 있는 점프 물리를 구현하여 포물선 운동을 시뮬레이션합니다.

### 3. 충돌 감지

AABB (Axis-Aligned Bounding Box) 알고리즘을 사용한 정확한 충돌 검사를 구현했습니다.

### 4. 동적 장애물 생성

레벨에 따라 장애물 간격이 동적으로 조정되며, Level 2부터는 연속 장애물이 확률적으로 등장합니다.

## 📖 개발 가이드

### 코드 스타일

- **CSS**: BEM 네이밍 규칙 적용
  - Block: `.game`, `.app`
  - Element: `.game__canvas`, `.game__stat`
  - Modifier: `.game__button--disabled`

### 상태 관리

- **useState**: UI 상태 (점수, 레벨, 게임 오버)
- **useRef**: 게임 로직 상태 (위치, 속도, 장애물)
- **useEffect**: 게임 루프 및 이벤트 리스너

### 게임 로직 상세 설명

게임의 상세한 로직은 [GAME_LOGIC.md](./GAME_LOGIC.md)를 참고하세요.

## 🧪 개발 시 유용한 명령어

```bash
# 개발 서버 실행
pnpm dev

# TypeScript 타입 체크
pnpm build

# 의존성 업데이트 확인
pnpm outdated

# 의존성 업데이트
pnpm update
```

## 🔧 설정 파일

### tsconfig.json

- **strict 모드**: 타입 안정성 강화
- **JSX**: React JSX 변환
- **ES2020**: 최신 JavaScript 기능 사용

### vite.config.ts

- **@vitejs/plugin-react**: React Fast Refresh 지원
- **Hot Module Replacement (HMR)**: 빠른 개발 경험

## 📊 성능 최적화

- ✅ **requestAnimationFrame**: 브라우저 최적화된 애니메이션
- ✅ **Canvas 렌더링**: DOM 조작 최소화
- ✅ **메모리 관리**: 화면 밖 장애물 자동 제거
- ✅ **useRef 활용**: 불필요한 리렌더링 방지

## 🎨 스타일링

### CSS Module 사용 이유

- ✅ **스코프 격리**: 클래스명 충돌 방지
- ✅ **타입 안정성**: TypeScript 지원
- ✅ **번들 최적화**: 사용되지 않는 스타일 제거

### BEM 네이밍 적용

```css
.game {
} /* Block */
.game__canvas {
} /* Element */
.game__button--restart {
} /* Modifier */
```

## 🚧 향후 계획

### 게임플레이

- [ ] 파워업 아이템 추가 (무적, 슬로우 모션 등)
- [ ] 다양한 장애물 타입 (높은 장애물, 움직이는 장애물)
- [ ] 배경 스크롤 애니메이션
- [ ] 사운드 효과 및 배경음악
- [ ] 코인 수집 시스템

### 난이도 & 모드

- [ ] 난이도 선택 (Easy/Normal/Hard)
- [ ] 무한 모드 vs 스테이지 모드
- [ ] 보스 스테이지

### 소셜 & 데이터

- [ ] 최고 점수 저장 (LocalStorage)
- [ ] 온라인 리더보드
- [ ] 점수 공유 기능
- [ ] 통계 데이터 (평균 점수, 플레이 시간 등)

### UI/UX

- [ ] 파티클 효과
- [ ] 부드러운 애니메이션 트랜지션
- [ ] 다크/라이트 테마
- [ ] 게임 튜토리얼
- [ ] 일시정지 기능

### 기술적 개선

- [ ] PWA 지원 (오프라인 플레이)
- [ ] 다국어 지원 (i18n)
- [ ] 단위 테스트 추가
- [ ] E2E 테스트 추가

## 🎓 학습 자료

이 프로젝트는 다음을 학습하는 데 도움이 됩니다:

- ✅ React 19의 최신 기능
- ✅ TypeScript를 이용한 타입 안전한 개발
- ✅ Canvas API를 활용한 2D 게임 개발
- ✅ CSS Modules과 BEM 네이밍 규칙
- ✅ 게임 물리 엔진 기초
- ✅ 상태 관리 패턴
- ✅ Vite를 이용한 모던 프론트엔드 개발

## 🌟 Star History

이 프로젝트가 도움이 되었다면 ⭐️를 눌러주세요!

---

**Made with ❤️ using React, TypeScript, and Canvas API**
