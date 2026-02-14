import { useState } from 'react'
import Game from './components/Game'
import styles from './App.module.css'

function App() {
  const [gameKey, setGameKey] = useState(0)

  const handleRestart = () => {
    setGameKey(prev => prev + 1)
  }

  return (
    <div className={styles.app}>
      <h1 className={styles.app__title}>Runner Game</h1>
      <Game key={gameKey} onRestart={handleRestart} />
    </div>
  )
}

export default App
