"use client"

import { useState, useEffect } from "react"
import { getToneAudioManager } from "@/utils/tone-audio-manager"

export default function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const audioManager = getToneAudioManager()
    if (audioManager) {
      setIsMuted(audioManager.isMutedState())
    }
  }, [])

  const toggleMute = () => {
    try {
      const audioManager = getToneAudioManager()
      if (audioManager) {
        // Initialize audio if not already done
        audioManager.initialize()

        const newMutedState = audioManager.toggleMute()
        setIsMuted(newMutedState)
      }
    } catch (error) {
      console.error("Error toggling mute:", error)
    }
  }

  if (!isClient) return null

  return (
    <button
      onClick={toggleMute}
      className="fixed top-4 right-4 z-50 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>
      )}
    </button>
  )
}
