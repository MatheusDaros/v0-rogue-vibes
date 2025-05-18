"use client"

import { useState, useEffect } from "react"
import { getToneAudioManager } from "@/utils/tone-audio-manager"

export default function AudioStartButton() {
  const [isVisible, setIsVisible] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const startAudio = async () => {
    setIsLoading(true)

    try {
      // Get the audio manager and initialize it
      const audioManager = getToneAudioManager()
      if (audioManager) {
        await audioManager.initialize()
        console.log("Audio initialized from button click")
      }

      // Hide the button
      setIsVisible(false)
    } catch (error) {
      console.error("Error starting audio:", error)
      // Hide the button even if there's an error
      setIsVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient || !isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Enable Game Audio</h2>
        <p className="text-gray-300 mb-6">
          Click the button below to enable dynamic music and sound effects for the full game experience.
        </p>
        <button
          onClick={startAudio}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading Audio...
            </span>
          ) : (
            "Start Game Audio"
          )}
        </button>
        <p className="mt-4 text-gray-400 text-sm">Note: You can play the game without sound if you prefer.</p>
      </div>
    </div>
  )
}
