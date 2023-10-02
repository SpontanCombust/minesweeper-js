import { TILE_GAP, TILE_SIZE, Tile, TileState } from "./tile";
import vec2 from "./vec";

export class Board {
    public onTileClicked?: (tile: Tile, ev: MouseEvent) => any;
    public isPopulated: boolean = false;
    
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private size: vec2;
    private maxBombCount: number;
    private bombCount: number;
    private tilesData: Tile[] = [];

    private static PositionOutOfBoundsError = new Error("Board position out of bounds");
    private static IndexOutOfBoundsError = new Error("Board tile index out of bounds");


    constructor(size: vec2, maxBombCount: number) {
        if (size.x < 3 || size.y < 3) {
            throw new Error("Board size should be at least 3x3");
        }

        const canvas = document.getElementById("canvas");
        if (canvas == null) {
            throw new Error("Canvas not found");
        }
        this.canvas = canvas as HTMLCanvasElement;      

        const ctx = this.canvas.getContext("2d");
        if (ctx == null) {
            throw new Error("Couldn't get 2D drawing context from the canvas");
        }
        this.ctx = ctx!;

        this.size = size;
        this.maxBombCount = maxBombCount;
        this.bombCount = 0;

        for(let y = 0; y < size.y; y++) {
            for(let x = 0; x < size.x; x++) {
                const boardPos = new vec2(x, y);
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

    public draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(const tile of this.tilesData) {
            tile.draw(this.ctx);
        }
    }



    public getCanvas() : HTMLCanvasElement {
        return this.canvas;
    }

    public getBombCount() : number {
        return this.bombCount;
    }

    public getTile(pos: vec2) : Tile | null {
        const i = this.indexFromPosition(pos);
        if (i == null) {
            return null;
        } else {
            return this.tilesData[i];
        }
    }

    public getTiles() : Tile[] {
        return this.tilesData;
    }



    public generateContent(safeSpot: vec2) {
        // ========================== PUT BOMBS ===========================
        let availableBombIndices = Array.from(
            { length: this.tilesData.length },
            (_, i) => i
        );

        // we want to preserve a 3x3 spot of guaranteed no-bomb zone around the safe spot
        const i = this.indexFromPosition(safeSpot);
        if(i == null) {
            throw Board.PositionOutOfBoundsError;
        }

        const adj = this.getAdjacentPositions(safeSpot)
                        .map(p => this.indexFromPosition(p)!);

        let exceptions = [i, ...adj];
        exceptions.sort((a, b) => b - a);
        exceptions.forEach(i => availableBombIndices.splice(i, 1));

        let bombCount = 0;
        while (bombCount < this.maxBombCount && availableBombIndices.length > 0) {
            const spotIdx = Math.floor(Math.random() * (availableBombIndices.length - 1));
            const tileIdx = availableBombIndices[spotIdx];
            this.tilesData[tileIdx].hasBomb = true;

            availableBombIndices.splice(spotIdx, 1);
            bombCount++;
        }
        this.bombCount = bombCount;


        // =================== COMPUTE ADJACENT BOMB COUNT ===================
        for(let i = 0; i < this.tilesData.length; i++) {
            const pos = this.positionFromIndex(i);
            const bombCount = this.getAdjacentTiles(pos)
                                  .filter(t => t.hasBomb)
                                  .length;
            this.tilesData[i].adjacentBombCount = bombCount;
        }

        this.isPopulated = true;
    }

    public getAdjacentPositions(pos: vec2) : vec2[] {
        if (!this.isPositionInBounds(pos)) {
            return [];
        }

        return [
            new vec2(pos.x - 1, pos.y - 1),
            new vec2(pos.x,     pos.y - 1),
            new vec2(pos.x + 1, pos.y - 1),
            new vec2(pos.x - 1, pos.y),
            new vec2(pos.x + 1, pos.y),
            new vec2(pos.x - 1, pos.y + 1),
            new vec2(pos.x,     pos.y + 1),
            new vec2(pos.x + 1, pos.y + 1)
        ].filter(v => this.isPositionInBounds(v));
    }

    public getAdjacentTiles(pos: vec2) : Tile[] {
        return this.getAdjacentPositions(pos)
                   .map(p => this.getTile(p))
                   .filter(t => t != null)
                   .map(t => t!);
    }





    private isPositionInBounds(pos: vec2) : boolean {
        return pos.x >= 0 && pos.x < this.size.x && pos.y >= 0 && pos.y < this.size.y;
    }

    private indexFromPosition(pos: vec2) : number | null {
        if (!this.isPositionInBounds(pos)) {
            return null;
        }

        return pos.y * this.size.x + pos.x;
    }

    private positionFromIndex(i: number) : vec2 {
        if (i < this.size.x * this.size.y) {
            return new vec2(
                i % this.size.y,
                Math.floor(i / this.size.y)
            );
        } else {
            throw Board.IndexOutOfBoundsError;
        }
    }

    private boardToCanvasPosition(pos: vec2) : vec2 {
        return new vec2(
            TILE_GAP.x + pos.x * (TILE_SIZE.x + TILE_GAP.x),
            TILE_GAP.y + pos.y * (TILE_SIZE.y + TILE_GAP.y)
        );
    }

    private canvasToBoardPosition(pos: vec2) : vec2 | null {
        const coord = new vec2(
            Math.floor(pos.x / (TILE_SIZE.x + TILE_GAP.x)),
            Math.floor(pos.y / (TILE_SIZE.y + TILE_GAP.y))
        );

        if (coord.x >= 0 && coord.x < this.size.x && coord.y >= 0 && coord.y < this.size.y) {
            return coord;
        }

        return null;
    }

    private onMouseClick(ev: MouseEvent) {
        if (this.onTileClicked) {
            const offset = this.canvas.getBoundingClientRect();
            const canvasPos = new vec2(ev.clientX - offset.x, ev.clientY - offset.y);
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
}