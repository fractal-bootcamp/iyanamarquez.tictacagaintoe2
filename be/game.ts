export type Row = [string, string, string];

export type Board = Row[];

const board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
] satisfies Board;

// item is an array of 3 strings
export type Item = [string, string, string];
// [['','',''],['','',''],['','','']]
// takes array of items that have 3 pieces
const checkFunc = (array: Item[]) => {
  // go through each item, if all are matching and not empty, return a win + player
  for (let i = 0; i < array.length; i++) {
    const threeStrings = array[i];
    if (
      threeStrings[0] === threeStrings[1] &&
      threeStrings[1] === threeStrings[2] &&
      threeStrings[0] !== ""
    ) {
      return { winner: threeStrings[0], outcome: "win" };
    }
  }
  return { winner: null, outcome: "continue" };
};
//   [["", "", ""],
//   ["", "", ""],
//   ["", "", ""],]

const getColumns = (b: typeof board): Item[] => {
  const column1: Item = [b[0][0], b[1][0], b[2][0]];
  const column2: Item = [b[0][1], b[1][1], b[2][1]];
  const column3: Item = [b[0][2], b[1][2], b[2][2]];
  return [column1, column2, column3];
};

const getDiagonals = (b: typeof board): Item[] => {
  const diag1: Item = [b[0][0], b[1][1], b[2][2]];
  const diag2: Item = [b[2][0], b[1][1], b[0][2]];
  return [diag1, diag2];
};

const isBoardFull = (b: typeof board) => {
  for (let i = 0; i < b.length; i++) {
    const threeStrings = b[i];
    if (threeStrings.includes("")) {
      return false;
    }
  }
  return true;
};

export const checkBoard = (b: typeof board) => {
  const rows = b;
  const columns = getColumns(b);
  const diagonals = getDiagonals(b);
  const allPossibleConditions = [...rows, ...columns, ...diagonals];

  const checkOutcome = checkFunc(allPossibleConditions);
  const boardFullOutcome = isBoardFull(b);

  // check for winner first
  if (checkOutcome.winner !== null) {
    return { winner: checkOutcome.winner, outcome: checkOutcome.outcome };
  }
  // then check for a tie
  if (boardFullOutcome == true) {
    // end game, there is a tie
    return { winner: null, outcome: "tie" };
  }
  return checkOutcome;
};
