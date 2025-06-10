import { Renderer } from "./renderer.js";
import { Replica } from "./game.js";
import { PlacedShapesGrid } from "./placedShapesGrid.js";
import { gameCols, gameRows, port } from "./constants.js";
import { MessageCodec } from "./messages.js";
import { setListeners } from "./inputListener.js"
import { startGamepadMonitoring } from "./gamepad.js";

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const grid = new PlacedShapesGrid(gameCols, gameRows);
const replica = new Replica(grid);
const renderer = new Renderer(replica, context);

// Render loop
function loop() {
  renderer.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// TODO Get hostname from current URL, and use it to open a Web socket to the corresponding `ws://` URL.
const socket = new WebSocket(`ws:${window.location.hostname}:${port}`);


// TODO Once the socket is open, set the input listener to send messages to the server.
socket.addEventListener("open", () => {
  const sendMessage = (mess) => {
    socket.send(MessageCodec.encode(mess));
  };

  setListeners(canvas, sendMessage); // Keyboard/mouse inputs
  startGamepadMonitoring(sendMessage); // Gamepad inputs

});

// TODO Handle messages received on that socket from the server. If the message is a `JoinMessage`, set the player id of the renderer. Otherwise, pass the message to the replica.
socket.addEventListener("message", (event) => {
  const mess = MessageCodec.decode(event.data);
  if (mess instanceof MessageCodec.types.JoinMessage) {
    renderer.setPlayerId(mess.getPlayerId());
    renderer.showCurrentPlayerId();
    renderer.render();
  } else {
    replica.onMessage(mess);
    renderer.updateScores();
  }
});

