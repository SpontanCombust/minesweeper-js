document.getElementById("resetGameBtn")?.addEventListener("click", (ev) => {
    const widthInput = document.getElementById("boardWidthInput") as HTMLInputElement;
    const heightInput = document.getElementById("boardHeightInput") as HTMLInputElement;
    const bombCountInput = document.getElementById("bombCountInput") as HTMLInputElement;
    
    const width = widthInput.value;
    const height = heightInput.value;
    const bombCount = bombCountInput.value;

    const gameFrame = document.getElementById("gameFrame") as HTMLIFrameElement;
    const urlParams = new URLSearchParams([
        ["width", width],
        ["height", height],
        ["bombCount", bombCount]
    ]);

    gameFrame.src = "game.html?" + urlParams.toString();
});