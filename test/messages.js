/* eslint-disable no-undef */
import { expect } from "chai";
import {
  MessageCodec,
  SetPlayerMessage,
  UpdateGridMessage,
} from "../src/messages.js";
import { PlayerInfo } from "../src/playerInfo.js";
import { FallingShape } from "../src/fallingShape.js";
import { PlacedShapesGrid } from "../src/placedShapesGrid.js";

describe("Messages after encode-decode", () => {
  it("SetPlayerMessage should always return player and shape instances", () => {
    const msg = new SetPlayerMessage(
      new PlayerInfo(42, new FallingShape(0, 42, 3, 3, 1))
    );
    const encoded = MessageCodec.encode(msg);
    const decoded = MessageCodec.decode(encoded);
    expect(decoded, "Decoded message").to.deep.equal(msg);
    expect(
      decoded.constructor.name,
      "Decoded message constructor name"
    ).to.equal("SetPlayerMessage");

    const player = decoded.getPlayer();
    expect(
      player.constructor.name,
      "Constructor name of player obtained through SetPlayerMessage.getPlayer"
    ).to.equal("PlayerInfo");
    expect(
      Object.keys(player),
      "Properties of player obtained through SetPlayerMessage.getPlayer"
    ).to.deep.include.members(["clearedLines", "shape", "id"]);

    const shape = player.getFallingShape();
    expect(
      shape.constructor.name,
      "Constructor name of shape obtained from player obtained through SetPlayerMessage.getPlayer"
    ).to.equal("FallingShape");
    expect(
      Object.keys(shape),
      "Properties of shape obtained from player obtained through SetPlayerMessage.getPlayer"
    ).to.deep.include.members([
      "shapeType",
      "rotation",
      "playerId",
      "col",
      "row",
    ]);

    const shape2 = decoded.getFallingShape();
    expect(
      shape,
      "Constructor name of shape obtained through SetPlayerMessage.getFallingShape"
    ).to.deep.equal(shape2);
  });
  it("UpdateGridMessage should always return a GameMap instance", () => {
    const grid = new PlacedShapesGrid(3, 3);
    grid.map = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const msg = new UpdateGridMessage(grid);

    const encoded = MessageCodec.encode(msg);
    const decoded = MessageCodec.decode(encoded);

    expect(decoded, "Decoded message").to.deep.equal(msg);
    expect(
      decoded.constructor.name,
      "Decoded message constructor name"
    ).to.deep.equal("UpdateGridMessage");

    const decodedGrid = decoded.getGrid();
    expect(
      decodedGrid,
      "Decoded map obtained through UpdateGridMessage.getGrid()"
    ).to.deep.equal(grid);
    expect(
      decodedGrid.constructor.name,
      "Constructor name of map obtained through UpdateGridMessage.getGrid()"
    ).to.equal("PlacedShapesGrid");
  });
});
