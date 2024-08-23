import express from "express";
import WebSocket, { Server as WebSocketServer } from "ws";
import cors from "cors";
import cookieParser from "cookie-parser";

import { Board, checkBoard } from "./game";

const app = express();
app.use(express.json());
app.use(cookieParser());

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

const wss = new WebSocketServer({ port: 3000 });

const PORT = 3001;

enum currentPlayer {
  X = "X",
  O = "O",
}

interface Player {
  ws: WebSocket;
  playerLetter: string;
}

interface Lobby {
  id: string;
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

const blankBoard: Board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

const lobbies: Lobby[] = [];

const createLobby = (ws: WebSocket): Lobby => {
  const lobbyId = Math.random().toString(36).substring(2, 9);
  const lobbyData: Lobby = {
    id: lobbyId,
    // assign 1st player letter X
    players: [{ ws, playerLetter: "X" }],
    gameBoard: blankBoard,
    // first player gets to go first
    currentPlayer: currentPlayer.X,
    isWin: {
      winner: null,
      outcome: "continue",
    },
  };
  return lobbyData;
};

const getLobby = (lobbyId: string): Lobby | undefined => {
  return lobbies.find((lobby) => lobby.id === lobbyId);
};

const getLobbyFromPlayerWS = (ws: WebSocket): Lobby | undefined => {
  const lobby = lobbies.find((lobby) =>
    lobby.players.some((player) => player.ws === ws)
  );
  console.log("Retrieved lobby for WS:", ws, "Lobby:", lobby);
  return lobby;
};

wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    // Create a new lobby
    if (data.type === "CREATE_LOBBY") {
      const lobby = createLobby(ws);
      lobbies.push(lobby);
      console.log("Lobby created:", lobby.gameBoard);
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "LOBBY_CREATED",
            data: {
              lobbyId: lobby.id,
              players: lobby.players,
              gameBoard: lobby.gameBoard,
              currentPlayer: lobby.currentPlayer,
            },
          })
        );
      });
    }

    // Join a lobby
    if (data.type === "JOIN_LOBBY") {
      // add user to lobby
      const lobby = getLobby(data.lobbyId);
      if (lobby) {
        lobby.players.push({ ws, playerLetter: "O" });
        console.log("Lobby:", lobby);
        console.log("Joining lobby:", data);
      }
    }

    if (data.type === "MAKE_MOVE") {
      console.log("Making move:", data);
      const lobby = getLobbyFromPlayerWS(ws);
      console.log("Lobby is:", lobby);
      if (lobby) {
        // check if move is valid
        if (lobby.gameBoard[data.row][data.col] !== "") {
          console.log("Invalid move");
          return;
        }
        // check if player is allowed to move
        if (lobby.currentPlayer !== data.playerLetter) {
          console.log("Invalid move");
          return;
        }
        // make move
        lobby.gameBoard[data.row][data.col] = data.playerLetter;
        // change player
        lobby.currentPlayer =
          lobby.currentPlayer === currentPlayer.X
            ? currentPlayer.O
            : currentPlayer.X;

        console.log("Lobby after move:", lobby.gameBoard);
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "MOVE_MADE",
              data: {
                lobbyId: lobby.id,
                gameBoard: lobby.gameBoard,
                currentPlayer: lobby.currentPlayer,
              },
            })
          );
        });
      }
    }
  });
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
