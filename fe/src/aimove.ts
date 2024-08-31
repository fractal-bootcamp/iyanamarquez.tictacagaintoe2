import { checkBoard } from "./game";

type Player = "X" | "O";
type Cell = "" | Player;

export type Row = [Cell, Cell, Cell];
export type Board = Row[];

// const initialBoard: Board = [
//   ["", "", ""],
//   ["", "", ""],
//   ["", "", ""],
// ];

/**
 * Check if the current board is a terminal state (win, tie, or ongoing).
 */
const evaluateBoard = (
  b: Board
): { score: number | null; winner: Player | null } => {
  const result = checkBoard(b);
  if (result.outcome === "win") {
    return {
      score: result.winner === "X" ? 10 : -10,
      winner: result.winner as Player,
    };
  } else if (result.outcome === "tie") {
    return { score: 0, winner: null };
  }
  return { score: null, winner: null };
};

/**
 * Minimax algorithm to find the best move.
 */
const minimax = (b: Board, depth: number, isMaximizing: boolean): number => {
  const evaluation = evaluateBoard(b);

  if (evaluation.score !== null) {
    return evaluation.score;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of getPossibleMoves(b)) {
      const [row, col] = move;
      b[row][col] = "X";
      const score = minimax(b, depth + 1, false);
      b[row][col] = "";
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of getPossibleMoves(b)) {
      const [row, col] = move;
      b[row][col] = "O";
      const score = minimax(b, depth + 1, true);
      b[row][col] = "";
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
};

/**
 * Find the best move for the AI.
 */
const findBestMove = (b: Board): [number, number] => {
  let bestMove: [number, number] | null = null;
  let bestScore = -Infinity;

  for (const move of getPossibleMoves(b)) {
    const [row, col] = move;
    b[row][col] = "X"; // AI's move
    const score = minimax(b, 0, false);
    b[row][col] = "";
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (bestMove === null) {
    throw new Error("No valid moves available.");
  }

  return bestMove;
};

/**
 * Get all possible moves for the current board.
 */
const getPossibleMoves = (b: Board): [number, number][] => {
  const moves: [number, number][] = [];
  for (let row = 0; row < b.length; row++) {
    for (let col = 0; col < b[row].length; col++) {
      if (b[row][col] === "") {
        moves.push([row, col]);
      }
    }
  }
  return moves;
};

// Example of how to use the AI function
const makeAIMove = (b: Board): Board => {
  const [row, col] = findBestMove(b);
  const newBoard = b.map((row) => [...row]) as Board;
  newBoard[row][col] = "X"; // AI move
  return newBoard;
};

export default makeAIMove;
