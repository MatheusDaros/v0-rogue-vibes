"use client"

import { CHARACTERS } from "@/types/game-types"
import { getToneAudioManager } from "@/utils/tone-audio-manager"

interface CharacterSelectProps {
  unlockedCharacters: string[]
  onSelectCharacter: (characterName: string) => void
}

export default function CharacterSelect({ unlockedCharacters, onSelectCharacter }: CharacterSelectProps) {
  const characters = Object.values(CHARACTERS).filter((char) => unlockedCharacters.includes(char.name))

  const handleCharacterClick = (characterName: string) => {
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.initialize() // Initialize audio if not already done
      audioManager.playSound("click")
    }
    onSelectCharacter(characterName)
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">ROGUE VIBES</span>
      </h2>
      <h3 className="text-xl text-gray-300 text-center mb-10">Select Your AI Agent</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {characters.map((character) => (
          <div
            key={character.name}
            className="relative overflow-hidden group"
            onClick={() => handleCharacterClick(character.name)}
          >
            <div
              className={`bg-gradient-to-br ${character.color} rounded-lg p-6 transform transition-all duration-300 group-hover:scale-105 cursor-pointer shadow-lg`}
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>

              <div className="w-24 h-24 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center p-2">
                <img
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <h4 className="text-xl font-bold text-white text-center mb-3">{character.name}</h4>
              <p className="text-sm text-gray-100 text-center mb-4">{character.description}</p>

              <div className="bg-black/20 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-200">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Matrix: {character.matrixSize}×{character.matrixSize}
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Time: +{character.timeBonus}s
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    Range: [{character.numberRange[0]}, {character.numberRange[1]}]
                  </div>
                  {character.preFilled && (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Pre-filled: {character.preFilled}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-center">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors">
                  Select Agent
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
