import vec2 from "./vec";

export const TILE_SIZE: vec2 = new vec2(30.0, 30.0);
export const TILE_GAP: vec2 = new vec2(3.0, 3.0);
const TILE_COLOR_HIDDEN: string = "rgb(230, 230, 230)";
const TILE_COLOR_RELEAVED: string = "rgb(179, 179, 179)";
const TILE_COLOR_RELEAVED_EXPLODED: string = "red";

export class Tile {
    readonly boardPosition: vec2;
    readonly canvasPosition: vec2;
    hasBomb: boolean;
    state: TileState;
    adjacentBombCount: number;

    constructor(boardPosition: vec2, canvasPosition: vec2) {
        this.boardPosition = boardPosition;
        this.canvasPosition = canvasPosition;
        this.state = TileState.Hidden;
        this.hasBomb = false;
        this.adjacentBombCount = 0;
    }

    public draw(ctx: CanvasRenderingContext2D) {
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


    private tileColor() : string {
        switch(this.state) {
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

    private tileText() : string {
        switch(this.state) {
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
    
    private tileTextColor() : string {
        switch(this.state) {
            case TileState.HiddenFlagged:
                return "red";
            case TileState.Revealed:
                if (this.hasBomb) {
                    return "black";
                } else {
                    switch(this.adjacentBombCount) {
                        case 1: return "#0000ff";
                        case 2: return "#008000";
                        case 3: return "#ff0000";
                        case 4: return "#000080";
                        case 5: return "#800000";
                        case 6: return "#008080";
                        case 7: return "#000000";
                        case 8: return "#800080";
                    }
                };
            default:
                return "black";
        }
    }
}

export enum TileState {
    Hidden,
    HiddenFlagged,
    Revealed
} 