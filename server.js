import express from "express";
import expressWs from "express-ws";
import { port } from "./src/constants.js";

const app = express();
expressWs(app);

// TODO Create a new Game instance and start a game loop

// Serve the public directory
app.use(express.static("public"));

// Serve the src directory
app.use("/src", express.static("src"));

// Websocket game events
app.ws("/", (socket) => {
  // TODO handle new websocket connections.
  // TODO The first message the client receives should be a JoinMessage, containing its player id. The server then sends all current state to that client. Received messages from the client should be forwarded to the game instance.
  // TODO Ensure the game is notified of a player quitting when the socket is closed.
});

app.listen(port);

console.log("App started.");
