// references to HTML elements
const mazeCanvas = document.getElementById("mazeDisplayHTML");
const ctx = mazeCanvas.getContext("2d");
const newMazeButton = document.getElementById("newMazeButtonHTML");
const printMazeButton = document.getElementById("printMazeButtonHTML");

// maze grid configuration
var mazeSize = 15;
var cellSize = 40;
const START_POS = { x: 0, y: 0 };
const END_POS = { x: mazeSize - 1, y: mazeSize - 1 };
let playerX = START_POS.x, playerY = START_POS.y;
// Maze generation using Recursive Backtracking
function generateMaze(size) {
    const maze = [];
    for (let y = 0; y < size; y++) {
        maze[y] = [];
        for (let x = 0; x < size; x++) {
            maze[y][x] = {
                x,
                y,
                visited: false,
                walls: [true, true, true, true] // top, right, bottom, left
            };
        }
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function carve(x, y) {
        maze[y][x].visited = true;
        const directions = shuffle([
            [0, -1, 0], // up
            [1, 0, 1],  // right
            [0, 1, 2],  // down
            [-1, 0, 3]  // left
        ]);
        for (const [dx, dy, wall] of directions) {
            const nx = x + dx, ny = y + dy;
            if (
                nx >= 0 && nx < size &&
                ny >= 0 && ny < size &&
                !maze[ny][nx].visited
            ) {
                maze[y][x].walls[wall] = false;
                maze[ny][nx].walls[(wall + 2) % 4] = false;
                carve(nx, ny);
            }
        }
    }

    carve(0, 0);
    return maze;
}

// Draw maze on canvas
function drawMaze(grid, cellSize) {
    ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const cell = grid[y][x];
            const px = x * cellSize;
            const py = y * cellSize;
            // Top wall
            if (cell.walls[0]) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + cellSize, py);
                ctx.stroke();
            }
            // Right wall
            if (cell.walls[1]) {
                ctx.beginPath();
                ctx.moveTo(px + cellSize, py);
                ctx.lineTo(px + cellSize, py + cellSize);
                ctx.stroke();
            }
            // Bottom wall
            if (cell.walls[2]) {
                ctx.beginPath();
                ctx.moveTo(px + cellSize, py + cellSize);
                ctx.lineTo(px, py + cellSize);
                ctx.stroke();
            }
            // Left wall
            if (cell.walls[3]) {
                ctx.beginPath();
                ctx.moveTo(px, py + cellSize);
                ctx.lineTo(px, py);
                ctx.stroke();
            }
        }
    }
    // Draw the start as a green circle (top-left)
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(
        START_POS.x * cellSize + cellSize / 2,
        START_POS.y * cellSize + cellSize / 2,
        cellSize / 4,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // Draw the end as a blue circle (bottom-right)
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(
        END_POS.x * cellSize + cellSize / 2,
        END_POS.y * cellSize + cellSize / 2,
        cellSize / 4,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // Draw the player as a red circle
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
        playerX * cellSize + cellSize / 2,
        playerY * cellSize + cellSize / 2,
        cellSize / 4,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

// Set canvas size and draw
mazeCanvas.width = mazeSize * cellSize;
mazeCanvas.height = mazeSize * cellSize;

// Initial maze draw
let mazeGrid = generateMaze(mazeSize);
playerX = START_POS.x;
playerY = START_POS.y;
drawMaze(mazeGrid, cellSize);

// Add event listener to regenerate maze
newMazeButton.addEventListener("click", () => {
    mazeGrid = generateMaze(mazeSize);
    playerX = 0;
    playerY = 0;
    drawMaze(mazeGrid, cellSize);
});

// Add event listener to print the maze
printMazeButton.addEventListener("click", () => {

let url = mazeCanvas.toDataURL();
let win = window.open();
win.document.write("<img src='" + url + "'/>");
win.setTimeout(() => win.print(), 0);
});
// Add event listener for player movement
document.addEventListener("keydown", (e) => {
    const cell = mazeGrid[playerY][playerX];
    if (e.key === "ArrowUp" && !cell.walls[0] && playerY > 0) {
        playerY--;
    } else if (e.key === "ArrowRight" && !cell.walls[1] && playerX < mazeSize - 1) {
        playerX++;
    } else if (e.key === "ArrowDown" && !cell.walls[2] && playerY < mazeSize - 1) {
        playerY++;
    } else if (e.key === "ArrowLeft" && !cell.walls[3] && playerX > 0) {
        playerX--;
    }
    drawMaze(mazeGrid, cellSize);
});