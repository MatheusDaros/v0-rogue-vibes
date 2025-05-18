"use client"

import { useState, useEffect, useRef } from "react"
import type { GameState } from "@/types/game-types"
import { createMatrixChallenge } from "@/utils/matrix-utils"
import { getToneAudioManager } from "@/utils/tone-audio-manager"

interface CombatProps {
  gameState: GameState
  difficulty: string
  nodeType: string
  onCombatComplete: (result: { success: boolean; percentage: number }) => void
}

export default function Combat({ gameState, difficulty, nodeType, onCombatComplete }: CombatProps) {
  const character = gameState.currentRun.character!
  const matrixSize = character.matrixSize
  const numberRange = character.numberRange

  const [matrices, setMatrices] = useState(() => createMatrixChallenge(matrixSize, numberRange))
  const [userSolution, setUserSolution] = useState<(number | null)[][]>(
    Array(matrixSize)
      .fill(0)
      .map(() => Array(matrixSize).fill(null)),
  )
  const [timeLeft, setTimeLeft] = useState(difficulty === "hard" ? 30 : 45)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<{ success: boolean; percentage: number } | null>(null)
  const [isTimeCritical, setIsTimeCritical] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const tickSoundRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize timer
  useEffect(() => {
    // Add character time bonus
    setTimeLeft((prev) => prev + character.timeBonus)

    // Pre-fill cells if character has that ability
    if (character.preFilled) {
      const newSolution = [...userSolution.map(row => [...row])]
      if (character.name === "Binary Bot" && character.preFilled === 3) {
        // Pre-fill three cells: top-left, top-right, bottom-left
        newSolution[0][0] = matrices.solution[0][0]
        newSolution[0][1] = matrices.solution[0][1]
        newSolution[1][0] = matrices.solution[1][0]
      } else {
        // Default: pre-fill one cell
        newSolution[0][0] = matrices.solution[0][0]
      }
      setUserSolution(newSolution)
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        // Play tick sound when time is running low
        if (prev <= 10 && prev > 0) {
          setIsTimeCritical(true)
          const audioManager = getToneAudioManager()
          if (audioManager && prev % 2 === 0) {
            // Play every 2 seconds to avoid too much noise
            audioManager.playSound("timer")
          }
        }

        if (prev <= 1) {
          clearInterval(timerRef.current!)
          checkSolution(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (tickSoundRef.current) {
        clearInterval(tickSoundRef.current)
      }
    }
  }, [])

  const handleInputChange = (row: number, col: number, value: string) => {
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playSound("click")
    }

    const newValue = value === "" ? null : Number.parseInt(value)
    const newSolution = [...userSolution]
    newSolution[row][col] = newValue
    setUserSolution(newSolution)
  }

  const checkSolution = (timeOut = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (tickSoundRef.current) {
      clearInterval(tickSoundRef.current)
    }

    // Check if all inputs are filled
    let allFilled = true
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (userSolution[i][j] === null) {
          allFilled = false
          break
        }
      }
    }

    if (!allFilled && !timeOut) {
      // Play warning sound
      const audioManager = getToneAudioManager()
      if (audioManager) {
        audioManager.playSound("failure")
      }

      // Restart timer if not all cells are filled
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 10 && prev > 0) {
            setIsTimeCritical(true)
            const audioManager = getToneAudioManager()
            if (audioManager && prev % 2 === 0) {
              audioManager.playSound("timer")
            }
          }

          if (prev <= 1) {
            clearInterval(timerRef.current!)
            checkSolution(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return
    }

    // Check solution
    let correct = true
    let score = 0
    const totalCells = matrixSize * matrixSize

    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (userSolution[i][j] === matrices.solution[i][j]) {
          score++
        } else {
          correct = false
        }
      }
    }

    // Calculate percentage correct
    const percentage = Math.floor((score / totalCells) * 100)

    // Play sound based on result
    const audioManager = getToneAudioManager()
    if (audioManager) {
      if (correct) {
        audioManager.playSound("success")
      } else if (percentage >= 50) {
        audioManager.playSound("success")
      } else {
        audioManager.playSound("failure")
      }
    }

    setResult({ success: correct, percentage })
    setShowResult(true)

    // Delay before returning to map
    setTimeout(() => {
      onCombatComplete({ success: correct, percentage })
    }, 3000)
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          MATRIX COMBAT
        </span>
      </h2>
      <div className={`text-center mb-6 ${isTimeCritical ? "text-red-500 animate-pulse font-bold" : "text-red-400"}`}>
        Time: {timeLeft}s
      </div>

      {showResult && result ? (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg text-center">
          <h3
            className={`text-3xl font-bold mb-4 ${
              result.success ? "text-green-400" : result.percentage >= 50 ? "text-yellow-400" : "text-red-400"
            }`}
          >
            {result.success ? "PERFECT SOLUTION!" : result.percentage >= 50 ? "PARTIAL SUCCESS" : "COMBAT FAILED"}
          </h3>

          <div className="mb-4">
            <div className="inline-block px-4 py-2 rounded-full bg-gray-700/50">
              {result.success ? (
                <span className="text-green-400">+20 tokens, +$50</span>
              ) : result.percentage >= 50 ? (
                <span className="text-yellow-400">
                  +{Math.floor(result.percentage / 10)} tokens, +${Math.floor(result.percentage / 2)}
                </span>
              ) : (
                <span className="text-red-400">Took {100 - (result.percentage || 0)}% damage</span>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
            <div
              className={`h-4 rounded-full ${
                result.success ? "bg-green-500" : result.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${result.percentage}%` }}
            ></div>
          </div>

          <p className="text-gray-300 mb-6">Accuracy: {result.percentage}%</p>

          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-white mb-4 font-medium">Correct Solution:</h4>
            <div className="flex justify-center">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
                {matrices.solution.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`sol-${i}-${j}`}
                      className="w-12 h-12 bg-gray-600 flex items-center justify-center text-white font-mono rounded"
                    >
                      {cell}
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Matrix A */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-white text-center mb-4 font-medium">Matrix A</h3>
              <div className="flex justify-center">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
                  {matrices.matrixA.map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`a-${i}-${j}`}
                        className="w-12 h-12 bg-blue-900/50 flex items-center justify-center text-white font-mono rounded shadow-inner"
                      >
                        {cell}
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>

            {/* Matrix B */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-white text-center mb-4 font-medium">Matrix B</h3>
              <div className="flex justify-center">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
                  {matrices.matrixB.map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`b-${i}-${j}`}
                        className="w-12 h-12 bg-purple-900/50 flex items-center justify-center text-white font-mono rounded shadow-inner"
                      >
                        {cell}
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>

            {/* Solution Input */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h3 className="text-white text-center mb-4 font-medium">Your Solution</h3>
              <div className="flex justify-center">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
                  {userSolution.map((row, i) =>
                    row.map((cell, j) => (
                      <div key={`sol-${i}-${j}`} className="w-12 h-12">
                        <input
                          type="number"
                          value={cell === null ? "" : cell}
                          onChange={(e) => handleInputChange(i, j, e.target.value)}
                          disabled={character.preFilled > 0 && i === 0 && j === 0}
                          className={`w-full h-full bg-gray-700 text-white text-center font-mono rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                            character.preFilled && i === 0 && j === 0 ? "bg-green-900/50" : "hover:bg-gray-600"
                          }`}
                        />
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-4">Calculate the product of Matrix A × Matrix B</p>
            <button
              onClick={() => checkSolution()}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
