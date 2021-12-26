import { GameState } from "./main";
import {
  Player,
  PlayerInput,
  PlayerInputEvent,
  updatePlayerPosition,
} from "./player";

export type PlayerMessage = PlayerInputMessage;
type PlayerInputMessage = {
  type: "input";
  playerId: string;
  inputMap: { [playerInput: string]: boolean };
};

export function handlePlayerMessage(
  gameState: GameState,
  message: PlayerMessage
) {
  switch (message.type) {
    case "input":
      return handlePlayerInputMessage(gameState, message);
    default:
      return;
  }
}

function handlePlayerInputMessage(
  gameState: GameState,
  message: PlayerInputMessage
) {
  const player: Player | undefined =
    gameState.playerIdToPlayerMap[message.playerId];
  if (!player) return;
  const inputEvent: PlayerInputEvent = {
    timestamp: Number((new Date().valueOf() / 1000).toString()),
    inputMap: message.inputMap,
  };
  updatePlayerPosition(player, inputEvent);
}

type ServerMessage = ServerConnectionSuccessMessage | ServerGameStateMessage;
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

export function buildConnectionSuccessMessage(playerId: string): string {
  const message: ServerConnectionSuccessMessage = {
    type: "connectionSuccess",
    playerId,
  };
  return JSON.stringify(message);
}

export function buildGameStateMessage(gameState: GameState): string {
  const gameStateMessage: ServerGameStateMessage = {
    type: "gameState",
    playerIdToPlayerMap: {},
  };
  for (const [playerId, player] of Object.entries(
    gameState.playerIdToPlayerMap
  )) {
    const { id, x, y } = player;
    gameStateMessage.playerIdToPlayerMap[playerId] = { id, x, y };
  }
  return JSON.stringify(gameStateMessage);
}

export function parseMessage<T>(messageString: string): T | undefined {
  let parsedMessage: T | undefined;
  try {
    parsedMessage = JSON.parse(messageString);
  } catch {}
  return parsedMessage;
}
