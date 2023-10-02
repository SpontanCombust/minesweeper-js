// docs/dist/vec.js
var vec2 = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `[${this.x}, ${this.y}]`;
  }
};
var vec_default = vec2;
vec2.ZERO = {
  x: 0,
  y: 0
};

// docs/dist/tile.js
var TILE_SIZE = new vec_default(30, 30);
var TILE_GAP = new vec_default(3, 3);
var TILE_COLOR_HIDDEN = "rgb(230, 230, 230)";
var TILE_COLOR_RELEAVED = "rgb(179, 179, 179)";
var TILE_COLOR_RELEAVED_EXPLODED = "red";
var Tile = class {
  constructor(boardPosition, canvasPosition) {
    this.boardPosition = boardPosition;
    this.canvasPosition = canvasPosition;
    this.state = TileState.Hidden;
    this.hasBomb = false;
    this.adjacentBombCount = 0;
  }
  draw(ctx) {
    ctx.fillStyle = this.tileColor();
    ctx.fillRect(this.canvasPosition.x, this.canvasPosition.y, TILE_SIZE.x, TILE_SIZE.y);
    const text = this.tileText();
    if (text.length > 0) {
      ctx.font = "20px arial";
      ctx.textAlign = "center";
      ctx.fillStyle = this.tileTextColor();
      ctx.fillText(text, this.canvasPosition.x + TILE_SIZE.x * 0.5, this.canvasPosition.y + TILE_SIZE.y * 0.75);
    }
  }
  tileColor() {
    switch (this.state) {
      case TileState.Hidden:
      case TileState.HiddenFlagged:
        return TILE_COLOR_HIDDEN;
      case TileState.Revealed:
        if (this.hasBomb) {
          return TILE_COLOR_RELEAVED_EXPLODED;
        } else {
          return TILE_COLOR_RELEAVED;
        }
    }
  }
  tileText() {
    switch (this.state) {
      case TileState.Hidden:
        return "";
      case TileState.HiddenFlagged:
        return "F";
      case TileState.Revealed:
        if (this.hasBomb) {
          return "B";
        } else if (this.adjacentBombCount > 0) {
          return this.adjacentBombCount.toString();
        }
    }
    return "";
  }
  tileTextColor() {
    switch (this.state) {
      case TileState.HiddenFlagged:
        return "red";
      case TileState.Revealed:
        if (this.hasBomb) {
          return "black";
        } else {
          switch (this.adjacentBombCount) {
            case 1:
              return "#0000ff";
            case 2:
              return "#008000";
            case 3:
              return "#ff0000";
            case 4:
              return "#000080";
            case 5:
              return "#800000";
            case 6:
              return "#008080";
            case 7:
              return "#000000";
            case 8:
              return "#800080";
          }
        }
        ;
      default:
        return "black";
    }
  }
};
var TileState;
(function(TileState2) {
  TileState2[TileState2["Hidden"] = 0] = "Hidden";
  TileState2[TileState2["HiddenFlagged"] = 1] = "HiddenFlagged";
  TileState2[TileState2["Revealed"] = 2] = "Revealed";
})(TileState || (TileState = {}));

