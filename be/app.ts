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
    gameBoard: [...blankBoard],
    // first player gets to go first
    nextMove: nextMove.X,
    isWin: {
      winner: null,
      outcome: "continue",
    },
  };
  return lobbyData;
};

const getLobby = (lobbyId: string): Lobby | undefined => {
  console.log("current lobbies:", lobbies);
  return lobbies.find((lobby) => lobby.id === lobbyId);
};

const getLobbyFromPlayerWS = (ws: WebSocket): Lobby | undefined => {
  return lobbies.find((lobby) =>
    lobby.players.some((player) => player.ws === ws)
  );
};

const removeLobby = (lobbyId: string) => {
  const index = lobbies.findIndex((lobby) => lobby.id === lobbyId);
  if (index !== -1) {
    lobbies.splice(index, 1);
  }
};

wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "GET_LOBBIES") {
      ws.send(JSON.stringify({ type: "GET_LOBBIES", data: lobbies }));
    }

    // Create a new lobby
    if (data.type === "CREATE_LOBBY") {
      const lobby = createLobby(ws);
      lobbies.push(lobby);
      ws.send(
        JSON.stringify({
          type: "LOBBY_CREATED",
          data: {
            lobbyId: lobby.id,
            players: lobby.players,
            gameBoard: lobby.gameBoard,
            nextMove: lobby.nextMove,
          },
        })
      );
    }

    // Join a lobby
    if (data.type === "JOIN_LOBBY") {
      const existingLobby = getLobbyFromPlayerWS(ws);
      if (existingLobby) {
        // Notify the client that they are already in a lobby
        ws.send(
          JSON.stringify({
            type: "ALREADY_IN_LOBBY",
            data: {
              message: "You are already in a lobby",
            },
          })
        );
        return; // Exit the function
      }

      const lobby = getLobby(data.lobbyId);
      if (lobby) {
        // Determine the letter for the new player
        const existingPlayer = lobby.players[0];
        const newPlayerLetter = existingPlayer.playerLetter === "X" ? "O" : "X";

        // Add the player to the lobby
        lobby.players.push({
          ws,
          playerLetter: newPlayerLetter,
          lobbyId: lobby.id,
        });

        // Notify the new player and all existing players
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

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
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
      } else {
        ws.send(
          JSON.stringify({
            type: "LOBBY_NOT_FOUND",
            data: {
              message: "Lobby not found",
            },
          })
        );
      }
    }

    if (data.type === "MAKE_MOVE") {
      const lobby = getLobbyFromPlayerWS(ws);
      if (lobby) {
        // check if move is valid
        if (lobby.gameBoard[data.row][data.col] !== "") {
          console.log("Invalid move, cell already taken");
          return;
        }
        // check if player is allowed to move
        if (lobby.nextMove !== data.playerLetter) {
          console.log("Invalid move, not your turn");
          return;
        }
        // make move
        lobby.gameBoard[data.row][data.col] = data.playerLetter;
        // change player
        lobby.nextMove =
          lobby.nextMove === nextMove.X ? nextMove.O : nextMove.X;

        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "MOVE_MADE",
              data: {
                lobbyId: lobby.id,
                gameBoard: lobby.gameBoard,
                nextMove: lobby.nextMove,
              },
            })
          );
        });
      }
    }
    if (data.type === "RESTART_GAME") {
      const lobby = getLobbyFromPlayerWS(ws);
      if (lobby) {
        console.log("Restarting game:", lobby.id);
        lobby.gameBoard = [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ];
        lobby.nextMove = nextMove.X;
        lobby.isWin = {
          winner: null,
          outcome: "continue",
        };

        wss.clients.forEach((client) => {
          console.log("Sending restart to client:");
          console.log("Lobby:", lobby.gameBoard);
          client.send(
            JSON.stringify({
              type: "LOBBY_RESTARTED",
              data: {
                lobbyId: lobby.id,
                gameBoard: lobby.gameBoard,
                nextMove: lobby.nextMove,
              },
            })
          );
        });
      }
    }

    // When a player leaves a lobby
    if (data.type === "LEAVE_LOBBY") {
      const lobby = getLobbyFromPlayerWS(ws);
      if (lobby) {
        // Remove the player from the lobby
        lobby.players = lobby.players.filter((player) => player.ws !== ws);

        // Notify other players in the lobby about the player leaving
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "PLAYER_LEFT",
                data: {
                  lobbyId: lobby.id,
                },
              })
            );
          }
        });

        // If there are no players left, remove the lobby
        if (lobby.players.length === 0) {
          removeLobby(lobby.id);
          console.log("Lobby removed due to no players remaining");
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "LOBBY_REMOVED",
                  data: {
                    lobbyId: lobby.id,
                  },
                })
              );
            }
          });
        }
      }
    }

    // On WebSocket close
    ws.on("close", () => {
      console.log("WebSocket connection closed");
      const lobby = getLobbyFromPlayerWS(ws);
      if (lobby) {
        lobby.players = lobby.players.filter((player) => player.ws !== ws);
        if (lobby.players.length === 0) {
          removeLobby(lobby.id);
          console.log("Lobby removed due to no players remaining");
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "LOBBY_REMOVED",
                  data: {
                    lobbyId: lobby.id,
                  },
                })
              );
            }
          });
        } else {
          // Notify remaining players about the update
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "PLAYER_LEFT",
                  data: {
                    lobbyId: lobby.id,
                  },
                })
              );
            }
          });
        }
      }
    });
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    const lobby = getLobbyFromPlayerWS(ws);
    if (lobby) {
      // Remove the player from the lobby
      lobby.players = lobby.players.filter((player) => player.ws !== ws);
      // If the lobby is empty after player leaves, remove it
      if (lobby.players.length === 0) {
        removeLobby(lobby.id);
        console.log("Lobby removed due to no players remaining");
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
