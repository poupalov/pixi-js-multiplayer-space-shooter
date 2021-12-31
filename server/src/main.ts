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
  socketMap: { [privatePlayerId: string]: WebSocket };
  playerMap: { [privatePlayerId: string]: Player };
};

async function mainLoop() {
  const gameState: GameState = {
    socketMap: {},
    playerMap: {},
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
    const publicId: string = uuid();
    const privateId: string = uuid();
    console.log(`New player connected (playerId = ${privateId})`);
    gameState.socketMap[privateId] = playerSocket;
    gameState.playerMap[privateId] = initPlayer(publicId, privateId);
    playerSocket.send(buildConnectionSuccessMessage(publicId, privateId));
    playerSocket.on("message", (message) => {
      const parsedMessage:
        | PlayerMessage
        | undefined = parseMessage<PlayerMessage>(message.toString());
      if (parsedMessage) handlePlayerMessage(gameState, parsedMessage);
    });
    playerSocket.on("close", () => {
      console.log(`Closing connection with player (playerId = ${privateId})`);
      delete gameState.socketMap[privateId];
      delete gameState.playerMap[privateId];
    });
  });
  server.on("listening", () => {
    `Game server is listening...`;
  });
}

function sendGameStateToPlayers(gameState: GameState) {
  for (const playerSocket of Object.values(gameState.socketMap))
    playerSocket.send(buildGameStateMessage(gameState));
}
