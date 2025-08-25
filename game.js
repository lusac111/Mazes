// references to HTML elements
const mazeCanvas = document.getElementById("mazeDisplayHTML");
const ctx = mazeCanvas.getContext("2d");

// maze grid configuration
var mazeSize = 15;
var cellSize = 40;

//display maze grid
function drawMazeGrid() {
    ctx.strokeStyle = "black";
    for (let x = 0; x <= mazeSize; x++) {
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, mazeSize * cellSize);
    }
    for (let y = 0; y <= mazeSize; y++) {
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(mazeSize * cellSize, y * cellSize);
    }
    ctx.stroke();
}
drawMazeGrid();