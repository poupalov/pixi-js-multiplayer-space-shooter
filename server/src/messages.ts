import { GameState } from "./main";
import { Player, PlayerInputEvent, updatePlayerPosition } from "./player";

export type PlayerMessage = PlayerInputMessage;
type PlayerInputMessage = {
  type: "input";
  privateId: string;
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
  const player: Player | undefined = gameState.playerMap[message.privateId];
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
  publicId: string;
  privateId: string;
};
type ServerGameStateMessage = {
  type: "gameState";
  serverPlayerMap: {
    [publicPlayerId: string]: { publicId: string; x: number; y: number };
  };
};

export function buildConnectionSuccessMessage(
  publicId: string,
  privateId: string
): string {
  const message: ServerConnectionSuccessMessage = {
    type: "connectionSuccess",
    publicId,
    privateId,
  };
  return JSON.stringify(message);
}

export function buildGameStateMessage(gameState: GameState): string {
  const gameStateMessage: ServerGameStateMessage = {
    type: "gameState",
    serverPlayerMap: {},
  };
  for (const player of Object.values(gameState.playerMap)) {
    const { publicId, x, y } = player;
    gameStateMessage.serverPlayerMap[publicId] = { publicId, x, y };
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
