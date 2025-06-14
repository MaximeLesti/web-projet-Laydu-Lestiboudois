import { expect } from "chai";
import { PlayerInfo } from "../src/playerInfo.js";
import { Game, Replica } from "../src/game.js";
import { PlacedShapesGrid } from "../src/placedShapesGrid.js";
import { FallingShape } from "../src/fallingShape.js";
import {
  SlamMessage,
  GameOverMessage,
  JoinMessage,
  Message,
  MoveMessage,
  RemovePlayerMessage,
  RotateMessage,
  SetPlayerMessage,
  UpdateGridMessage,
} from "../src/messages.js";

class MockGrid extends PlacedShapesGrid {
  constructor(width, height, onPlaceShape, onClearFullRows) {
    super(width, height);
    this.onPlaceShape = onPlaceShape;
    this.onClearFullRows = onClearFullRows;
  }

  placeShape(shape) {
    if (this.onPlaceShape) {
      this.onPlaceShape(shape);
    }
    return super.placeShape(shape);
  }

  clearFullRows() {
    if (this.onClearFullRows) {
      this.onClearFullRows();
    }
    return super.clearFullRows();
  }
}

function runOnGame(
  grid,
  shapes,
  body,
  exactMessages = undefined,
  containedMessages = undefined,
  gameOverCount = undefined,
  onGameOver = () => {}
) {
  const receivedMessages = [];
  const broadcaster = (message) => {
    receivedMessages.push(message);
  };

  let actualGameOverCount = 0;

  const gameOverCB = () => {
    onGameOver();
    actualGameOverCount++;
  };

  const game = new Game(grid, broadcaster, gameOverCB);
  shapes.forEach((shape) => {
    const pi = new PlayerInfo(shape.playerId, shape);
    game.set(shape.playerId, pi);
  });

  body(game);

  if (exactMessages !== undefined) {
    expect(
      receivedMessages.length,
      "Number of expected messages (Got [" +
        receivedMessages.map((m) => m.constructor.name) +
        "])"
    ).to.equal(exactMessages.length);

    receivedMessages.forEach((msg, index) => {
      const expected = exactMessages[index];
      if (expected instanceof Message) {
        expect(msg).to.deep.equal(expected);
      } else if (typeof expected === "string") {
        expect(msg.constructor.name).to.equal(expected);
      } else {
        expected(msg);
      }
    });
  } else if (containedMessages !== undefined) {
    containedMessages.forEach((expected) => {
      let expectedStr = "";
      const idx = receivedMessages.findIndex((received) => {
        if (expected instanceof Message) {
          expectedStr = expected.constructor.name + JSON.stringify(expected);
          const v =
            JSON.stringify(expected) === JSON.stringify(received) &&
            expected.constructor.name === received.constructor.name;

          return v;
        } else if (typeof expected === "string") {
          expectedStr = expected;
          return received.constructor.name === expected;
        } else {
          expectedStr = expected;
          return expected(received);
        }
      });
      expect(
        receivedMessages.length,
        "Number of received messages should be positive"
      ).to.be.greaterThan(0);
      expect(
        idx >= 0,
        "Whether received messages contain expected one (" + expectedStr + ")"
      ).to.be.true;
      receivedMessages.splice(idx, 1);
    });
  }

  if (gameOverCount !== undefined) {
    expect(actualGameOverCount, "Game Over count").to.equal(gameOverCount);
  }
}

