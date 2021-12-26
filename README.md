# pixi-js-multiplayer-space-shooter

This project was developed as a learning experience, to learn the basics of multiplayer video game development using PixiJS as the graphics engine, all within a React app in Typescript.

This is the continuation of the [pixi-js-space-shooter](https://github.com/poupalov/pixi-js-space-shooter) project:

- `pixi-js-space-shooter` is single-player only through a local game simulation, and experiments with basic game concepts like collision detection
- `pixi-js-multiplayer-space-shooter` experiments with less game features, but implements a simple client-server model to let multiple players play with each other, in a design robust to client-side cheating

## Project structure

- In the `client` folder you will find the React & Pixi app which connects the player to the server through a web socket, sends keyboard inputs to it, and uses server updates to rerender the game scene
- In the `server` folder you will find the NodeJS web socket server that accepts connections from the players, processes their keyboard inputs to update the game state, and send updates of the game state to the players

Both the client and the server interact with each other through web sockets.

## Running the game

You first have to install the dependencies by running `npm i` in both the `client` and `server` folders.

Then:

- You can start the server by running `npx ts-node src/main.ts` in the `server` folder
- You can start the client by running `npx tsc -w` and `npm start` in the `client` folder, in 2 shells

Finally, you can add different players into different browser tabs by opening [http://localhost:3000](http://localhost:3000). You can move the player's spaceship with the WASD or arrow keys.

## About the architecture

- The processing & communication logics mentioned above happen asynchronously for a smooth gaming experience
- The client tick rate is the standard PixiJS tick rate of 60 frames rendered per second
- The server tick rate is also set at 60 game state updates sent per second

## About web sockets

The client and the server use different web sockets libraries:

- The client uses the native `WebSocket` browser API
- The server uses the `ws` NPM package

Both are very user-friendly. `WebSocket` is not usable in NodeJS apps, and `ws` triggers build issues on the client React app, hence why 2 different libraries are used. It is probably doable to make `ws` work on the client though.
