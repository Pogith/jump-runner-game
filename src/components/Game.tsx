import { useEffect, useRef, useState } from 'react'
import styles from './Game.module.css'

interface GameProps {
  onRestart: () => void
}

interface Obstacle {
  x: number
  passed: boolean
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 60
const PLAYER_X = 100
const GROUND_Y = CANVAS_HEIGHT - 100
const OBSTACLE_WIDTH = 30
const OBSTACLE_HEIGHT = 50
const GRAVITY = 0.8
const JUMP_FORCE = -15

// 레벨별 설정
const getLevelConfig = (level: number) => {
  const baseSpeed = 5
  const speed = baseSpeed + (level - 1)

  // 레벨별 장애물 간격 설정
  let minDistance: number
  let maxDistance: number
  let doubleObstacleChance: number // 연속 장애물 확률

  if (level === 1) {
    // Level 1: 여유로운 간격
    minDistance = 350
    maxDistance = 500
    doubleObstacleChance = 0
  } else if (level === 2) {
    // Level 2: 간격 좁아지고 가끔 연속 장애물
    minDistance = 250
    maxDistance = 350
    doubleObstacleChance = 0.3
  } else if (level === 3) {
    // Level 3: 더 좁은 간격, 연속 장애물 증가
    minDistance = 200
    maxDistance = 300
    doubleObstacleChance = 0.4
  } else {
    // Level 4+: 매우 어려움
    minDistance = Math.max(180, 250 - (level - 3) * 10)
    maxDistance = Math.max(250, 350 - (level - 3) * 15)
    doubleObstacleChance = Math.min(0.6, 0.4 + (level - 3) * 0.05)
  }

  return { speed, minDistance, maxDistance, doubleObstacleChance }
}

const getLevel = (score: number) => Math.floor(score / 200) + 1

function Game({ onRestart }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isJumping, setIsJumping] = useState(false)

  const gameStateRef = useRef({
    playerY: GROUND_Y,
    playerVelocityY: 0,
    obstacles: [] as Obstacle[],
    frameCount: 0,
    isJumping: false,
    nextObstacleDistance: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !gameOver) {
        e.preventDefault()
        const state = gameStateRef.current

        if (state.playerY === GROUND_Y) {
          state.playerVelocityY = JUMP_FORCE
          state.isJumping = true
          setIsJumping(true)
        }
      }
    }

    const checkCollision = (obstacle: Obstacle): boolean => {
      const state = gameStateRef.current
      const playerLeft = PLAYER_X
      const playerRight = PLAYER_X + PLAYER_WIDTH
      const playerTop = state.playerY
      const playerBottom = state.playerY + PLAYER_HEIGHT

      const obstacleLeft = obstacle.x
      const obstacleRight = obstacle.x + OBSTACLE_WIDTH
      const obstacleTop = GROUND_Y
      const obstacleBottom = GROUND_Y + OBSTACLE_HEIGHT

      return (
        playerRight > obstacleLeft &&
        playerLeft < obstacleRight &&
        playerBottom > obstacleTop &&
        playerTop < obstacleBottom
      )
    }

