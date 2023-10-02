export default class Statistics {
    public bombsLeft: number = 0;

    private timerActive: boolean = false;
    private timeElapsedSec: number = 0; 

    private bombsLeftElem: HTMLInputElement;
    private timeElapsedElem: HTMLInputElement;
    private gameResultElem: HTMLElement;


    constructor() {
        const bombsLeftElem = document.getElementById("bombsLeft") as (HTMLInputElement | null);
        if (bombsLeftElem == null) {
            throw new Error("Bombs left counter element not found");
        }

        const timeElapsedElem = document.getElementById("timeElapsed") as (HTMLInputElement | null);
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


    public startTimeCounter() {
        this.timerActive = true;
    }

    public stopTimeCounter() {
        this.timerActive = false;
    }

    public restartTimeCounter() {
        this.timeElapsedSec = 0;
    }

    public updateTimeCounter(dt: number) {
        if (this.timerActive) {
            this.timeElapsedSec += dt;
        }
    }


    public announceVictory() {
        this.gameResultElem.innerHTML = "You WON!";
        this.gameResultElem.style.color = "green"
    }

    public announceLoss() {
        this.gameResultElem.innerHTML = "You LOSE!";
        this.gameResultElem.style.color = "red"
    }


    public draw() {
        this.bombsLeftElem.value = this.bombsLeft.toString();
        this.timeElapsedElem.value = Math.floor(this.timeElapsedSec).toString();
    }
}