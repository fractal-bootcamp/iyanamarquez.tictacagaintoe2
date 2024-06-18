import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import { checkBoard } from "./src/game";
import cookieParser from "cookie-parser";

function uuidv4(): string {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    // tslint:disable-next-line:no-bitwise
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const app: Express = express();
console.log(process.env.PORT);
const port = process.env.PORT || 4001;
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5174",
      "https://tictactoe-iyanam.netlify.app",
      "http://localhost:5173",
    ],
  })
);
app.use(cookieParser());
app.use(express.json());

let games = {
  ["tictactoe"]: {
    id: "tictactoe",
    board: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
    currentPlayer: "X",
    winState: { outcome: null, winner: null },
    player1: { token: "X", id: "", sessionId: "" },
    player2: { token: "O", id: "", sessionId: "" },
    gameOn: true,
  },
  ["tictactoe2"]: {
    id: "tictactoe2",
    board: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
    currentPlayer: "X",
    winState: { outcome: null, winner: null },
    player1: { token: "X", id: "", sessionId: "" },
    player2: { token: "O", id: "", sessionId: "" },
    gameOn: true,
  },
  ["tictactoe3"]: {
    id: "tictactoe3",
    board: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ],
    currentPlayer: "X",
    winState: { outcome: null, winner: null },
    player1: { token: "X", id: "", sessionId: "" },
    player2: { token: "O", id: "", sessionId: "" },
    gameOn: true,
  },
};

const verifyPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const game = games[id];
  if (!game) {
    return res.status(400).send(game);
  }
  if (req.cookies.user_id === game.player1.id) {
    // this is player 1
    req.body.currentPlayer = "player1";
    console.log("user 1 online...");
  } else if (req.cookies.user_id === game.player2.id) {
    // this is player 2
    req.body.currentPlayer = "player2";
    console.log("user 2 online...");
  } else {
    const fetchCookie = async () => {
      const newcookie = uuidv4();
      if (!req.cookies.user_id) {
        res.cookie("user_id", newcookie, {
          maxAge: 9000000,
          httpOnly: true,
          domain: req.baseUrl,
          sameSite: "none",
          secure: true,
        });
        return newcookie;
      }
      return await req.cookies.user_id;
    };
    const usersCookie = await fetchCookie();
    if (game.player1.id == "") {
      game.player1.id = usersCookie;
    } else if (game.player2.id == "" && usersCookie !== game.player1.id) {
      game.player2.id = usersCookie;
    } else {
      console.log("the game is occupied");
    }
  }
  next();
};

app.get("/", (req: Request, res: Response) => {
  res.json("erm hello");
});

app.get("/games", (req: Request, res: Response) => {
  res.json({ games: games });
});

// Get a game by ID
app.get("/game/:id", verifyPlayer, (req: Request, res: Response) => {
  const id = req.params.id;
  const game = games[id];
  if (!game) {
    return res.status(400).send(game);
  }
  res.json({ game: game });
});

// Post req to make a move on the current game
app.post("/game/:id/move", verifyPlayer, (req: Request, res: Response) => {
  const currentPlayer = req.body.currentPlayer;
  const id = req.params.id;
  const game = games[id];
  //   const userId = req.signedCookies.;

  if (!game) {
    return res.status(400).send("game not found");
  }

  const rowId = req.body.rowId;
  const itemId = req.body.itemId;
  const player = game.currentPlayer;
  //   do logic to update position of current player X or O, do nothing if the spot is already filled
  if (
    games[id].board[itemId][rowId] == "X" ||
    games[id].board[itemId][rowId] == "O"
  ) {
    return;
  }
  // DONT LET PLAYER MAKE MOVES FOR THE OTHER PLAYERS
  if (currentPlayer === "player1" && player == "X") {
    games[id].board[itemId][rowId] = "X";
    game.currentPlayer = player === "X" ? "O" : "X";
  } else if (currentPlayer === "player2" && player == "O") {
    games[id].board[itemId][rowId] = "O";
    game.currentPlayer = player === "X" ? "O" : "X";
  }
  const currentBoardState = checkBoard(game.board);
  game.winState.outcome = currentBoardState.outcome;
  game.winState.winner = currentBoardState.winner;
  if (game.winState.outcome == "win" || game.winState.outcome == "tie") {
    game.gameOn = false;
  }

  res.json({ game });
});

// restart game
app.post("/game/:id/restart", (req: Request, res: Response) => {
  const id = req.params.id;
  const game = games[id];

  if (!game) {
    return res.status(400).send("game not found");
  }
  //   do logic to update position of current player X or O
  games[id].board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  games[id].winState.outcome = null;
  games[id].winState.winner = null;
  games[id].gameOn = true;
  games[id].player1 = { token: "X", id: "", sessionId: "" };
  games[id].player2 = { token: "X", id: "", sessionId: "" };

  res.json({ game });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
