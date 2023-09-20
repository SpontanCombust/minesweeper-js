import { Board } from "./board";
import MinesweeperGame from "./game";
import vec2 from "./vec";

const width = 16;
const height = 16;
const bombCount = 32;
const board = new Board(new vec2(width, height), bombCount);
const game = new MinesweeperGame(board);

game.start();