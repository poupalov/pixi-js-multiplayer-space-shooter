import * as PIXI from "pixi.js";

import { GameState } from "./game";

export function addPlayer(app: PIXI.Application, id: string): Player {
  const player: Player = initPlayer(id);
  app.stage.addChild(player.sprite);
  return player;
}

export type Player = {
  id: string;
  sprite: PIXI.Sprite;
  inputMap: { [playerInput: string]: boolean };
};

function initPlayer(id: string): Player {
  return {
    id,
    sprite: initPlayerSprite(),
    inputMap: initPlayerInputMap(),
  };
}

function initPlayerSprite() {
  const playerSprite = PIXI.Sprite.from("spaceship.png");
  const spriteHeightToWidthRatio = playerSprite.height / playerSprite.width;
  playerSprite.width = 150;
  playerSprite.height = 150 * spriteHeightToWidthRatio;
  return playerSprite;
}

export enum PlayerInput {
  moveUp = "moveUp",
  moveDown = "moveDown",
  moveLeft = "moveLeft",
  moveRight = "moveRight",
  fire = "fire",
}

const keyToMoveMap: { [key: string]: PlayerInput } = {
  z: PlayerInput.moveUp,
  ArrowUp: PlayerInput.moveUp,
  s: PlayerInput.moveDown,
  ArrowDown: PlayerInput.moveDown,
  q: PlayerInput.moveLeft,
  ArrowLeft: PlayerInput.moveLeft,
  d: PlayerInput.moveRight,
  ArrowRight: PlayerInput.moveRight,
  " ": PlayerInput.fire,
};

function initPlayerInputMap(): { [playerInput: string]: boolean } {
  const inputMap: { [playerInput: string]: boolean } = {};
  const handleKeyDown = ({ key }: KeyboardEvent) => {
    if (keyToMoveMap[key]) inputMap[keyToMoveMap[key]] = true;
  };
  const handleKeyUp = ({ key }: KeyboardEvent) => {
    if (keyToMoveMap[key]) delete inputMap[keyToMoveMap[key]];
  };
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  return inputMap;
}

export function rerenderPlayers(
  app: PIXI.Application,
  gameState: GameState
): void {
  for (const [playerId, playerServerState] of Object.entries(
    gameState.serverPlayerMap
  )) {
    if (!gameState.clientPlayerMap[playerId])
      gameState.clientPlayerMap[playerId] = addPlayer(app, playerId);
    const playerClientState = gameState.clientPlayerMap[playerId];
    playerClientState.sprite.x = playerServerState.x;
    playerClientState.sprite.y = playerServerState.y;
  }
  // TODO: add cleanup to remove client-side players that no longer exist server-side
}
