// docs/dist/index.js
document.getElementById("resetGameBtn")?.addEventListener("click", (ev) => {
  const widthInput = document.getElementById("boardWidthInput");
  const heightInput = document.getElementById("boardHeightInput");
  const bombCountInput = document.getElementById("bombCountInput");
  const width = widthInput.value;
  const height = heightInput.value;
  const bombCount = bombCountInput.value;
  const gameFrame = document.getElementById("gameFrame");
  const urlParams = new URLSearchParams([
    ["width", width],
    ["height", height],
    ["bombCount", bombCount]
  ]);
  gameFrame.src = "game.html?" + urlParams.toString();
});
//# sourceMappingURL=index.js.map
