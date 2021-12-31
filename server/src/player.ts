import { VIEW_HEIGHT, VIEW_WIDTH } from "./main";

const NUMBER_OF_PIXI_FRAMES_PER_SECOND = 60;
const PLAYER_SPEED_PER_PIXI_FRAME = 3;
const PLAYER_SPEED =
  NUMBER_OF_PIXI_FRAMES_PER_SECOND * PLAYER_SPEED_PER_PIXI_FRAME;

export enum PlayerInput {
  moveUp = "moveUp",
  moveDown = "moveDown",
  moveLeft = "moveLeft",
  moveRight = "moveRight",
  fire = "fire",
}

export type PlayerInputEvent = {
  timestamp: number;
  inputMap: { [playerInput: string]: boolean };
};

export type Player = {
  publicId: string;
  privateId: string;
  x: number;
  y: number;
  lastInputEvent: PlayerInputEvent;
};

// TODO: return random coordinates instead of (0, 0)
export function initPlayer(publicId: string, privateId: string): Player {
  const lastInputEvent: PlayerInputEvent = {
    timestamp: Number((new Date().valueOf() / 1000).toString()),
    inputMap: {},
  };
  return { publicId, privateId, x: 0, y: 0, lastInputEvent };
}

export function updatePlayerPosition(
  player: Player,
  inputEvent: PlayerInputEvent
) {
  const timeDelta = inputEvent.timestamp - player.lastInputEvent.timestamp;
  const inputMap = inputEvent.inputMap;
  if (inputMap[PlayerInput.moveUp]) player.y -= timeDelta * PLAYER_SPEED;
  if (inputMap[PlayerInput.moveDown]) player.y += timeDelta * PLAYER_SPEED;
  if (inputMap[PlayerInput.moveLeft]) player.x -= timeDelta * PLAYER_SPEED;
  if (inputMap[PlayerInput.moveRight]) player.x += timeDelta * PLAYER_SPEED;
  player.x = (player.x + VIEW_WIDTH) % VIEW_WIDTH;
  player.y = (player.y + VIEW_HEIGHT) % VIEW_HEIGHT;
  player.lastInputEvent = inputEvent;
}
