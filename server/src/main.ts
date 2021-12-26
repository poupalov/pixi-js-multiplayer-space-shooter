import { v4 as uuid } from "uuid";
import { WebSocketServer, WebSocket } from "ws";

import { initPlayer, Player } from "./player";
import {
  handlePlayerMessage,
  PlayerMessage,
  buildConnectionSuccessMessage,
  buildGameStateMessage,
  parseMessage,
} from "./messages";

export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;
const SERVER_PORT_NUMBER = 8080;
const NUMBER_OF_UPDATES_SENT_PER_SECOND = 60;
const DELAY_BETWEEN_UPDATES_IN_MILISECONDS =
  1000 / NUMBER_OF_UPDATES_SENT_PER_SECOND;

export type GameState = {
  playerIdToSocketMap: { [playerId: string]: WebSocket };
  playerIdToPlayerMap: { [playerId: string]: Player };
};

async function mainLoop() {
  const gameState: GameState = {
    playerIdToSocketMap: {},
    playerIdToPlayerMap: {},
  };
  launchServer(gameState);
  setInterval(() => {
    sendGameStateToPlayers(gameState);
  }, DELAY_BETWEEN_UPDATES_IN_MILISECONDS);
}

mainLoop();

function launchServer(gameState: GameState) {
  const server = new WebSocketServer({ port: SERVER_PORT_NUMBER }, () => {
    console.log(`Launched game server on port ${SERVER_PORT_NUMBER}`);
  });
  server.on("connection", (playerSocket) => {
    const playerId: string = uuid();
    console.log(`New player connected (playerId = ${playerId})`);
    gameState.playerIdToSocketMap[playerId] = playerSocket;
    gameState.playerIdToPlayerMap[playerId] = initPlayer(playerId);
    playerSocket.send(buildConnectionSuccessMessage(playerId));
    playerSocket.on("message", (message) => {
      const parsedMessage:
        | PlayerMessage
        | undefined = parseMessage<PlayerMessage>(message.toString());
      if (parsedMessage) handlePlayerMessage(gameState, parsedMessage);
    });
    playerSocket.on("close", () => {
      console.log(`Closing connection with player (playerId = ${playerId})`);
      delete gameState.playerIdToSocketMap[playerId];
      delete gameState.playerIdToPlayerMap[playerId];
    });
  });
  server.on("listening", () => {
    `Game server is listening...`;
  });
}

function sendGameStateToPlayers(gameState: GameState) {
  for (const playerSocket of Object.values(gameState.playerIdToSocketMap))
    playerSocket.send(buildGameStateMessage(gameState));
}
