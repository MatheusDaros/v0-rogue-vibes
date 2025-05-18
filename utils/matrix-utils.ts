export function generateMatrix(size: number, range: [number, number]): number[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]),
  )
}

export function calculateMatrixProduct(matrixA: number[][], matrixB: number[][]): number[][] {
  const size = matrixA.length
  const result = Array(size)
    .fill(0)
    .map(() => Array(size).fill(0))

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0
      for (let k = 0; k < size; k++) {
        sum += matrixA[i][k] * matrixB[k][j]
      }
      result[i][j] = sum
    }
  }

  return result
}

export function createMatrixChallenge(size: number, numberRange: [number, number]) {
  const matrixA = generateMatrix(size, numberRange)
  const matrixB = generateMatrix(size, numberRange)
  const solution = calculateMatrixProduct(matrixA, matrixB)

  return { matrixA, matrixB, solution }
}
