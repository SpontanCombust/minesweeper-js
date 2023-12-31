import { Board, TileAction } from "./board";
import Statistics from "./statistics";
import { Tile, TileState } from "./tile";
import vec2 from "./vec";

export default class MinesweeperGame {
    private board: Board;
    private stats: Statistics = new Statistics();
    private lastTimestamp: number = 0;

    constructor(board: Board) {
        this.board = board;
        this.board.onTileClicked = (t, ev) => this.handleTileClick(t, ev);
    }

    public start() {
        window.requestAnimationFrame((ts) => this.gameLoop(ts));
    }



    private gameLoop(timestamp: number): void {
        const dt = (timestamp - this.lastTimestamp) / 1000.0;
        
        this.stats.updateTimeCounter(dt);

        this.stats.draw();
        this.board.draw();
    
        this.lastTimestamp = timestamp;
        window.requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    private handleTileClick(tile: Tile, action: TileAction) {
        switch(action)
        {
            case TileAction.Primary:
                if(!this.board.isPopulated) {
                    this.board.generateContent(tile.boardPosition);
                    this.setBombsLeftCounter();
                    this.stats.startTimeCounter();
                }

                if (tile.state == TileState.Hidden) {
                    this.revealTile(tile);
                } else if (tile.state == TileState.Revealed) {
                    const adj = this.board.getAdjacentTiles(tile.boardPosition);
                    const flaggedCount = adj.filter(t => t.state == TileState.HiddenFlagged).length;
                    if (flaggedCount >= tile.adjacentBombCount) {
                        this.revealAdjacentTiles(tile);
                    }
                }
                break;
                
            case TileAction.Secondary:
                if (tile.state == TileState.Hidden) {
                    tile.state = TileState.HiddenFlagged;
                } else if (tile.state == TileState.HiddenFlagged) {
                    tile.state = TileState.Hidden;
                }
                this.setBombsLeftCounter();
                break;
        }
    }

    private revealTile(tile: Tile) {
        tile.state = TileState.Revealed;
        if (tile.hasBomb) {
            console.log("You LOSE!");
            this.board.getTiles()
                      .filter(t => t.hasBomb)
                      .forEach(t => t.state = TileState.Revealed);
            this.stats.stopTimeCounter();
            this.stats.announceLoss();
        } else {
            const anyHiddenWithoutBomb = this.board.getTiles()
                                                   .filter(t => !t.hasBomb && t.state != TileState.Revealed)
                                                   .length > 0;
            if (!anyHiddenWithoutBomb) {
                console.log("You WON!");
                this.stats.stopTimeCounter();
                this.stats.announceVictory();
            } else if (tile.adjacentBombCount == 0) {
                this.revealAdjacentTiles(tile);
            }
        }
    }

    private revealAdjacentTiles(tile: Tile) {
        this.board.getAdjacentTiles(tile.boardPosition)
                  .filter(t => t.state == TileState.Hidden)
                  .forEach(t => this.revealTile(t));
    }

    private setBombsLeftCounter() {
        const flaggedCount = this.board.getTiles()
                                         .filter(t => t.state == TileState.HiddenFlagged)
                                         .length;
        this.stats.bombsLeft = Math.max(0, this.board.getBombCount() - flaggedCount);
    }
}



const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const width = parseInt(urlParams.get("width") ?? "16");
const height = parseInt(urlParams.get("height") ?? "16");
const bombCount = parseInt(urlParams.get("bombCount") ?? "32");

const board = new Board(new vec2(width, height), bombCount);
const game = new MinesweeperGame(board);

game.start();