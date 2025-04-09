/* eslint-disable no-undef */
import { PlacedShapesGrid } from "../src/placedShapesGrid.js";
import { expect } from "chai";
import { DrawableGame } from "../src/game.js";
import { PlayerInfo } from "../src/playerInfo.js";

function getGrid() {
  const grid = new PlacedShapesGrid(5, 5);
  grid.map = [
    [4, 4, 4, 4, 4],
    [1, 1, -1, -1, -1],
    [3, -1, -1, -1, -1],
    [-1, 1, -1, -1, -1],
    [1, -1, -1, -1, -1],
  ];
  return grid;
}

describe("Scores computation", () => {
  it("Placed shapes score should be computed correctly", () => {
    const grid = getGrid();
    const scores = new Map([
      [1, 4],
      [3, 1],
      [4, 5],
    ]);
    expect(grid.getBlocksPerPlayer()).to.deep.equal(scores);
  });

  it("Total scores should be computed correctly", () => {
    const game = new DrawableGame(getGrid());

    game.set(1, new PlayerInfo(1, undefined, 2));
    game.set(2, new PlayerInfo(2, undefined, 9));
    game.set(4, new PlayerInfo(4, undefined, 1));

    const scores = new Map([
      [1, -4 + 20],
      [2, 90],
      [3, -1],
      [4, -5 + 10],
    ]);
    expect(game.getTotalScores()).to.deep.equal(scores);
  });
});