describe("Game stepping", () => {
  it("All shapes should move down by 1", () => {
    const grid = new PlacedShapesGrid(10, 10);
    const rows = new Map([
      [1, 3],
      [2, 5],
    ]);
    const shapes = Array.from(rows.entries()).map(
      ([id, row]) => new FallingShape(0, id, 5, row, 0)
    );

    runOnGame(
      grid,
      shapes,
      (game) => {
        game.step();

        game.forEachFallingShape((s) => {
          expect(s, "Shape").to.not.be.undefined;
          expect(s.row, "Shape row").to.equal(rows.get(s.playerId) + 1);
        });

        expect(rows.keys, "Player ids").to.deep.equal(game.keys);
      },
      ["SetPlayerMessage", "SetPlayerMessage"],
      undefined,
      0
    );
  });
  it("Should ask PlacedShapesGrid to place shape when touching the ground upon step, and clear full rows.", () => {
    let placeCount = 0;
    let clearCount = 0;

    const shape1 = new FallingShape(0, 1, 5, 3, 0);
    const shape2 = new FallingShape(0, 2, 5, 1, 0);

    const grid = new MockGrid(
      10,
      5,
      (shape) => {
        placeCount++;
        // Only player 1's shape should be placed.
        expect(
          shape.playerId,
          "Player Id of the shape that got placed"
        ).to.equal(1);
      },
      () => {
        clearCount++;
      }
    );

    runOnGame(
      grid,
      [shape1, shape2],
      (game) => {
        game.step();

        expect(placeCount, "Number of shapes placed on the grid").to.equal(1);
        expect(
          clearCount,
          "Number of times row was asked to be cleared"
        ).to.equal(1);
      },
      undefined,
      ["SetPlayerMessage", "SetPlayerMessage", "UpdateGridMessage"],
      0
    );
  });
  it("If multiple shapes touch the ground upon stepping, they should be placed and be replaced, the others unaffected.", () => {
    const shape1 = new FallingShape(0, 1, 2, 3, 0); // will be placed
    const shape2 = new FallingShape(0, 2, 5, 1, 0);
    const shape3 = new FallingShape(0, 3, 7, 3, 0); // will be placed

    shape1.testShape = true;
    shape2.testShape = true;
    shape3.testShape = true;

    const grid = new PlacedShapesGrid(10, 5);

    runOnGame(
      grid,
      [shape1, shape2, shape3],
      (game) => {
        game.step();

        expect(game.size, "Number of players in the game").to.equal(3);

        expect(game.getFallingShape(1), "Shape after it was placed").to.not.be
          .undefined;
        expect(game.getFallingShape(3), "Shape after it was placed").to.not.be
          .undefined;

        expect(
          game.getFallingShape(1).testShape,
          "Whether shape is the same as before after it was placed"
        ).to.be.undefined;
        expect(
          game.getFallingShape(3).testShape,
          "Whether shape is the same as before after it was placed"
        ).to.be.undefined;

        expect(
          game.getFallingShape(2).testShape,
          "Whether shape is the same as before after another was placed"
        ).to.not.be.undefined;
      },
      undefined,
      [
        "SetPlayerMessage",
        "SetPlayerMessage",
        "SetPlayerMessage",
        "UpdateGridMessage",
      ],
      0
    );
  });
  it("If two shapes overlap when touching the ground, only one should be placed", () => {
    const shape1 = new FallingShape(0, 1, 5, 3, 0);
    const shape2 = new FallingShape(0, 2, 5, 3, 0);

    shape1.testShape = true;
    shape2.testShape = true;

    let placeCount = 0;

    let grid = new MockGrid(10, 5, (shape) => {
      placeCount++;
    });

    runOnGame(
      grid,
      [shape1, shape2],
      (game) => {
        game.step();

        expect(game.size, "Number of players after placing.").to.equal(2);

        expect(game.getFallingShape(1), "Shape after it was placed").to.not.be
          .undefined;
        expect(game.getFallingShape(2), "Shape after it was placed.").to.not.be
          .undefined;

        expect(
          game.getFallingShape(1).testShape,
          "Whether shape is the same after it was placed"
        ).to.be.undefined;
        expect(
          game.getFallingShape(2).testShape,
          "Whether shape is the same after it was placed"
        ).to.be.undefined;

        expect(
          placeCount,
          "Number of shapes that actually were placed on the map"
        ).to.equal(1);
      },
      undefined,
      [
        (message) => message.constructor.name === "UpdateGridMessage",
        (message) => {
          return (
            message.constructor.name === "SetPlayerMessage" &&
            message.getPlayerId() === 1 &&
            message.getFallingShape().row === 0
          );
        },
        (message) => {
          return (
            message.constructor.name === "SetPlayerMessage" &&
            message.getPlayerId() === 2 &&
            message.getFallingShape().row === 0
          );
        },
      ],
      0
    );
  });
});

