export interface Character {
  name: string
  matrixSize: number
  numberRange: [number, number]
  timeBonus: number
  preFilled?: number
  description: string
  image: string
  color: string
}

export interface Resources {
  money: number
  tokens: number
}

export interface GameState {
  progression: {
    unlockedCharacters: string[]
    completedSectors: number
  }
  currentRun: {
    character?: Character
    sector: number
    node: number
    resources: Resources
    health: number
  }
}

export const CHARACTERS: Record<string, Character> = {
  "Neural Node": {
    name: "Neural Node",
    matrixSize: 2,
    numberRange: [1, 5],
    timeBonus: 5,
    preFilled: 1,
    description: "Beginner-friendly with smaller matrices and positive numbers only. One cell pre-filled.",
    image: "/assets/images/neural-node.svg",
    color: "bg-blue-500",
  },
  "Binary Bot": {
    name: "Binary Bot",
    matrixSize: 2,
    numberRange: [-1, 1],
    timeBonus: 0,
    preFilled: 3,
    description: "Binary Bot excels at lightning-fast 2x2 binary puzzles. Three cells are pre-filled, making it a speedrunner's choice.",
    image: "/binary-bot.svg",
    color: "from-blue-500 to-green-500",
  },
  "Logic Gate": {
    name: "Logic Gate",
    matrixSize: 2,
    numberRange: [-2, 2],
    timeBonus: 0,
    preFilled: 1,
    description: "Works with binary-like matrices. Balanced difficulty with no time bonus.",
    image: "/logic-gate.svg",
    color: "bg-green-500",
  },
  "Quantum Core": {
    name: "Quantum Core",
    matrixSize: 3,
    numberRange: [-3, 3],
    timeBonus: 10,
    preFilled: 5,
    description: "Specializes in larger matrices with negative numbers. Extra time for calculations.",
    image: "/quantum-core.svg",
    color: "from-green-500 to-red-500",
  },
  "Odd Transistor": {
    name: "Odd Transistor",
    matrixSize: 3,
    numberRange: [3, 7],
    timeBonus: 0,
    preFilled: 3,
    description: "Larger matrices with positive numbers only. No time bonus.",
    image: "/odd-transistor.svg",
    color: "bg-red-500",
  },
  "Proto-AGI": {
    name: "Proto-AGI",
    matrixSize: 4,
    numberRange: [-4, 4],
    timeBonus: 60,
    preFilled: 10,
    description: "Specializes in larger matrices with negative numbers. Extra time for calculations.",
    image: "/proto-agi.svg",
    color: "from-red-500 to-gray-500",
  },
}

export const INITIAL_STATE: GameState = {
  progression: {
    unlockedCharacters: ["Neural Node", "Binary Bot", "Logic Gate", "Quantum Core", "Odd Transistor", "Proto-AGI"],
    completedSectors: 0,
  },
  currentRun: {
    sector: 1,
    node: 0,
    resources: {
      money: 100,
      tokens: 50,
    },
    health: 100,
  },
}
