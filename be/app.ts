import express from "express";
import http from "http";
import WebSocket, { Server as WebSocketServer } from "ws";
import cors from "cors";
import { Board, checkBoard } from "./game";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
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

const PORT = 3001;
const LOBBY: { [key: string]: Lobby } = {};

enum currentPlayer {
  X = "X",
  O = "O",
}

interface Player {
  ws: WebSocket;
  playerLetter: string;
}

interface Lobby {
  players: Player[];
  gameBoard: Board;
  currentPlayer: currentPlayer;
  row?: number;
  col?: number;
  isWin?: {
    winner: string | null;
    outcome: "continue" | "win" | "draw";
  };
}
const blankBoard = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
] satisfies Board;

// Utility function to create a new lobby
const createLobby = (ws: WebSocket): string => {
  const lobbyId = Math.random().toString(36).substring(2, 9);
  LOBBY[lobbyId] = {
    players: [{ ws, playerLetter: "X" }],
    gameBoard: blankBoard,
    currentPlayer: currentPlayer.X,
    isWin: {
      winner: null,
      outcome: "continue",
    },
  };
  console.log(LOBBY[lobbyId]);
  return lobbyId;
};

// WebSocket server connection handler
wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    // console.log("Received message:", message);
    const data = JSON.parse(message);

    switch (data.type) {
      case "CREATE_LOBBY":
        const lobbyId = createLobby(ws);
        ws.send(JSON.stringify({ type: "LOBBY_CREATED", lobbyId }));
        break;

      case "JOIN_LOBBY":
        const lobby = LOBBY[data.lobbyId];
        console.log("lobby is", lobby);

        console.log("Joining lobby:", data.lobbyId);
        // console.log(lobby.players);
        if (lobby && lobby.players.length < 2) {
          const playerLetter = lobby.players.some(
            (player) => player.playerLetter === "X"
          )
            ? "O"
            : "X";
          lobby.players.push({ ws, playerLetter });
          // console.log("Player joined lobby:", lobby);
          ws.send(JSON.stringify({ type: "JOINED_LOBBY", playerLetter }));
          lobby.players.forEach((player) =>
            player.ws.send(
              JSON.stringify({
                type: "GAME_START",
                board: lobby.gameBoard,
                lobbyId: data.lobbyId,
              })
            )
          );
        } else {
          console.log("Lobby is full");
          ws.send(JSON.stringify({ type: "LOBBY_FULL" }));
        }
        break;

      case "MAKE_MOVE":
        const moveLobby = LOBBY[data.lobbyId];
        const { row, col, playerLetter } = data;
        console.log(row, col, playerLetter);
        if (
          moveLobby.gameBoard[row][col] === "" &&
          moveLobby.currentPlayer === playerLetter &&
          moveLobby.isWin?.outcome === "continue"
        ) {
          moveLobby.gameBoard[row][col] = playerLetter;
          moveLobby.currentPlayer =
            moveLobby.currentPlayer === currentPlayer.X
              ? currentPlayer.O
              : currentPlayer.X;
        }
        const isWin = checkBoard(moveLobby.gameBoard);
        if (moveLobby.isWin && isWin.outcome === "win") {
          moveLobby.isWin.winner = isWin.winner;
          moveLobby.isWin.outcome = "win";
          console.log("Game Over", moveLobby.isWin.winner);
          moveLobby.players.forEach((player) =>
            player.ws.send(
              JSON.stringify({
                type: "GAME_OVER",
                winner: moveLobby.isWin?.winner,
              })
            )
          );
        }
        moveLobby.players.forEach((player) =>
          player.ws.send(
            JSON.stringify({ type: "MOVE_MADE", board: moveLobby.gameBoard })
          )
        );

        break;

      case "LEAVE_LOBBY":
        const leaveLobby = LOBBY[data.lobbyId];
        if (leaveLobby) {
          leaveLobby.players = leaveLobby.players.filter(
            (player) => player.ws !== ws
          );
          if (leaveLobby.players.length === 0) {
            delete LOBBY[data.lobbyId];
          } else {
            leaveLobby.players.forEach((player) =>
              player.ws.send(JSON.stringify({ type: "PLAYER_LEFT" }))
            );
          }
        }
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  });

  ws.on("close", () => {
    // Handle player disconnection
    Object.keys(LOBBY).forEach((lobbyId) => {
      const lobby = LOBBY[lobbyId];
      lobby.players = lobby.players.filter((player) => player.ws !== ws);
      if (lobby.players.length === 0) {
        delete LOBBY[lobbyId];
      } else {
        lobby.players.forEach((player) =>
          player.ws.send(JSON.stringify({ type: "PLAYER_LEFT" }))
        );
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
