import { cellPixelSize, shapeColors } from "./constants.js";

function cellToPixel(x) {
  return x * cellPixelSize;
}

export class Renderer {
  constructor(game, context) {
    this.game = game;
    this.context = context;
    this.playerId = undefined;
  }

  /**
   * Sets the player id of the current player.
   * @param {number} playerId The id of the current player.
   */
  setPlayerId(playerId) {
    this.playerId = playerId;
  }

  getColorForPlayer(playerId) {
     const x = playerId === this.playerId ? 1 : 0.5;
     return shapeColors[playerId % shapeColors.length].replace("x", x);
   }

  /**
   * Renders a block at the given position and with the given color.
   * @param {Number} col The column where the block should be drawn.
   * @param {Number} row The row where the block should be drawn.
   * @param {String} color The color of the block.
   */
  renderBlock(col, row, color) {
    this.context.fillStyle = color;
    this.context.fillRect(
      cellToPixel(col),
      cellToPixel(row),
      cellPixelSize,
      cellPixelSize
    );
    this.context.strokeRect(
      cellToPixel(col),
      cellToPixel(row),
      cellPixelSize,
      cellPixelSize
    );
  }

  /**
   * Renders the given falling shape.
   * @param {FallingShape} shape The shape to be drawn
   */
  renderFallingShape(shape) {
    if (shape === undefined) {
      return;
    }

    const coords = shape.getCoordinates();
    const color = this.getColorForPlayer(shape.playerId);
   
    for (let i = 0; i < coords.length; i++) {
      const coord = coords[i];
      const x = shape.col + coord[0];
      const y = shape.row + coord[1];
      this.renderBlock(x, y, color);
    }
  }

  /**
   * Clears the context and draws all falling and placed shapes.
   */
  render() {
    // Reset context
    this.context.strokeStyle = "black";
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );

    // Draw shapes
  this.game.forEachFallingShape((s) => {
    if (s.playerId !== this.playerId) this.renderFallingShape(s);
  });

// Puis la forme du joueur local
  this.game.forEachFallingShape((s) => {
    if (s.playerId === this.playerId) this.renderFallingShape(s);
});


    // Draw map
    for (let row = 0; row < this.game.grid.height; row++) {
      for (let col = 0; col < this.game.grid.width; col++) {
        const cell = this.game.grid.getPlayerAt(row, col);
        if (cell !== -1) {
          const color = this.getColorForPlayer(cell);
          this.renderBlock(col, row, color);
        }
      }
    }
  }

  /**
   * Updates the scores displayed on the page.
   */
  updateScores() {
    const scores = this.game.getTotalScores();
    const sortedScores = new Map([...scores].sort((a, b) => b[1] - a[1]));
    
    const tbody = document.getElementById("scoresBody");
    tbody.innerHTML = ""; // Vide le tableau
    
    sortedScores.forEach((score, id) => {
      const row = document.createElement("tr");
      row.className = id === this.playerId ? "font-bold bg-yellow-100" : "";
      
      const playerCell = document.createElement("td");
      playerCell.className = "px-1";
      playerCell.textContent = `Player ${id}: `;
      
      const scoreCell = document.createElement("td");
      scoreCell.className = "text-right font-mono";
      scoreCell.textContent = score;
      
      row.appendChild(playerCell);
      row.appendChild(scoreCell);
      tbody.appendChild(row);
    });
  }

  /**
   * Updates the current player id displayed on the page.
   */
  showCurrentPlayerId() {
    // TODO
    let elem = document.getElementById("currentPlayer");
    elem.textContent = `You are player ${this.playerId}`;
  }
}
