"use client"

import { useEffect } from "react"
import type { GameState } from "@/types/game-types"
import { getToneAudioManager } from "@/utils/tone-audio-manager"

interface GameOverProps {
  gameState: GameState
  onRestart: () => void
}

export default function GameOver({ gameState, onRestart }: GameOverProps) {
  useEffect(() => {
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playMusic("gameover")
    }
  }, [])

  const handleRestart = () => {
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playSound("click")
    }
    onRestart()
  }

  return (
    <div className="p-8 text-center">
      <h2 className="text-5xl font-bold text-red-500 mb-8 animate-pulse">GAME OVER</h2>

      <div className="mb-12 bg-gray-800/50 p-6 rounded-lg">
        <div className="mb-6">
          <div className="inline-block px-6 py-3 bg-gray-700/50 rounded-lg mb-4">
            <p className="text-white text-2xl">Sector Reached: {gameState.currentRun.sector}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/30 p-4 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-3 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-yellow-400 text-2xl">${gameState.currentRun.resources.money}</span>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-3 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-blue-400 text-2xl">{gameState.currentRun.resources.tokens} tokens</span>
          </div>
        </div>

        <p className="text-gray-300 mb-2">Your AI agent has been defeated.</p>
        <p className="text-gray-400">The matrix calculations were too complex to handle.</p>
      </div>

      <button
        onClick={handleRestart}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        START NEW RUN
      </button>
    </div>
  )
}