describe("Game interaction", () => {
  it("Trying to move shape to valid position should move only that one.", () => {
    const initCol = 5;
    const moveTo = initCol + 2;
    const shape1 = new FallingShape(0, 1, initCol, 3, 0);
    const shape2 = new FallingShape(0, 2, initCol, 3, 0);

    const grid = new PlacedShapesGrid(10, 10);

    runOnGame(
      grid,
      [shape1, shape2],
      (game) => {
        game.onMessage(1, new MoveMessage(moveTo));

        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).col).to.equal(moveTo);

        expect(game.getFallingShape(2)).to.not.be.undefined;
        expect(game.getFallingShape(2).col).to.equal(initCol);
      },
      [
        new SetPlayerMessage(
          new PlayerInfo(1, new FallingShape(0, 1, moveTo, 3, 0))
        ),
      ]
    );
  });
  it("Trying to move shape out of bounds should result in no change", () => {
    const initCol = 5;
    const moveTo = 0;
    const shape1 = new FallingShape(0, 1, initCol, 3, 0);

    const grid = new PlacedShapesGrid(10, 10);

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(1, new MoveMessage(moveTo));

        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).col).to.equal(initCol);
      },
      [],
      undefined,
      0
    );
  });
  it("Trying to move shape inside fallen brick should result in no change", () => {
    const initCol = 2;
    const moveTo = 1;
    const shape1 = new FallingShape(0, 1, initCol, 2, 0);

    const grid = new PlacedShapesGrid(5, 5);
    grid.map = [
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [-1, 2, -1, -1, -1],
      [-1, 2, -1, -1, -1],
    ];

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(1, new MoveMessage(moveTo));
        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).col).to.equal(initCol);
      },
      [],
      undefined,
      0
    );
  });

  it("Trying to rotate shape in valid context should succeed", () => {
    const shape1 = new FallingShape(0, 1, 2, 2, 0);

    const grid = new PlacedShapesGrid(5, 5);

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(1, new RotateMessage("left"));

        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).rotation).to.equal(3);
      },
      [
        new SetPlayerMessage(
          new PlayerInfo(1, new FallingShape(0, 1, 2, 2, 3))
        ),
      ],
      undefined,
      0
    );
  });
  it("Trying to rotate shape causing it to be out of top bound of map should succeed", () => {
    const shape1 = new FallingShape(0, 1, 2, 0, 0);

    const grid = new PlacedShapesGrid(5, 5);

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(1, new RotateMessage("left"));

        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).rotation).to.equal(3);
      },
      [
        new SetPlayerMessage(
          new PlayerInfo(1, new FallingShape(0, 1, 2, 0, 3))
        ),
      ],
      undefined,
      0
    );
  });
  it("Trying to rotate shape causing it to be out of bounds should result in no change", () => {
    const shape1 = new FallingShape(0, 1, 0, 2, 3);

    const grid = new PlacedShapesGrid(5, 5);

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(1, new RotateMessage("right"));

        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).rotation).to.equal(3);
      },
      [],
      undefined,
      0
    );
  });
  it("Trying to rotate shape causing it to overlap fallen brick should result in no change and no message", () => {
    const shape1 = new FallingShape(0, 1, 2, 2, 0);

    const grid = new PlacedShapesGrid(5, 5);
    grid.map = [
      [-1, -1, -1, -1, -1],
      [-1, -1, 2, -1, -1],
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
    ];

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(1, new RotateMessage("left"));

        expect(game.getFallingShape(1)).to.not.be.undefined;
        expect(game.getFallingShape(1).rotation).to.equal(0);
      },
      [],
      undefined,
      0
    );
  });

  it("Trying to slam shape should ask map to slam shape and count number of cleared lines.", () => {
    const shape1 = new FallingShape(0, 1, 2, 2, 0);

    let dropCount = 0;

    const grid = new MockGrid(5, 5, (shape) => dropCount++);

    grid.map = [
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1],
      [2, -1, -1, -1, 2],
      [2, 2, -1, 2, 2],
    ];

    runOnGame(
      grid,
      [shape1],
      (game) => {
        game.onMessage(shape1.playerId, new SlamMessage());
        expect(game.get(1)?.clearedLines, "Number of cleared lines").to.equal(
          2
        );
      },
      undefined,
      [],
      0
    );

    expect(dropCount, "Number of calls to slam on the grid").to.equal(1);
  });
});