    const gameLoop = () => {
      if (gameOver) return

      const state = gameStateRef.current
      state.frameCount++

      // 현재 레벨 설정 가져오기
      const currentLevel = getLevel(score)
      const config = getLevelConfig(currentLevel)

      // 플레이어 점프 물리
      if (state.playerY < GROUND_Y || state.playerVelocityY < 0) {
        state.playerVelocityY += GRAVITY
        state.playerY += state.playerVelocityY

        if (state.playerY > GROUND_Y) {
          state.playerY = GROUND_Y
          state.playerVelocityY = 0
          state.isJumping = false
          setIsJumping(false)
        }
      }

      // 장애물 생성 (레벨에 따른 간격으로 생성)
      const lastObstacle = state.obstacles[state.obstacles.length - 1]
      const canSpawnObstacle = !lastObstacle || lastObstacle.x < CANVAS_WIDTH - state.nextObstacleDistance

      if (canSpawnObstacle) {
        state.obstacles.push({
          x: CANVAS_WIDTH,
          passed: false,
        })

        // 다음 장애물까지의 거리 설정 (레벨에 따라)
        const isDoubleObstacle = Math.random() < config.doubleObstacleChance

        if (isDoubleObstacle) {
          // 연속 장애물: 매우 짧은 간격
          state.nextObstacleDistance = 120 + Math.random() * 50
        } else {
          // 일반 장애물: 레벨에 맞는 랜덤 거리
          state.nextObstacleDistance = config.minDistance + Math.random() * (config.maxDistance - config.minDistance)
        }
      }

      // 장애물 이동 및 충돌 검사
      state.obstacles = state.obstacles.filter(obstacle => {
        obstacle.x -= config.speed

        // 충돌 검사
        if (checkCollision(obstacle)) {
          setGameOver(true)
          return false
        }

        // 장애물을 넘었을 때 점수 증가
        if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < PLAYER_X) {
          obstacle.passed = true
          setScore(prevScore => {
            const newScore = prevScore + 10
            const newLevel = getLevel(newScore)

            // 레벨 업데이트
            if (newLevel !== level) {
              setLevel(newLevel)
            }

            return newScore
          })
        }

        // 화면 밖으로 나간 장애물 제거
        return obstacle.x + OBSTACLE_WIDTH > 0
      })

      // 그리기
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 배경
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // 지면
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(0, GROUND_Y + PLAYER_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y - PLAYER_HEIGHT)

      // 플레이어
      ctx.fillStyle = state.isJumping ? '#FF6B6B' : '#4ECDC4'
      ctx.fillRect(PLAYER_X, state.playerY, PLAYER_WIDTH, PLAYER_HEIGHT)

      // 플레이어 눈
      ctx.fillStyle = '#000'
      ctx.fillRect(PLAYER_X + 10, state.playerY + 15, 5, 5)
      ctx.fillRect(PLAYER_X + 25, state.playerY + 15, 5, 5)

      // 장애물
      state.obstacles.forEach(obstacle => {
        ctx.fillStyle = '#E74C3C'
        ctx.fillRect(obstacle.x, GROUND_Y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT)

        // 장애물 디테일
        ctx.fillStyle = '#C0392B'
        ctx.fillRect(obstacle.x + 5, GROUND_Y + 5, OBSTACLE_WIDTH - 10, OBSTACLE_HEIGHT - 10)
      })

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    window.addEventListener('keydown', handleKeyDown)
    gameLoop()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameOver, score, level])

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
      nextObstacleDistance: initialConfig.minDistance + Math.random() * (initialConfig.maxDistance - initialConfig.minDistance),
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.game__info}>
        <div className={styles.game__stat}>
          <span className={styles['game__stat-label']}>점수:</span>
          <span className={styles['game__stat-value']}>{score}</span>
        </div>
        <div className={styles.game__stat}>
          <span className={styles['game__stat-label']}>레벨:</span>
          <span className={styles['game__stat-value']}>{level}</span>
        </div>
        <div className={styles.game__stat}>
          <span className={styles['game__stat-label']}>속도:</span>
          <span className={styles['game__stat-value']}>{getLevelConfig(level).speed}</span>
        </div>
      </div>

      <div className={styles['game__canvas-wrapper']}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.game__canvas}
        />

        {gameOver && (
          <div className={styles.game__over}>
            <h2 className={styles['game__over-title']}>게임 오버!</h2>
            <p className={styles['game__over-text']}>최종 점수: {score}</p>
            <p className={styles['game__over-text']}>최종 레벨: {level}</p>
            <p className={styles['game__over-text']}>최종 속도: {getLevelConfig(level).speed}</p>
            <button onClick={handleRestart} className={styles.game__button}>
              다시 시작
            </button>
          </div>
        )}
      </div>

      <div className={styles.game__instructions}>
        <p className={styles['game__instructions-text']}>
          🎮 <strong className={styles['game__instructions-highlight']}>Spacebar</strong>를 눌러 점프하세요!
        </p>
        <p className={styles['game__instructions-text']}>🎯 장애물을 뛰어넘으면 10점</p>
        <p className={styles['game__instructions-text']}>⚡ 200점마다 레벨 업 & 난이도 증가</p>
      </div>
    </div>
  )
}

export default Game
