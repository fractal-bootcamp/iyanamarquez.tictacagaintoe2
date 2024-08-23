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

enum nextMove {
  X = "X",
  O = "O",
}

interface Player {
  ws: WebSocket;
  playerLetter: string;
  lobbyId: string;
}

interface Lobby {
  id: string;
  players: Player[];
  gameBoard: Board;
  nextMove: nextMove;
  row?: number;
  col?: number;
  isWin?: {
    winner: string | null;
    outcome: "continue" | "win" | "tie";
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
    players: [{ ws, playerLetter: "X", lobbyId: lobbyId }],
    gameBoard: JSON.parse(JSON.stringify(blankBoard)), // Deep copy of blankBoard
    nextMove: nextMove.X,
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
  return lobbies.find((lobby) =>
    lobby.players.some((player) => player.ws === ws)
  );
};

// const removeLobby = (lobbyId: string) => {
//   const index = lobbies.findIndex((lobby) => lobby.id === lobbyId);
//   if (index !== -1) {
//     lobbies.splice(index, 1);
//   }
// };

wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "GET_LOBBIES") {
      const lobbyData = lobbies.map((lobby) => ({
        id: lobby.id,
        playerCount: lobby.players.length,
      }));
      ws.send(JSON.stringify({ type: "GET_LOBBIES", data: lobbyData }));
    }

    if (data.type === "CREATE_LOBBY") {
      const existingLobby = getLobbyFromPlayerWS(ws);
      if (existingLobby) {
        ws.send(
          JSON.stringify({
            type: "ALREADY_IN_LOBBY",
            data: { message: "You are already in a lobby" },
          })
        );
        return;
      }

      const newLobby = createLobby(ws);
      lobbies.push(newLobby);
      console.log("current lobbies", lobbies);
      ws.send(
        JSON.stringify({
          type: "LOBBY_CREATED",
          data: {
            lobbyId: newLobby.id,
            players: newLobby.players,
            gameBoard: JSON.parse(JSON.stringify(blankBoard)), // Deep copy of blankBoard
            nextMove: newLobby.nextMove,
          },
        })
      );
    }

    if (data.type === "JOIN_LOBBY") {
      const lobbyIndex = lobbies.findIndex((l) => l.id === data.lobbyId);
      if (lobbyIndex !== -1) {
        let lobby = lobbies[lobbyIndex];
        if (lobby.players.length >= 2) {
          ws.send(
            JSON.stringify({
              type: "LOBBY_FULL",
              data: { message: "Lobby is already full" },
            })
          );
          return;
        }

        const existingPlayer = lobby.players[0];
        const newPlayerLetter = existingPlayer.playerLetter === "X" ? "O" : "X";

        lobby.players.push({
          ws,
          playerLetter: newPlayerLetter,
          lobbyId: lobby.id,
        });

        ws.send(
          JSON.stringify({
            type: "JOINED_LOBBY",
            data: {
              lobbyId: lobby.id,
              players: lobby.players,
              gameBoard: lobby.gameBoard,
              nextMove: lobby.nextMove,
              playerLetter: newPlayerLetter,
            },
          })
        );

        lobby.players.forEach((player) => {
          if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(
              JSON.stringify({
                type: "PLAYER_JOINED",
                data: {
                  lobbyId: lobby.id,
                  players: lobby.players,
                },
              })
            );
          }
        });

        // Update the lobby in the array
        lobbies[lobbyIndex] = lobby;
      } else {
        ws.send(
          JSON.stringify({
            type: "LOBBY_NOT_FOUND",
            data: { message: "Lobby not found" },
          })
        );
      }
    }

    if (data.type === "MAKE_MOVE") {
      const lobbyIndex = lobbies.findIndex((l) =>
        l.players.some((p) => p.ws === ws)
      );
      if (lobbyIndex !== -1) {
        const lobby = lobbies[lobbyIndex];
        if (lobby.gameBoard[data.row][data.col] !== "") {
          console.log("Invalid move, cell already taken");
          return;
        }
        if (lobby.nextMove !== data.playerLetter) {
          console.log("Invalid move, not your turn");
          return;
        }

        // Create a new game board with the updated move
        const newGameBoard: Board = lobby.gameBoard.map((row) => [...row]);
        newGameBoard[data.row][data.col] = data.playerLetter;

        // Update the lobby with the new game board
        lobbies[lobbyIndex] = {
          ...lobby,
          gameBoard: newGameBoard,
          nextMove: lobby.nextMove === nextMove.X ? nextMove.O : nextMove.X,
        };
        console.log("updated gameboard", lobbies[lobbyIndex].gameBoard);

        lobbies[lobbyIndex].players.forEach((player) => {
          if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(
              JSON.stringify({
                type: "MOVE_MADE",
                data: {
                  lobbyId: lobbies[lobbyIndex].id,
                  gameBoard: lobbies[lobbyIndex].gameBoard,
                  nextMove: lobbies[lobbyIndex].nextMove,
                },
              })
            );
          }
        });
        const { winner, outcome } = checkBoard(newGameBoard);
        if (outcome === "win" || outcome === "tie") {
          lobby.isWin = {
            winner,
            outcome,
          };
          // send winner to all players in current lobby
          lobbies[lobbyIndex].players.forEach((player) => {
            if (player.ws.readyState === WebSocket.OPEN) {
              player.ws.send(
                JSON.stringify({
                  type: "GAME_OVER",
                  data: { winner, outcome },
                  lobbyId: lobbies[lobbyIndex].id,
                })
              );
            }
          });
          return;
        }
      }
    }

    if (data.type === "RESTART_GAME") {
      const lobbyIndex = lobbies.findIndex((l) =>
        l.players.some((p) => p.ws === ws)
      );
      if (lobbyIndex !== -1) {
        let lobby = lobbies[lobbyIndex];
        lobby.gameBoard = JSON.parse(JSON.stringify(blankBoard));
        lobby.nextMove = nextMove.X;
        lobby.isWin = {
          winner: null,
          outcome: "continue",
        };

        // Update the lobby in the array
        lobbies[lobbyIndex] = lobby;

        lobby.players.forEach((player) => {
          if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(
              JSON.stringify({
                type: "LOBBY_RESTARTED",
                data: {
                  lobbyId: lobby.id,
                  gameBoard: lobby.gameBoard,
                  nextMove: lobby.nextMove,
                },
              })
            );
          }
        });
      }
    }

    if (data.type === "LEAVE_LOBBY") {
      const lobbyIndex = lobbies.findIndex((l) =>
        l.players.some((p) => p.ws === ws)
      );
      if (lobbyIndex !== -1) {
        let lobby = lobbies[lobbyIndex];

        // Find the index of the player who wants to leave
        const playerIndex = lobby.players.findIndex(
          (player) => player.ws === ws
        );

        if (playerIndex !== -1) {
          // Remove the player at the found index
          lobby.players.splice(playerIndex, 1);
          console.log(
            `Player at index ${playerIndex} removed from lobby ${lobby.id}`
          );

          if (lobby.players.length === 0) {
            lobbies.splice(lobbyIndex, 1);
            console.log(
              `Lobby ${lobby.id} removed due to no players remaining`
            );
          } else {
            // Update the lobby in the array
            lobbies[lobbyIndex] = lobby;
            console.log(
              `Lobby ${lobby.id} updated, ${lobby.players.length} player(s) remaining`
            );
          }
        } else {
          console.log(`Player not found in lobby ${lobby.id}`);
        }

        // Notify other players first
        lobby.players.forEach((player) => {
          if (player.ws !== ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(
              JSON.stringify({
                type: "PLAYER_LEFT",
                data: { lobbyId: lobby.id },
              })
            );
          }
        });

        // Notify the leaving player
        ws.send(
          JSON.stringify({
            type: "LEFT_LOBBY",
            data: { lobbyId: "" },
          })
        );
      }
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    const lobbyIndex = lobbies.findIndex((l) =>
      l.players.some((p) => p.ws === ws)
    );
    if (lobbyIndex !== -1) {
      let lobby = lobbies[lobbyIndex];
      lobby.players = lobby.players.filter((player) => player.ws !== ws);
      if (lobby.players.length === 0) {
        lobbies.splice(lobbyIndex, 1);
        console.log("Lobby removed due to no players remaining");
      } else {
        // Update the lobby in the array
        lobbies[lobbyIndex] = lobby;
        lobby.players.forEach((player) => {
          if (player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(
              JSON.stringify({
                type: "PLAYER_LEFT",
                data: { lobbyId: lobbies[lobbyIndex].id },
              })
            );
          }
        });
      }
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
