import express from "express";
import expressWs from "express-ws";
import { port, stepIntervalMs, gameCols, gameRows } from "./src/constants.js";
import { PlacedShapesGrid } from "./src/placedShapesGrid.js";
import { Game } from "./src/game.js";
import { JoinMessage, MessageCodec, UpdateGridMessage } from "./src/messages.js";
import { PlayerInfo } from "./src/playerInfo.js";

const app = express();
expressWs(app);

// TODO Create a new Game instance and start a game loop
let idCounter = 0;
let Players = new Map();

const onGameOver = () => {
  Players.clear();
  idCounter = 0;
};

const sendMessage = (socket, mess) => {
  socket.send(MessageCodec.encode(mess));
};

const messageSender = (mess) => {
  Players.forEach((socket) => sendMessage(socket, mess));
};

const grid = new PlacedShapesGrid(gameCols, gameRows);
const game = new Game(grid, messageSender, onGameOver);

setInterval(() => {
  game.step();
}, stepIntervalMs);

// Serve the public directory
app.use(express.static("public"));

// Serve the src directory
app.use("/src", express.static("src"));

// Websocket game events
app.ws("/", (socket) => {
  // TODO handle new websocket connections.
  let id = idCounter++;
  Players.set(id, socket);
  // TODO The first message the client receives should be a JoinMessage, containing its player id. The server then sends all current state to that client. Received messages from the client should be forwarded to the game instance.
  sendMessage(socket, new JoinMessage(id));
  let playerInfo = new PlayerInfo(id);
  game.introduceNewPlayer(playerInfo);
  game.sendMessage(new UpdateGridMessage(game.grid));
  socket.onmessage = (mess) =>  {
    let messDecoded = MessageCodec.decode(mess);
    game.onMessage(id, messDecoded);
  }
  // TODO Ensure the game is notified of a player quitting when the socket is closed.
  socket.onclose = () => {
    Players.delete(id);
    game.quit(id);
  }
});

app.listen(port);

console.log("App started.");
