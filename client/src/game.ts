import * as PIXI from "pixi.js";

import { Player, rerenderPlayers } from "./player";
import {
  parseMessage,
  ServerMessage,
  handleServerMessage,
  buildPlayerInputMessage,
} from "./messages";

export type GameState = {
  ownPlayerId: string | undefined;
  clientPlayerMap: { [playerId: string]: Player };
  serverPlayerMap: {
    [playerId: string]: {
      id: string;
      x: number;
      y: number;
    };
  };
};

export async function startGame(app: PIXI.Application): Promise<void> {
  const gameState: GameState = {
    ownPlayerId: undefined,
    clientPlayerMap: {},
    serverPlayerMap: {},
  };
  const serverUrl = "ws://localhost:8080";
  const webSocket: WebSocket = new WebSocket(serverUrl);
  webSocket.onmessage = (message: MessageEvent) => {
    const parsedMessage:
      | ServerMessage
      | undefined = parseMessage<ServerMessage>(message.data);
    if (parsedMessage) handleServerMessage(app, gameState, parsedMessage);
  };
  app.ticker.add(() => rerenderPlayers(app, gameState));
  app.ticker.add(() => sendInputsToServer(gameState, webSocket));
}

function sendInputsToServer(gameState: GameState, webSocket: WebSocket): void {
  const { ownPlayerId, clientPlayerMap } = gameState;
  if (ownPlayerId && clientPlayerMap[ownPlayerId])
    webSocket.send(buildPlayerInputMessage(clientPlayerMap[ownPlayerId]));
}
