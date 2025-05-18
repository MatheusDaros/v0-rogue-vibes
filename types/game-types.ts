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
  "Quantum Core": {
    name: "Quantum Core",
    matrixSize: 3,
    numberRange: [-3, 5],
    timeBonus: 10,
    description: "Specializes in larger matrices with negative numbers. Extra time for calculations.",
    image: "/assets/images/quantum-core.svg",
    color: "from-purple-600 to-indigo-800",
  },
  "Neural Node": {
    name: "Neural Node",
    matrixSize: 2,
    numberRange: [1, 5],
    timeBonus: 5,
    preFilled: 1,
    description: "Beginner-friendly with smaller matrices and positive numbers only. One cell pre-filled.",
    image: "/assets/images/neural-node.svg",
    color: "from-blue-500 to-cyan-600",
  },
  "Logic Gate": {
    name: "Logic Gate",
    matrixSize: 2,
    numberRange: [-2, 2],
    timeBonus: 8,
    description: "Works with binary-like matrices. Balanced difficulty with moderate time bonus.",
    image: "/assets/images/logic-gate.svg",
    color: "from-green-500 to-emerald-700",
  },
}

export const INITIAL_STATE: GameState = {
  progression: {
    unlockedCharacters: ["Neural Node"],
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