describe("Player joining and leaving", () => {
  it("introduceNewPlayer should add player and shape, and broadcast correct message", () => {
    const grid = new PlacedShapesGrid(10, 10);
    const p = new PlayerInfo(42);
    const expectedMessages = [
      (message) => {
        expect(message.constructor.name).to.equal("SetPlayerMessage");
        expect(message.getPlayerId()).to.equal(p.id);
        expect(message.getFallingShape()).to.not.equal(undefined);
        expect(message.getClearedLines()).to.equal(0);
      },
    ];

    runOnGame(
      grid,
      [],
      (game) => {
        game.introduceNewPlayer(p);

        expect(game.size).to.equal(1);
        expect(game.get(p.id).id).to.equal(p.id);
        expect(
          game.get(p.id).shape,
          "A shape should have been added to introduced player"
        ).to.not.be.undefined;
        expect(
          game.get(p.id).clearedLines,
          "A new player should have no cleared lines."
        ).to.equal(0);
      },
      expectedMessages,
      undefined,
      0
    );
  });
  it("introduceNewPlayer should do nothing if player already exists.", () => {
    const grid = new PlacedShapesGrid(10, 10);
    const p = new PlayerInfo(42);
    const expectedMessages = [];

    runOnGame(
      grid,
      [new FallingShape(0, p.id, 5, 5, 0)],
      (game) => {
        game.introduceNewPlayer(p);

        expect(
          game.size,
          "Player should not be added if it already exists."
        ).to.equal(1);
      },
      expectedMessages,
      undefined,
      0
    );
  });
  it("When player quits, should be removed from map and others notified", () => {
    const grid = new PlacedShapesGrid(10, 10);
    const shape = new FallingShape(0, 42, 5, 5, 0);
    const expectedMessages = [new RemovePlayerMessage(shape.playerId)];

    runOnGame(
      grid,
      [shape],
      (game) => {
        game.quit(shape.playerId);

        expect(game.size).to.equal(0);
      },
      expectedMessages,
      undefined,
      0
    );
  });
  it("All players should be removed on game over", () => {
    const grid = new PlacedShapesGrid(5, 3);
    const shape = new FallingShape(0, 42, 2, 1, 0);
    const expectedMessages = [new GameOverMessage()];

    runOnGame(
      grid,
      [shape],
      (game) => {
        game.step();
        game.step();
        expect(game.size, "Number of players in the game").to.equal(0);
      },
      undefined,
      expectedMessages,
      1
    );
  });
});

describe("Replica", () => {
  it("SetPlayerMessage should add a new player", () => {
    const replica = new Replica();
    expect(replica.size, "Number of players upon creation of replica").to.equal(
      0
    );
    replica.onMessage(
      new SetPlayerMessage(new PlayerInfo(42, new FallingShape(0, 42, 3, 3, 0)))
    );
    expect(replica.size, "Number of players after SetPlayerMessage").to.equal(
      1
    );
  });
  it("SetPlayerMessage should replace an existing player", () => {
    const replica = new Replica();
    const newPlayer = new PlayerInfo(42, new FallingShape(0, 42, 4, 4, 1));
    newPlayer.clearedLines = 14;
    replica.onMessage(
      new SetPlayerMessage(new PlayerInfo(42, new FallingShape(0, 42, 3, 3, 0)))
    );
    replica.onMessage(new SetPlayerMessage(newPlayer));
    expect(replica.size, "Number of players after SetPlayerMessage").to.equal(
      1
    );
    expect(replica.get(42)).to.deep.equal(newPlayer);
  });
  it("RemovePlayerMessage should remove player from map", () => {
    const replica = new Replica();
    replica.set(42, new PlayerInfo(42, new FallingShape(0, 42, 3, 3, 0)));
    replica.onMessage(new RemovePlayerMessage(42));
    expect(replica.size, "Number of players after SetPlayerMessage").to.equal(
      0
    );
  });
  it("UpdateGridMessage should update the map", () => {
    const replica = new Replica();
    const newMap = new PlacedShapesGrid(3, 3);
    newMap.map = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    replica.onMessage(new UpdateGridMessage(newMap));
    expect(replica.grid, "New game map").to.deep.equal(newMap);
  });
});
