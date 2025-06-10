export const port = 3000;

export const gameRows = 20;
export const gameCols = 10;

export const stepIntervalMs = 5000;

export const gamePixelWidth = 300;
export const gamePixelHeight = 600;

export const cellPixelSize = Math.min(
  gamePixelHeight / gameRows,
  gamePixelWidth / gameCols
);

export const shapeColors = [
  "rgba(214, 169, 154, x)",
  "rgba(178, 201, 171, x)",
  "rgba(54, 21, 30, x)",
  "rgba(76, 134, 168, x)",
  "rgba(0, 255, 255, x)",
  "rgba(212, 194, 252, x)",
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