// docs/dist/board.js
var _Board = class {
  constructor(size, maxBombCount) {
    this.isPopulated = false;
    this.tilesData = [];
    if (size.x < 3 || size.y < 3) {
      throw new Error("Board size should be at least 3x3");
    }
    const canvas = document.getElementById("canvas");
    if (canvas == null) {
      throw new Error("Canvas not found");
    }
    this.canvas = canvas;
    const ctx = this.canvas.getContext("2d");
    if (ctx == null) {
      throw new Error("Couldn't get 2D drawing context from the canvas");
    }
    this.ctx = ctx;
    this.size = size;
    this.maxBombCount = maxBombCount;
    this.bombCount = 0;
    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const boardPos = new vec_default(x, y);
        const canvasPos = this.boardToCanvasPosition(boardPos);
        this.tilesData.push(new Tile(boardPos, canvasPos));
      }
    }
    this.canvas.addEventListener("mousedown", (ev) => this.onMouseClick(ev));
    this.canvas.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      return false;
    });
    const [w, h] = [
      TILE_GAP.x + size.x * (TILE_SIZE.x + TILE_GAP.x),
      TILE_GAP.y + size.y * (TILE_SIZE.y + TILE_GAP.y)
    ];
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const tile of this.tilesData) {
      tile.draw(this.ctx);
    }
  }
  getCanvas() {
    return this.canvas;
  }
  getBombCount() {
    return this.bombCount;
  }
  getTile(pos) {
    const i = this.indexFromPosition(pos);
    if (i == null) {
      return null;
    } else {
      return this.tilesData[i];
    }
  }
  getTiles() {
    return this.tilesData;
  }
  generateContent(safeSpot) {
    let availableBombIndices = Array.from({length: this.tilesData.length}, (_, i2) => i2);
    const i = this.indexFromPosition(safeSpot);
    if (i == null) {
      throw _Board.PositionOutOfBoundsError;
    }
    const adj = this.getAdjacentPositions(safeSpot).map((p) => this.indexFromPosition(p));
    let exceptions = [i, ...adj];
    exceptions.sort((a, b) => b - a);
    exceptions.forEach((i2) => availableBombIndices.splice(i2, 1));
    let bombCount2 = 0;
    while (bombCount2 < this.maxBombCount && availableBombIndices.length > 0) {
      const spotIdx = Math.floor(Math.random() * (availableBombIndices.length - 1));
      const tileIdx = availableBombIndices[spotIdx];
      this.tilesData[tileIdx].hasBomb = true;
      availableBombIndices.splice(spotIdx, 1);
      bombCount2++;
    }
    this.bombCount = bombCount2;
    for (let i2 = 0; i2 < this.tilesData.length; i2++) {
      const pos = this.positionFromIndex(i2);
      const bombCount22 = this.getAdjacentTiles(pos).filter((t) => t.hasBomb).length;
      this.tilesData[i2].adjacentBombCount = bombCount22;
    }
    this.isPopulated = true;
  }
  getAdjacentPositions(pos) {
    if (!this.isPositionInBounds(pos)) {
      return [];
    }
    return [
      new vec_default(pos.x - 1, pos.y - 1),
      new vec_default(pos.x, pos.y - 1),
      new vec_default(pos.x + 1, pos.y - 1),
      new vec_default(pos.x - 1, pos.y),
      new vec_default(pos.x + 1, pos.y),
      new vec_default(pos.x - 1, pos.y + 1),
      new vec_default(pos.x, pos.y + 1),
      new vec_default(pos.x + 1, pos.y + 1)
    ].filter((v) => this.isPositionInBounds(v));
  }
  getAdjacentTiles(pos) {
    return this.getAdjacentPositions(pos).map((p) => this.getTile(p)).filter((t) => t != null).map((t) => t);
  }
  isPositionInBounds(pos) {
    return pos.x >= 0 && pos.x < this.size.x && pos.y >= 0 && pos.y < this.size.y;
  }
  indexFromPosition(pos) {
    if (!this.isPositionInBounds(pos)) {
      return null;
    }
    return pos.y * this.size.x + pos.x;
  }
  positionFromIndex(i) {
    if (i < this.size.x * this.size.y) {
      return new vec_default(i % this.size.y, Math.floor(i / this.size.y));
    } else {
      throw _Board.IndexOutOfBoundsError;
    }
  }
  boardToCanvasPosition(pos) {
    return new vec_default(TILE_GAP.x + pos.x * (TILE_SIZE.x + TILE_GAP.x), TILE_GAP.y + pos.y * (TILE_SIZE.y + TILE_GAP.y));
  }
  canvasToBoardPosition(pos) {
    const coord = new vec_default(Math.floor(pos.x / (TILE_SIZE.x + TILE_GAP.x)), Math.floor(pos.y / (TILE_SIZE.y + TILE_GAP.y)));
    if (coord.x >= 0 && coord.x < this.size.x && coord.y >= 0 && coord.y < this.size.y) {
      return coord;
    }
    return null;
  }
  onMouseClick(ev) {
    if (this.onTileClicked) {
      const offset = this.canvas.getBoundingClientRect();
      const canvasPos = new vec_default(ev.clientX - offset.x, ev.clientY - offset.y);
      const boardPos = this.canvasToBoardPosition(canvasPos);
      console.log(`canvasPos=${canvasPos}; boardPos=${boardPos}`);
      if (boardPos != null) {
        const tile = this.getTile(boardPos);
        if (tile != null) {
          console.log(`tile=`, tile);
          this.onTileClicked(tile, ev);
        }
      }
    }
  }
};
var Board = _Board;
Board.PositionOutOfBoundsError = new Error("Board position out of bounds");
Board.IndexOutOfBoundsError = new Error("Board tile index out of bounds");

