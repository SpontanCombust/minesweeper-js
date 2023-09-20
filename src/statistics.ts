export default class Statistics {
    public bombsLeft: number = 0;

    private timeElapsedMs: number = 0; 

    private bombsLeftElem: HTMLElement;
    private timeElapsedElem: HTMLElement;


    constructor() {
        const bombsLeftElem = document.getElementById("bombsLeft");
        if (bombsLeftElem == null) {
            throw new Error("Not found bombs left counter");
        }

        const timeElapsedElem = document.getElementById("timeElapsed");
        if (timeElapsedElem == null) {
            throw new Error("Not found elapsed time counter");
        }

        this.bombsLeftElem = bombsLeftElem;
        this.timeElapsedElem = timeElapsedElem;
    }

    public restartTimeCounter() {
        this.timeElapsedMs = 0;
    }

    public updateTimeCounter(dt: number) {
        this.timeElapsedMs += dt;
    }

    public draw() {
        this.bombsLeftElem.innerHTML = this.bombsLeft.toString();

        const timeElapsedSeconds = Math.floor(this.timeElapsedMs / 1000.0);
        this.timeElapsedElem.innerHTML = timeElapsedSeconds.toString();
    }
}