"use client"

import { useState, useEffect, useCallback } from "react"
import { type GameState, INITIAL_STATE, CHARACTERS } from "@/types/game-types"
import { loadGameState, saveGameState } from "@/utils/storage-utils"
import { getToneAudioManager } from "@/utils/tone-audio-manager"
import CharacterSelect from "@/components/character-select"
import SectorMap from "@/components/sector-map"
import Combat from "@/components/combat"
import GameOver from "@/components/game-over"
import SoundToggle from "@/components/sound-toggle"
import AudioStartButton from "@/components/audio-start-button"

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [currentScreen, setCurrentScreen] = useState<string>("character-select")
  const [combatProps, setCombatProps] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [transitionClass, setTransitionClass] = useState("")
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Define updateGameState function
  const updateGameState = (newState: GameState) => {
    setGameState(newState)
    saveGameState(newState)
  }

  // Add this function to initialize audio
  const initializeAudio = useCallback(async () => {
    if (audioInitialized) return

    const audioManager = getToneAudioManager()
    if (audioManager) {
      try {
        await audioManager.initialize()
        setAudioInitialized(true)
        console.log("Audio initialized from user interaction")
      } catch (error) {
        console.error("Error initializing audio:", error)
      }
    }
  }, [audioInitialized])

  useEffect(() => {
    // Load saved game state
    const savedState = loadGameState()
    setGameState(savedState)
    setIsLoading(false)

    // We'll initialize audio on user interaction, not here
    console.log("Component mounted, waiting for user interaction to play audio")

    // Add event listeners for user interaction
    const handleUserInteraction = () => {
      initializeAudio()
      // Remove event listeners after initialization
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [initializeAudio])

  // Update the changeScreen function to initialize audio if needed
  const changeScreen = (screen: string) => {
    // Initialize audio if not already done
    initializeAudio()

    // Play transition sound
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playSound("click")
    }

    // Animate transition
    setTransitionClass("animate-fadeOut")

    setTimeout(() => {
      setCurrentScreen(screen)

      // Update music based on screen
      if (audioManager) {
        switch (screen) {
          case "character-select":
            audioManager.playMusic("title")
            break
          case "sector-map":
            audioManager.playMusic("map")
            break
          case "combat":
            audioManager.playMusic("combat")
            break
          case "game-over":
            audioManager.playMusic("gameover")
            break
        }
      }

      setTransitionClass("animate-fadeIn")
    }, 300)
  }

  const selectCharacter = (characterName: string) => {
    const character = CHARACTERS[characterName]
    const newState = {
      ...gameState,
      currentRun: {
        ...gameState.currentRun,
        character,
      },
    }
    updateGameState(newState)
    changeScreen("sector-map")
  }

  const selectNode = (nodeIndex: number, nodeType: string) => {
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playSound("node-select")
    }

    const newState = {
      ...gameState,
      currentRun: {
        ...gameState.currentRun,
        node: nodeIndex,
      },
    }
    updateGameState(newState)

    if (nodeType === "combat" || nodeType === "boss") {
      setCombatProps({
        nodeType,
        difficulty: nodeType === "boss" ? "hard" : "normal",
      })
      changeScreen("combat")
    } else if (nodeType === "shop") {
      // For now, just give some resources and stay on the map
      const updatedState = {
        ...newState,
        currentRun: {
          ...newState.currentRun,
          resources: {
            ...newState.currentRun.resources,
            tokens: newState.currentRun.resources.tokens + 10,
          },
        },
      }
      updateGameState(updatedState)
    }
  }

  const handleCombatResult = (result: { success: boolean; percentage: number }) => {
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playSound(result.success ? "success" : "failure")
    }

    const newState = { ...gameState }

    if (result.success) {
      // Perfect solution
      newState.currentRun.resources.tokens += 20
      newState.currentRun.resources.money += 50
    } else if (result.percentage >= 50) {
      // Partial success
      const tokenReward = Math.floor(result.percentage / 10)
      const moneyReward = Math.floor(result.percentage / 2)

      newState.currentRun.resources.tokens += tokenReward
      newState.currentRun.resources.money += moneyReward
    } else {
      // Failure
      const damage = 100 - result.percentage
      newState.currentRun.health -= damage

      // Check if game over
      if (newState.currentRun.health <= 0) {
        newState.currentRun.health = 0
        updateGameState(newState)
        changeScreen("game-over")
        return
      }
    }

    updateGameState(newState)
    changeScreen("sector-map")
  }

  const startNewRun = () => {
    const newState = {
      ...gameState,
      currentRun: {
        ...INITIAL_STATE.currentRun,
      },
    }
    updateGameState(newState)
    changeScreen("character-select")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 bg-[url('/assets/images/background.jpg')] bg-cover bg-center">
        <div className="w-full max-w-4xl p-8 rounded-lg bg-gray-900/80 backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">Rogue Vibes</h1>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-3 w-3 bg-cyan-400 rounded-full"></div>
              <div className="h-3 w-3 bg-cyan-400 rounded-full"></div>
              <div className="h-3 w-3 bg-cyan-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 bg-[url('/assets/images/background.jpg')] bg-cover bg-center">
      <SoundToggle />
      <AudioStartButton />

      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-6 text-center text-shadow">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
            Rogue Vibes
          </span>
        </h1>

        <div
          className={`bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden transition-opacity duration-300 ${transitionClass}`}
        >
          {currentScreen === "character-select" && (
            <CharacterSelect
              unlockedCharacters={gameState.progression.unlockedCharacters}
              onSelectCharacter={selectCharacter}
            />
          )}

          {currentScreen === "sector-map" && (
  <SectorMap
    gameState={gameState}
    onSelectNode={selectNode}
    onUnlockNode={(nodeIndex) => {
      // Only update if nodeIndex is greater than current
      if (nodeIndex > gameState.currentRun.node) {
        const newState = {
          ...gameState,
          currentRun: {
            ...gameState.currentRun,
            node: nodeIndex,
          },
        }
        updateGameState(newState)
      }
    }}
  />
)}

          {currentScreen === "combat" && combatProps && (
            <Combat
              gameState={gameState}
              difficulty={combatProps.difficulty}
              nodeType={combatProps.nodeType}
              onCombatComplete={handleCombatResult}
            />
          )}

          {currentScreen === "game-over" && <GameOver gameState={gameState} onRestart={startNewRun} />}
        </div>
      </div>

      <div className="mt-6 text-gray-300 text-sm text-center max-w-md">
        <p className="mb-1">A roguelike game with matrix multiplication combat.</p>
        <p>Use your AI agent to solve matrix challenges and progress through sectors.</p>
      </div>
    </main>
  )
}