// docs/dist/statistics.js
var Statistics = class {
  constructor() {
    this.bombsLeft = 0;
    this.timerActive = false;
    this.timeElapsedSec = 0;
    const bombsLeftElem = document.getElementById("bombsLeft");
    if (bombsLeftElem == null) {
      throw new Error("Bombs left counter element not found");
    }
    const timeElapsedElem = document.getElementById("timeElapsed");
    if (timeElapsedElem == null) {
      throw new Error("Elapsed time counter element not found");
    }
    const gameResultElem = document.getElementById("gameResult");
    if (gameResultElem == null) {
      throw new Error("Game result element not found");
    }
    this.bombsLeftElem = bombsLeftElem;
    this.timeElapsedElem = timeElapsedElem;
    this.gameResultElem = gameResultElem;
  }
  startTimeCounter() {
    this.timerActive = true;
  }
  stopTimeCounter() {
    this.timerActive = false;
  }
  restartTimeCounter() {
    this.timeElapsedSec = 0;
  }
  updateTimeCounter(dt) {
    if (this.timerActive) {
      this.timeElapsedSec += dt;
    }
  }
  announceVictory() {
    this.gameResultElem.innerHTML = "You WON!";
    this.gameResultElem.style.color = "green";
  }
  announceLoss() {
    this.gameResultElem.innerHTML = "You LOSE!";
    this.gameResultElem.style.color = "red";
  }
  draw() {
    this.bombsLeftElem.value = this.bombsLeft.toString();
    this.timeElapsedElem.value = Math.floor(this.timeElapsedSec).toString();
  }
};
var statistics_default = Statistics;

// docs/dist/game.js
var MinesweeperGame = class {
  constructor(board2) {
    this.stats = new statistics_default();
    this.lastTimestamp = 0;
    this.board = board2;
    this.board.onTileClicked = (t, ev) => this.handleTileClick(t, ev);
  }
  start() {
    window.requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  gameLoop(timestamp) {
    const dt = (timestamp - this.lastTimestamp) / 1e3;
    this.stats.updateTimeCounter(dt);
    this.stats.draw();
    this.board.draw();
    this.lastTimestamp = timestamp;
    window.requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  handleTileClick(tile, ev) {
    switch (ev.button) {
      case 0:
      case 1:
        if (!this.board.isPopulated) {
          this.board.generateContent(tile.boardPosition);
          this.setBombsLeftCounter();
          this.stats.startTimeCounter();
        }
        if (tile.state == TileState.Hidden) {
          this.revealTile(tile);
        } else if (tile.state == TileState.Revealed) {
          const adj = this.board.getAdjacentTiles(tile.boardPosition);
          const flaggedCount = adj.filter((t) => t.state == TileState.HiddenFlagged).length;
          if (flaggedCount >= tile.adjacentBombCount) {
            this.revealAdjacentTiles(tile);
          }
        }
        break;
      case 2:
        if (tile.state == TileState.Hidden) {
          tile.state = TileState.HiddenFlagged;
        } else if (tile.state == TileState.HiddenFlagged) {
          tile.state = TileState.Hidden;
        }
        this.setBombsLeftCounter();
        break;
    }
  }
  revealTile(tile) {
    tile.state = TileState.Revealed;
    if (tile.hasBomb) {
      console.log("You LOSE!");
      this.board.getTiles().filter((t) => t.hasBomb).forEach((t) => t.state = TileState.Revealed);
      this.stats.stopTimeCounter();
      this.stats.announceLoss();
    } else {
      const anyHiddenWithoutBomb = this.board.getTiles().filter((t) => !t.hasBomb && t.state != TileState.Revealed).length > 0;
      if (!anyHiddenWithoutBomb) {
        console.log("You WON!");
        this.stats.stopTimeCounter();
        this.stats.announceVictory();
      } else if (tile.adjacentBombCount == 0) {
        this.revealAdjacentTiles(tile);
      }
    }
  }
  revealAdjacentTiles(tile) {
    this.board.getAdjacentTiles(tile.boardPosition).filter((t) => t.state == TileState.Hidden).forEach((t) => this.revealTile(t));
  }
  setBombsLeftCounter() {
    const flaggedCount = this.board.getTiles().filter((t) => t.state == TileState.HiddenFlagged).length;
    this.stats.bombsLeft = Math.max(0, this.board.getBombCount() - flaggedCount);
  }
};
var game_default = MinesweeperGame;
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var width = parseInt(urlParams.get("width") ?? "16");
var height = parseInt(urlParams.get("height") ?? "16");
var bombCount = parseInt(urlParams.get("bombCount") ?? "32");
var board = new Board(new vec_default(width, height), bombCount);
var game = new MinesweeperGame(board);
game.start();
export {
  game_default as default
};
//# sourceMappingURL=game.js.map
