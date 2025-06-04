export const port = 3000;

export const gameRows = 20;
export const gameCols = 10;

export const stepIntervalMs = 1000; //TODO : IT WAS 5000 INTITIALLY, GOT REDUCED FOR TEST PURPOSES.

export const gamePixelWidth = 300;
export const gamePixelHeight = 600;

export const cellPixelSize = Math.min(
  gamePixelHeight / gameRows,
  gamePixelWidth / gameCols
);

export const shapeColors = [
  "rgba(0, 0, 255, x)",
  "rgba(0, 255, 0, x)",
  "rgba(255, 0, 0, x)",
  "rgba(255, 255, 0, x)",
  "rgba(0, 255, 255, x)",
  "rgba(255, 0, 255, x)",
];

export const shapeTypes = [
  [
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
    ],
    [
      [0, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, -1],
    ],
  ], // T
  [
    [
      [0, 0],
      [1, 0],
      [-1, 0],
      [-2, 0],
    ],
    [
      [0, 0],
      [0, -1],
      [0, 1],
      [0, 2],
    ],
  ], // Line
  [
    [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [1, 0],
    ],
    [
      [-1, -1],
      [0, -1],
      [0, 0],
      [0, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
  ], // L
  [
    [
      [0, 0],
      [-1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [-1, 1],
      [0, -1],
      [0, 0],
      [0, 1],
    ],
    [
      [-1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, -1],
    ],
  ], // J
  [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [-1, 1],
    ],
    [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [0, 1],
    ],
  ], // S
  [
    [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 1],
      [0, 0],
      [1, 0],
      [1, -1],
    ],
  ], // Z
  [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ], // square
];

export const scorePerLine = 10;

// Constantes input PS4
export const PS4_BUTTONS = {
  CROSS: 0,       // X (bas)
  CIRCLE: 1,      // O (droite)
  SQUARE: 2,      // □ (gauche)
  TRIANGLE: 3,    // △ (haut)
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  SHARE: 8,
  OPTIONS: 9,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  PS: 16,
  TOUCHPAD: 17
};

export const AXES = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3
};
