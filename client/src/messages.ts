import { GameState } from "./game";

export type PlayerMessage = PlayerInputMessage;
type PlayerInputMessage = {
  type: "input";
  privateId: string;
  inputMap: { [playerInput: string]: boolean };
};

export function buildPlayerInputMessage(
  privateId: string,
  inputMap: { [playerInput: string]: boolean }
): string {
  const message: PlayerInputMessage = { type: "input", privateId, inputMap };
  return JSON.stringify(message);
}

export type ServerMessage =
  | ServerConnectionSuccessMessage
  | ServerGameStateMessage;
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

export function handleServerMessage(
  gameState: GameState,
  message: ServerMessage
): void {
  switch (message.type) {
    case "connectionSuccess":
      return handleServerConnectionSuccessMessage(gameState, message);
    case "gameState":
      return handleServerGameStateMessage(gameState, message);
    default:
      return;
  }
}

function handleServerConnectionSuccessMessage(
  gameState: GameState,
  message: ServerConnectionSuccessMessage
): void {
  gameState.ownPublicId = message.publicId;
  gameState.ownPrivateId = message.privateId;
}

function handleServerGameStateMessage(
  gameState: GameState,
  message: ServerGameStateMessage
): void {
  gameState.serverPlayerMap = message.serverPlayerMap;
}

export function parseMessage<T>(messageString: string): T | undefined {
  let parsedMessage: T | undefined;
  try {
    parsedMessage = JSON.parse(messageString);
  } catch {}
  return parsedMessage;
}
