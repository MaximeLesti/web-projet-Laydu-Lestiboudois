import { PlacedShapesGrid } from "./placedShapesGrid.js";
import { PlayerInfo } from "./playerInfo.js";
import { FallingShape } from "./fallingShape.js";

/**
 * Parent class for all messages used to communicate between server and client.
 */
export class Message {
  constructor(data) {
    this.data = data;
  }
}

/**
 * Message describing a request by the client to rotate their shape
 */
export class RotateMessage extends Message {
  /**
   * @param {String} direction The direction of rotation : either "left" or "right".
   */
  constructor(direction) {
    super(direction);
  }

  getDirection() {
    return this.data;
  }
}

/**
 * Message describing a request by the client to move their shape.
 */
export class MoveMessage extends Message {
  /**
   * @param {Number} direction +1 to the right, -1 to the left
   */
  constructor(direction) {
    super(direction);
  }

  getDirection() {
    return this.data;
  }
}

/**
 * Message describing a request by the client to slam their shape.
 */
export class SlamMessage extends Message {
  constructor() {
    super();
  }
}

/**
 * Message describing a notification by the server of a player's new state.
 */
export class SetPlayerMessage extends Message {
  /**
   * @param {PlayerInfo} player The PlayerInfo describing the player's new state.
   */
  constructor(player) {
    const shape = player.shape;
    const serializable = {
      id: player.id,
      clearedLines: player.clearedLines,
      shape: player.shape
        ? {
            shapeType: player.shape.shapeType,
            playerId: player.shape.playerId,
            col: player.shape.col,
            row: player.shape.row,
            rotation: player.shape.rotation
        }
      : null
  };
    super(serializable); 
  }

  /**
   * @returns {FallingShape} An instance of FallingShape describing the player's falling shape.
   */
  getFallingShape() {
    // TODO
    let shape = this.data.shape;
    if(!shape) return undefined;
    return new FallingShape(shape.shapeType, shape.playerId, shape.col, shape.row, shape.rotation);
  }

  getPlayerId() {
    // TODO
    return this.data.id;
  }

  getClearedLines() {
    // TODO
    return this.data.clearedLines;
  }

  /**
   * @returns {PlayerInfo} An instance of PlayerInfo describing the player's new state, including all fields of the class in the correct type.
   */
  getPlayer() {
    // TODO
    return new PlayerInfo(this.getPlayerId(), this.getFallingShape(), this.getClearedLines());
  }
}

/**
 * Message describing a notification by the server of a player's removal.
 */
export class RemovePlayerMessage extends Message {
  /**
   * @param {Number} playerId The id of the player to be removed.
   */
  constructor(playerId) {
    // TODO
    super(playerId);
  }

  getPlayerId() {
    // TODO
    return this.data;
  }
}

/**
 * Message describing a notification by the server of a new placed shapes grid state.
 */
export class UpdateGridMessage extends Message {
  /**
   * @param {PlacedShapesGrid} grid The new game map state.
   */
  constructor(grid) {
    // TODO
    super(grid);
  }

  getGrid() {
    // TODO
    const grid = this.data;
    const placedShapesGrid = new PlacedShapesGrid(grid.width, grid.height);
    placedShapesGrid.map = grid.map;
    return placedShapesGrid;
  }
}

/**
 * Message describing a notification by the server that the game is over.
 */
export class GameOverMessage extends Message {
  constructor() {
    // TODO
    super();
  }
}

/**
 * Message describing a notification by the server that a new player has joined.
 */
export class JoinMessage extends Message {
  /**
   * @param {Number} playerId The id of the new player.
   */
  constructor(playerId) {
    // TODO
    super(playerId);
  }

  getPlayerId() {
    // TODO
    return this.data;
  }
}

/**
 * Codec for encoding and decoding messages.
 */
export class MessageCodec {
  static types = {
    MoveMessage,
    RotateMessage,
    SlamMessage,
    SetPlayerMessage,
    RemovePlayerMessage,
    UpdateGridMessage,
    JoinMessage,
    GameOverMessage,
  };

  /**
   * Encodes a message into a string in JSON format.
   */
  static encode(message) {
    // TODO encode the message into a string in JSON format
    return JSON.stringify({
      type: message.constructor.name,
      data: message.data,
    });
  }

  /**
   * Decodes a message from a string in JSON format into an instance of the corresponding message class.
   * @param {String} string The string to be decoded.
   * @returns {Message} An instance of the corresponding message class.
   */
  static decode(string) {
    // TODO decode the string into an object, ensuring that this object is an instance of the correct message class
    const {type, data} = JSON.parse(string);
    const Type = MessageCodec.types[type];
    if(!Type) {
      throw new Error(`Unknown message type: ${type}`);
    }
    return new Type(data);
  }
}
