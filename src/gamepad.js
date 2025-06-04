import { PS4_BUTTONS, AXES } from "./constants.js";
import { SlamMessage, MoveMessage, RotateMessage } from "./messages.js";

let gamepadIndex = null;
let lastInputTime = 0;
const INPUT_COOLDOWN = 200; // ms entre les inputs pour éviter les répétitions trop rapides

export function checkGamepad(messageListener) {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  
  // Trouver une manette active si aucune n'est enregistrée
  if (gamepadIndex === null) {
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        gamepadIndex = i;
        break;
      }
    }
  }

  const now = Date.now();
  if (now - lastInputTime < INPUT_COOLDOWN) return;

  if (gamepadIndex !== null && gamepads[gamepadIndex]) {
    const gamepad = gamepads[gamepadIndex];
    
    // D-PAD LEFT: Déplacer à gauche
    if (gamepad.buttons[PS4_BUTTONS.DPAD_LEFT].pressed) {
      messageListener(new MoveMessage(-1)); // -1 pour gauche
      lastInputTime = now;
    }
    
    // D-PAD RIGHT: Déplacer à droite
    if (gamepad.buttons[PS4_BUTTONS.DPAD_RIGHT].pressed) {
      messageListener(new MoveMessage(1)); // +1 pour droite
      lastInputTime = now;
    }
    
    // BOUTON CARRÉ (SQUARE): Rotation anti-horaire
    if (gamepad.buttons[PS4_BUTTONS.SQUARE].pressed) {
      messageListener(new RotateMessage("left"));
      lastInputTime = now;
    }
    
    // BOUTON CERCLE (CIRCLE): Rotation horaire
    if (gamepad.buttons[PS4_BUTTONS.CIRCLE].pressed) {
      messageListener(new RotateMessage("right"));
      lastInputTime = now;
    }
    
    // BOUTON X (CROSS) OU D-PAD DOWN: Slam
    if (gamepad.buttons[PS4_BUTTONS.CROSS].pressed || 
        gamepad.buttons[PS4_BUTTONS.DPAD_DOWN].pressed) {
      messageListener(new SlamMessage());
      lastInputTime = now;
    }
  }
}

export function startGamepadMonitoring(messageListener) {
  // Gestion connexion/déconnexion
  window.addEventListener("gamepadconnected", (e) => {
    console.log(`Manette connectée: ${e.gamepad.id}`);
    gamepadIndex = e.gamepad.index;
  });

  window.addEventListener("gamepaddisconnected", (e) => {
    console.log(`Manette déconnectée: ${e.gamepad.id}`);
    if (gamepadIndex === e.gamepad.index) {
      gamepadIndex = null;
    }
  });

  // Boucle de vérification
  function gamepadLoop() {
    checkGamepad(messageListener);
    requestAnimationFrame(gamepadLoop);
  }
  
  requestAnimationFrame(gamepadLoop);
}
