import { type GameState, INITIAL_STATE } from "../types/game-types"

export function saveGameState(state: GameState): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rogueVibesSave", JSON.stringify(state))
  }
}

export function loadGameState(): GameState {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("rogueVibesSave")
    return saved ? JSON.parse(saved) : INITIAL_STATE
  }
  return INITIAL_STATE
}
