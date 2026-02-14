# Runner Game - 게임 로직 설명

## 📋 목차
- [게임 개요](#게임-개요)
- [주요 상수 및 설정](#주요-상수-및-설정)
- [레벨 시스템](#레벨-시스템)
- [게임 루프](#게임-루프)
- [점프 물리 시스템](#점프-물리-시스템)
- [장애물 생성 로직](#장애물-생성-로직)
- [충돌 감지 시스템](#충돌-감지-시스템)
- [점수 시스템](#점수-시스템)

---

## 게임 개요

2D 러너 게임으로, 플레이어가 자동으로 앞으로 이동하며 Spacebar를 눌러 장애물을 뛰어넘는 게임입니다.

### 핵심 기능
- ✅ 자동 전진
- ✅ Spacebar 점프
- ✅ 레벨별 난이도 증가
- ✅ 연속 장애물 시스템
- ✅ 실시간 점수/레벨/속도 표시

---

## 주요 상수 및 설정

### 캔버스 설정
```typescript
const CANVAS_WIDTH = 800   // 캔버스 너비
const CANVAS_HEIGHT = 400  // 캔버스 높이
```

### 플레이어 설정
```typescript
const PLAYER_WIDTH = 40    // 플레이어 너비
const PLAYER_HEIGHT = 60   // 플레이어 높이
const PLAYER_X = 100       // 플레이어 고정 X 위치
const GROUND_Y = 300       // 지면 Y 위치 (CANVAS_HEIGHT - 100)
```

### 장애물 설정
```typescript
const OBSTACLE_WIDTH = 30   // 장애물 너비
const OBSTACLE_HEIGHT = 50  // 장애물 높이
```

### 물리 설정
```typescript
const GRAVITY = 0.8        // 중력 가속도
const JUMP_FORCE = -15     // 점프 초기 속도 (음수 = 위로)
```

---

## 레벨 시스템

### 레벨 계산
```typescript
const getLevel = (score: number) => Math.floor(score / 200) + 1
```
- 200점마다 레벨 1씩 증가
- Level 1: 0-199점
- Level 2: 200-399점
- Level 3: 400-599점
- Level N: (N-1) * 200 ~ N * 200 - 1점

### 레벨별 설정값

#### Level 1 (초보자)
```typescript
{
  speed: 5,                    // 속도
  minDistance: 350,            // 최소 장애물 간격
  maxDistance: 500,            // 최대 장애물 간격
  doubleObstacleChance: 0      // 연속 장애물 확률 0%
}
```

#### Level 2 (중급)
```typescript
{
  speed: 6,
  minDistance: 250,
  maxDistance: 350,
  doubleObstacleChance: 0.3    // 연속 장애물 확률 30%
}
```

#### Level 3 (고급)
```typescript
{
  speed: 7,
  minDistance: 200,
  maxDistance: 300,
  doubleObstacleChance: 0.4    // 연속 장애물 확률 40%
}
```

#### Level 4+ (최고난이도)
```typescript
{
  speed: 5 + (level - 1),                           // 레벨당 속도 +1
  minDistance: max(180, 250 - (level - 3) * 10),   // 점진적 감소
  maxDistance: max(250, 350 - (level - 3) * 15),   // 점진적 감소
  doubleObstacleChance: min(0.6, 0.4 + (level - 3) * 0.05)  // 최대 60%
}
```

---

## 게임 루프

### 메인 루프 구조
```typescript
const gameLoop = () => {
  if (gameOver) return

  // 1. 현재 레벨 설정 가져오기
  const currentLevel = getLevel(score)
  const config = getLevelConfig(currentLevel)

  // 2. 플레이어 물리 업데이트 (점프)
  // 3. 장애물 생성
  // 4. 장애물 이동 및 충돌 검사
  // 5. 화면 그리기
  // 6. 다음 프레임 요청

  animationFrameId = requestAnimationFrame(gameLoop)
}
```

### 실행 순서
1. **물리 계산**: 중력 적용 및 플레이어 위치 업데이트
2. **장애물 생성**: 조건 충족 시 새 장애물 생성
3. **장애물 업데이트**: 장애물 이동 및 충돌/점수 검사
4. **렌더링**: 배경, 지면, 플레이어, 장애물 순으로 그리기

---

## 점프 물리 시스템

### 물리 계산
```typescript
// 중력 적용
if (state.playerY < GROUND_Y || state.playerVelocityY < 0) {
  state.playerVelocityY += GRAVITY      // 속도에 중력 추가
  state.playerY += state.playerVelocityY // 위치 업데이트
}

// 착지 처리
if (state.playerY > GROUND_Y) {
  state.playerY = GROUND_Y
  state.playerVelocityY = 0
  state.isJumping = false
}
```

### 점프 발동 조건
```typescript
// Spacebar 입력 + 지면에 있을 때만 점프 가능
if (e.code === 'Space' && !gameOver && state.playerY === GROUND_Y) {
  state.playerVelocityY = JUMP_FORCE  // -15 (위로)
  state.isJumping = true
}
```

### 포물선 운동
1. **점프 시작**: velocityY = -15 (위로 이동)
2. **상승**: 매 프레임 +0.8 (중력), 속도가 점점 감소
3. **정점**: velocityY = 0
4. **하강**: velocityY > 0 (아래로 이동), 가속
5. **착지**: playerY ≥ GROUND_Y일 때 착지

---

## 장애물 생성 로직

### 생성 조건
```typescript
const lastObstacle = state.obstacles[state.obstacles.length - 1]
const canSpawnObstacle = !lastObstacle ||
  lastObstacle.x < CANVAS_WIDTH - state.nextObstacleDistance
```

**조건 설명:**
- 장애물이 없거나
- 마지막 장애물이 설정된 거리만큼 진행했을 때 생성

### 일반 장애물 vs 연속 장애물

#### 일반 장애물 (레벨별 간격)
```typescript
state.nextObstacleDistance =
  config.minDistance + Math.random() * (config.maxDistance - config.minDistance)
```
- 레벨별 최소/최대 간격 사이의 랜덤 값

#### 연속 장애물 (Level 2+)
```typescript
if (Math.random() < config.doubleObstacleChance) {
  state.nextObstacleDistance = 120 + Math.random() * 50  // 120-170px
}
```
- 확률적으로 발생
- 매우 짧은 간격 (120-170px)
- 빠른 타이밍 요구

### 생성 알고리즘 흐름도
```
장애물 생성 체크
    ↓
조건 충족? (YES/NO)
    ↓ YES
새 장애물 생성 (x = 800)
    ↓
랜덤 확률 체크
    ↓
연속 장애물? (YES/NO)
    ↓ YES           ↓ NO
간격 = 120-170   간격 = 레벨별 범위
    ↓               ↓
다음 프레임으로
```

---

## 충돌 감지 시스템

### AABB (Axis-Aligned Bounding Box) 충돌 검사
```typescript
const checkCollision = (obstacle: Obstacle): boolean => {
  // 플레이어 영역
  const playerLeft = PLAYER_X
  const playerRight = PLAYER_X + PLAYER_WIDTH
  const playerTop = state.playerY
  const playerBottom = state.playerY + PLAYER_HEIGHT

  // 장애물 영역
  const obstacleLeft = obstacle.x
  const obstacleRight = obstacle.x + OBSTACLE_WIDTH
  const obstacleTop = GROUND_Y
  const obstacleBottom = GROUND_Y + OBSTACLE_HEIGHT

  // 충돌 조건 (모든 축에서 겹침)
  return (
    playerRight > obstacleLeft &&      // 플레이어 오른쪽이 장애물 왼쪽보다 큼
    playerLeft < obstacleRight &&      // 플레이어 왼쪽이 장애물 오른쪽보다 작음
    playerBottom > obstacleTop &&      // 플레이어 아래가 장애물 위보다 큼
    playerTop < obstacleBottom         // 플레이어 위가 장애물 아래보다 작음
  )
}
```

### 충돌 처리
```typescript
if (checkCollision(obstacle)) {
  setGameOver(true)  // 게임 종료
  return false       // 장애물 제거
}
```

---

## 점수 시스템

### 점수 획득 조건
```typescript
if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < PLAYER_X) {
  obstacle.passed = true  // 중복 점수 방지
  setScore(prevScore => prevScore + 10)
}
```

**조건 설명:**
- `!obstacle.passed`: 아직 점수를 받지 않은 장애물
- `obstacle.x + OBSTACLE_WIDTH < PLAYER_X`: 장애물이 플레이어를 완전히 지나침

### 레벨 업데이트
```typescript
setScore(prevScore => {
  const newScore = prevScore + 10
  const newLevel = getLevel(newScore)

  // 레벨 변경 감지
  if (newLevel !== level) {
    setLevel(newLevel)  // 레벨 업!
  }

  return newScore
})
```

### 점수별 레벨 매핑
| 점수 범위 | 레벨 | 속도 | 난이도 |
|----------|------|------|--------|
| 0-190    | 1    | 5    | 쉬움   |
| 200-390  | 2    | 6    | 보통   |
| 400-590  | 3    | 7    | 어려움 |
| 600-790  | 4    | 8    | 매우 어려움 |
| 800+     | 5+   | 9+   | 극한   |

---

## 게임 상태 관리

### State 변수
```typescript
const [score, setScore] = useState(0)        // 현재 점수
const [level, setLevel] = useState(1)        // 현재 레벨
const [gameOver, setGameOver] = useState(false)  // 게임 종료 여부
const [isJumping, setIsJumping] = useState(false)  // 점프 중 여부
```

### Ref 변수 (렌더링 트리거 없이 관리)
```typescript
const gameStateRef = useRef({
  playerY: GROUND_Y,           // 플레이어 Y 위치
  playerVelocityY: 0,          // 플레이어 Y 속도
  obstacles: [],               // 장애물 배열
  frameCount: 0,               // 프레임 카운터
  isJumping: false,            // 내부 점프 상태
  nextObstacleDistance: 0      // 다음 장애물까지 거리
})
```

---

## 렌더링 시스템

### 그리기 순서
```typescript
// 1. 캔버스 초기화
ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

// 2. 배경 (하늘)
ctx.fillStyle = '#87CEEB'
ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

// 3. 지면
ctx.fillStyle = '#8B4513'
ctx.fillRect(0, GROUND_Y + PLAYER_HEIGHT, CANVAS_WIDTH,
             CANVAS_HEIGHT - GROUND_Y - PLAYER_HEIGHT)

// 4. 플레이어 (점프 시 색상 변경)
ctx.fillStyle = state.isJumping ? '#FF6B6B' : '#4ECDC4'
ctx.fillRect(PLAYER_X, state.playerY, PLAYER_WIDTH, PLAYER_HEIGHT)

// 5. 플레이어 눈
ctx.fillStyle = '#000'
ctx.fillRect(PLAYER_X + 10, state.playerY + 15, 5, 5)
ctx.fillRect(PLAYER_X + 25, state.playerY + 15, 5, 5)

// 6. 장애물들
state.obstacles.forEach(obstacle => {
  // 외부
  ctx.fillStyle = '#E74C3C'
  ctx.fillRect(obstacle.x, GROUND_Y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT)

  // 내부 디테일
  ctx.fillStyle = '#C0392B'
  ctx.fillRect(obstacle.x + 5, GROUND_Y + 5,
               OBSTACLE_WIDTH - 10, OBSTACLE_HEIGHT - 10)
})
```

### 시각적 피드백
- **점프 중**: 플레이어 색상 청록색(#4ECDC4) → 빨강색(#FF6B6B)
- **레벨 업**: UI에서 레벨 숫자 증가
- **속도 증가**: 장애물 이동 속도 체감 증가

---

## 성능 최적화

### requestAnimationFrame 사용
```typescript
animationFrameId = requestAnimationFrame(gameLoop)
```
- 브라우저 최적화된 애니메이션
- 60 FPS 목표
- 탭이 비활성화되면 자동 중지

### 메모리 관리
```typescript
// 화면 밖 장애물 자동 제거
state.obstacles = state.obstacles.filter(obstacle =>
  obstacle.x + OBSTACLE_WIDTH > 0
)
```

### useEffect 의존성
```typescript
useEffect(() => {
  // ... 게임 로직
}, [gameOver, score, level])
```
- `gameOver`, `score`, `level` 변경 시에만 재실행
- 불필요한 재렌더링 방지

---

## 게임 재시작

### 초기화 로직
```typescript
const handleRestart = () => {
  setScore(0)
  setLevel(1)
  setGameOver(false)
  setIsJumping(false)

  const initialConfig = getLevelConfig(1)
  gameStateRef.current = {
    playerY: GROUND_Y,
    playerVelocityY: 0,
    obstacles: [],
    frameCount: 0,
    isJumping: false,
    nextObstacleDistance: initialConfig.minDistance +
      Math.random() * (initialConfig.maxDistance - initialConfig.minDistance)
  }
}
```

---

## 기술 스택

- **React 19.2.4**: UI 프레임워크
- **TypeScript 5.9.3**: 타입 안정성
- **Canvas API**: 2D 그래픽 렌더링
- **CSS Modules**: 스타일 격리
- **Vite 7.3.1**: 빌드 도구

---

## 향후 개선 가능 사항

### 게임플레이
- [ ] 파워업 아이템 추가
- [ ] 다양한 장애물 타입
- [ ] 배경 스크롤 애니메이션
- [ ] 사운드 효과 및 배경음악

### 난이도
- [ ] 난이도 선택 (Easy/Normal/Hard)
- [ ] 무한 모드 vs 스테이지 모드
- [ ] 보스 장애물

### 소셜 기능
- [ ] 최고 점수 저장 (LocalStorage)
- [ ] 리더보드
- [ ] 점수 공유

### 시각적 개선
- [ ] 파티클 효과
- [ ] 애니메이션 트랜지션
- [ ] 다크/라이트 테마

---

## 라이선스

MIT License

## 작성자

Claude Sonnet 4.5
