import * as PIXI from "pixi.js";

import { GameState } from "./game";
import { Player } from "./player";

export type PlayerMessage = PlayerInputMessage;
type PlayerInputMessage = {
  type: "input";
  playerId: string;
  inputMap: { [playerInput: string]: boolean };
};

export function buildPlayerInputMessage(player: Player): string {
  const message: PlayerInputMessage = {
    type: "input",
    playerId: player.id,
    inputMap: player.inputMap,
  };
  return JSON.stringify(message);
}

export type ServerMessage =
  | ServerConnectionSuccessMessage
  | ServerGameStateMessage;
type ServerConnectionSuccessMessage = {
  type: "connectionSuccess";
  playerId: string;
};
type ServerGameStateMessage = {
  type: "gameState";
  playerIdToPlayerMap: {
    [playerId: string]: { id: string; x: number; y: number };
  };
};

export function handleServerMessage(
  app: PIXI.Application,
  gameState: GameState,
  message: ServerMessage
): void {
  switch (message.type) {
    case "connectionSuccess":
      return handleServerConnectionSuccessMessage(app, gameState, message);
    case "gameState":
      return handleServerGameStateMessage(app, gameState, message);
    default:
      return;
  }
}

function handleServerConnectionSuccessMessage(
  app: PIXI.Application,
  gameState: GameState,
  message: ServerConnectionSuccessMessage
): void {
  gameState.ownPlayerId = message.playerId;
}

function handleServerGameStateMessage(
  app: PIXI.Application,
  gameState: GameState,
  message: ServerGameStateMessage
): void {
  gameState.serverPlayerMap = message.playerIdToPlayerMap;
}

export function parseMessage<T>(messageString: string): T | undefined {
  let parsedMessage: T | undefined;
  try {
    parsedMessage = JSON.parse(messageString);
  } catch {}
  return parsedMessage;
}
