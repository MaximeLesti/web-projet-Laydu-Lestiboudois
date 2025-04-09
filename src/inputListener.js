import { cellPixelSize } from "./constants.js";
import { SlamMessage, MoveMessage, RotateMessage } from "./messages.js";

let currentCol = NaN;

export function mouseMove(canvas, event, messageListener) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const newCol = parseInt(x / cellPixelSize);
  if (currentCol !== newCol) {
    currentCol = newCol;
    messageListener(new MoveMessage(newCol));
  }
}

export function keyDown(event, messageListener) {
  if (event.key === "ArrowLeft") {
    messageListener(new RotateMessage("left"));
  }
  if (event.key === "ArrowRight") {
    messageListener(new RotateMessage("right"));
  }
  if (event.key === "ArrowDown") {
    messageListener(new SlamMessage());
  }
}

export function mouseClick(event, messageListener) {
  messageListener(new SlamMessage());
}

/**
 * Sets up all event listeners for user interactions:
 * - A click on the canvas or a key press on the down arrow will send a `SlamMessage`.
 * - A movement of the mouse on the canvas will send a `MoveMessage` with the corresponding column.
 * - A key press on the left or right arrow will send a left or right `RotateMessage`.
 * @param canvas The canvas on which the game is drawn
 * @param messageListener The callback function handling the messages to be sent. It expects a `Message` as unique argument.
 */
export function setListeners(canvas, messageListener) {
  window.addEventListener("keydown", (event) =>
    keyDown(event, messageListener)
  );
  canvas.addEventListener("mousemove", (event) =>
    mouseMove(canvas, event, messageListener)
  );
  canvas.addEventListener("click", (event) =>
    mouseClick(event, messageListener)
  );
}
