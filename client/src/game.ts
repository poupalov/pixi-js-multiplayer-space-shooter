import * as PIXI from "pixi.js";

import { Player, rerenderPlayers, cleanDisconnectedPlayers } from "./player";
import {
  parseMessage,
  ServerMessage,
  handleServerMessage,
  buildPlayerInputMessage,
} from "./messages";

export type GameState = {
  ownPublicId: string | undefined;
  ownPrivateId: string | undefined;
  clientPlayerMap: { [publicPlayerId: string]: Player };
  serverPlayerMap: {
    [publicPlayerId: string]: {
      publicId: string;
      x: number;
      y: number;
    };
  };
};

export async function startGame(app: PIXI.Application): Promise<void> {
  const gameState: GameState = {
    ownPublicId: undefined,
    ownPrivateId: undefined,
    clientPlayerMap: {},
    serverPlayerMap: {},
  };
  const serverUrl = "ws://localhost:8080";
  const webSocket: WebSocket = new WebSocket(serverUrl);
  webSocket.onmessage = (message: MessageEvent) => {
    const parsedMessage:
      | ServerMessage
      | undefined = parseMessage<ServerMessage>(message.data);
    if (parsedMessage) handleServerMessage(gameState, parsedMessage);
  };
  app.ticker.add(() => {
    rerenderPlayers(app, gameState);
    cleanDisconnectedPlayers(gameState);
  });
  app.ticker.add(() => sendOwnInputsToServer(gameState, webSocket));
}

function sendOwnInputsToServer(
  gameState: GameState,
  webSocket: WebSocket
): void {
  const { ownPublicId, ownPrivateId, clientPlayerMap } = gameState;
  if (!ownPublicId || !ownPrivateId) return;
  const ownPlayer: Player | undefined = clientPlayerMap[ownPublicId];
  if (!ownPlayer) return;
  webSocket.send(buildPlayerInputMessage(ownPrivateId, ownPlayer.inputMap));
}
