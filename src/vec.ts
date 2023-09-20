export default class vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static ZERO: vec2 = {
        x: 0, 
        y: 0
    };

    public toString() {
        return `[${this.x}, ${this.y}]`;
    }
}