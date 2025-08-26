// references to HTML elements
const mazeCanvas = document.getElementById("mazeDisplayHTML");
const ctx = mazeCanvas.getContext("2d");
const newMazeButton = document.getElementById("newMazeButtonHTML");
const printMazeButton = document.getElementById("printMazeButtonHTML");
const toggleModeButton = document.getElementById("toggleModeButtonHTML");
const mazeSizeInput = document.getElementById("mazeSizeInputHTML");

// maze grid configuration
let mazeSize = 15;
let cellSize = 40;
const START_POS = { x: 0, y: 0 };
const END_POS = { x: mazeSize - 1, y: mazeSize - 1 };
let playerX = START_POS.x, playerY = START_POS.y;

// change maze size based on the user input
mazeSizeInput.addEventListener("change", () => {
    let newSize = parseInt(mazeSizeInput.value);
    if (isNaN(newSize) || newSize < 5) newSize = 5;
    if (newSize > 30) newSize = 30;
    mazeSize = newSize;
    mazeSizeInput.value = newSize;
    END_POS.x = mazeSize - 1;
    END_POS.y = mazeSize - 1;
    if (!endlessModeActive) {
        mazeGrid = generateMaze(mazeSize);
        let playerX = START_POS.x, playerY = START_POS.y;
        playerPixelX = playerX * cellSize;
        playerPixelY = playerY * cellSize;
        mazeCanvas.width = mazeSize * cellSize;
        mazeCanvas.height = mazeSize * cellSize;
        drawMaze(mazeGrid, cellSize);
    }
}); 
// Animation state for smooth movement
let isMoving = false;
let playerPixelX = START_POS.x * cellSize;
let playerPixelY = START_POS.y * cellSize;
let endlessPlayerPixelX = 7 * cellSize;
let endlessPlayerPixelY = 7 * cellSize;

// Maze generation using Recursive Backtracking
function generateMaze(size, offsetX = 0, offsetY = 0, maze = null) {
    // If maze is provided, carve only unvisited cells
    if (maze) {
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
                    nx >= 0 && nx < maze[0].length &&
                    ny >= 0 && ny < maze.length &&
                    !maze[ny][nx].visited
                ) {
                    maze[y][x].walls[wall] = false;
                    maze[ny][nx].walls[(wall + 2) % 4] = false;
                    carve(nx, ny);
                }
            }
        }
        // Carve all unvisited cells in the new region
        for (let y = offsetY; y < offsetY + size; y++) {
            for (let x = offsetX; x < offsetX + size; x++) {
                if (!maze[y][x].visited) {
                    carve(x, y);
                }
            }
        }
        return maze;
    } else {
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
}

// Endless maze state
let endlessMaze = null;
let endlessOffset = { x: 0, y: 0 };
let endlessPlayerX = 7, endlessPlayerY = 7;
let endlessModeActive = false;

// Helper to get or expand endless maze
function getEndlessMazeSection(offsetX, offsetY, size) {
    if (!endlessMaze) {
        endlessMaze = generateMaze(size);
        endlessOffset = { x: 0, y: 0 };
        return endlessMaze;
    }
    let expanded = false;
    let expandDir = null;
    // Expand right
    if (offsetX + size > endlessMaze[0].length) {
        expandDir = "right";
        for (let rowIdx = 0; rowIdx < endlessMaze.length; rowIdx++) {
            for (let i = 0; i < 5; i++) {
                endlessMaze[rowIdx].push({
                    x: endlessMaze[rowIdx].length,
                    y: rowIdx,
                    visited: false,
                    walls: [true, true, true, true]
                });
            }
        }
        expanded = true;
    }
    // Expand down
    if (offsetY + size > endlessMaze.length) {
        expandDir = "down";
        for (let i = 0; i < 5; i++) {
            const newRow = [];
            for (let x = 0; x < endlessMaze[0].length; x++) {
                newRow.push({
                    x,
                    y: endlessMaze.length,
                    visited: false,
                    walls: [true, true, true, true]
                });
            }
            endlessMaze.push(newRow);
        }
        expanded = true;
    }
    // Expand left
    if (offsetX < 0) {
        expandDir = "left";
        for (let rowIdx = 0; rowIdx < endlessMaze.length; rowIdx++) {
            for (let i = 0; i < 5; i++) {
                endlessMaze[rowIdx].unshift({
                    x: -1,
                    y: rowIdx,
                    visited: false,
                    walls: [true, true, true, true]
                });
            }
        }
        endlessOffset.x += 5;
        offsetX += 5;
        expanded = true;
    }
    // Expand up
    if (offsetY < 0) {
        expandDir = "up";
        for (let i = 0; i < 5; i++) {
            const newRow = [];
            for (let x = 0; x < endlessMaze[0].length; x++) {
                newRow.push({
                    x,
                    y: -1,
                    visited: false,
                    walls: [true, true, true, true]
                });
            }
            endlessMaze.unshift(newRow);
        }
        endlessOffset.y += 5;
        offsetY += 5;
        expanded = true;
    }

    // If expanded, generate a maze for the new region and connect it to the old maze
    if (expanded) {
        // Determine region bounds
        let regionX = offsetX, regionY = offsetY, regionW = endlessMaze[0].length, regionH = endlessMaze.length;
        if (expandDir === "right") regionX = regionW - 5;
        if (expandDir === "down") regionY = regionH - 5;
        if (expandDir === "left") regionX = 0;
        if (expandDir === "up") regionY = 0;

        // Generate a maze for the new region only
        function generateRegionMaze(maze, regionX, regionY, regionSizeX, regionSizeY, entryX, entryY, entryWall) {
            // Mark all cells in region as unvisited
            for (let y = regionY; y < regionY + regionSizeY; y++) {
                for (let x = regionX; x < regionX + regionSizeX; x++) {
                    maze[y][x].visited = false;
                    maze[y][x].walls = [true, true, true, true];
                }
            }
            // Carve maze in region
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
                        nx >= regionX && nx < regionX + regionSizeX &&
                        ny >= regionY && ny < regionY + regionSizeY &&
                        !maze[ny][nx].visited
                    ) {
                        maze[y][x].walls[wall] = false;
                        maze[ny][nx].walls[(wall + 2) % 4] = false;
                        carve(nx, ny);
                    }
                }
            }
            carve(entryX, entryY);
            // Open entry wall to connect to previous maze
            maze[entryY][entryX].walls[entryWall] = false;
            // Also open the adjacent cell's wall
            let adjX = entryX, adjY = entryY;
            if (entryWall === 0) adjY--;
            if (entryWall === 1) adjX++;
            if (entryWall === 2) adjY++;
            if (entryWall === 3) adjX--;
            if (
                adjX >= 0 && adjX < maze[0].length &&
                adjY >= 0 && adjY < maze.length
            ) {
                maze[adjY][adjX].walls[(entryWall + 2) % 4] = false;
            }
        }

        // Find entry point for new region (where player crosses boundary)
        let entryX, entryY, entryWall;
        const playerMazeX = endlessOffset.x + endlessPlayerX;
        const playerMazeY = endlessOffset.y + endlessPlayerY;
        if (expandDir === "right") {
            entryX = regionX;
            entryY = playerMazeY;
            entryWall = 3; // left wall
            generateRegionMaze(endlessMaze, regionX, 0, 5, endlessMaze.length, entryX, entryY, entryWall);
        } else if (expandDir === "down") {
            entryX = playerMazeX;
            entryY = regionY;
            entryWall = 0; // top wall
            generateRegionMaze(endlessMaze, 0, regionY, endlessMaze[0].length, 5, entryX, entryY, entryWall);
        } else if (expandDir === "left") {
            entryX = regionX + 4;
            entryY = playerMazeY;
            entryWall = 1; // right wall
            generateRegionMaze(endlessMaze, regionX, 0, 5, endlessMaze.length, entryX, entryY, entryWall);
        } else if (expandDir === "up") {
            entryX = playerMazeX;
            entryY = regionY + 4;
            entryWall = 2; // bottom wall
            generateRegionMaze(endlessMaze, 0, regionY, endlessMaze[0].length, 5, entryX, entryY, entryWall);
        }
        // Now, most cells in the new region have 2 walls, some have 3 (dead ends).
    }
    // Return the visible section
    const section = [];
    for (let y = offsetY; y < offsetY + size; y++) {
        section.push(endlessMaze[y] ? endlessMaze[y].slice(offsetX, offsetX + size) : []);
    }
    return section;
}

function endlessMazeMode() {
    endlessModeActive = true;
    mazeSize = 15;
    cellSize = 40;
    endlessMaze = null;
    endlessOffset = { x: 0, y: 0 };
    endlessPlayerX = 7;
    endlessPlayerY = 7;
    endlessPlayerPixelX = endlessPlayerX * cellSize;
    endlessPlayerPixelY = endlessPlayerY * cellSize;
    mazeCanvas.width = mazeSize * cellSize;
    mazeCanvas.height = mazeSize * cellSize;

    // Helper to always center the visible maze on the player
    function updateVisibleMaze() {
        // Center the visible maze on the player
        endlessOffset.x = endlessPlayerX + endlessOffset.x - Math.floor(mazeSize / 2);
        endlessOffset.y = endlessPlayerY + endlessOffset.y - Math.floor(mazeSize / 2);
        endlessPlayerX = Math.floor(mazeSize / 2);
        endlessPlayerY = Math.floor(mazeSize / 2);
        endlessPlayerPixelX = endlessPlayerX * cellSize;
        endlessPlayerPixelY = endlessPlayerY * cellSize;
        let visibleMaze = getEndlessMazeSection(endlessOffset.x, endlessOffset.y, mazeSize);
        drawMaze(visibleMaze, cellSize, false, "endless");
    }

    // Initial draw
    updateVisibleMaze();

    // Remove previous keydown listeners
    document.onkeydown = null;
    document.removeEventListener("keydown", regularMoveHandler);

    // Add endless mode movement handler
    document.onkeydown = function (e) {
        if (isMoving) return;
        let moved = false;
        let direction = null;
        let visibleMaze = getEndlessMazeSection(endlessOffset.x, endlessOffset.y, mazeSize);
        const cell = visibleMaze[endlessPlayerY][endlessPlayerX];
        let nextX = endlessPlayerX, nextY = endlessPlayerY;
        if (e.key === "ArrowUp" && !cell.walls[0] && endlessPlayerY > 0) {
            nextY--;
            moved = true;
            direction = "up";
        } else if (e.key === "ArrowRight" && !cell.walls[1] && endlessPlayerX < mazeSize - 1) {
            nextX++;
            moved = true;
            direction = "right";
        } else if (e.key === "ArrowDown" && !cell.walls[2] && endlessPlayerY < mazeSize - 1) {
            nextY++;
            moved = true;
            direction = "down";
        } else if (e.key === "ArrowLeft" && !cell.walls[3] && endlessPlayerX > 0) {
            nextX--;
            moved = true;
            direction = "left";
        }
        function afterMove() {
            // Always center the maze on the player after every move
            fadeMazeOutIn(() => {
                updateVisibleMaze();
            });
        }
        if (moved) {
            endlessPlayerX = nextX;
            endlessPlayerY = nextY;
            animatePlayerMove(endlessPlayerX, endlessPlayerY, "endless", afterMove);
        }
    };
}

// Draw maze on canvas
function drawMaze(grid, cellSize, animating = false, mode = "regular") {
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
    if (!endlessModeActive) {
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
    }

    // Draw the player as a red circle (animated position)
    ctx.fillStyle = "red";
    ctx.beginPath();
    if (mode === "endless" || endlessModeActive) {
        ctx.arc(
            endlessPlayerPixelX + cellSize / 2,
            endlessPlayerPixelY + cellSize / 2,
            cellSize / 4,
            0,
            2 * Math.PI
        );
    } else {
        ctx.arc(
            playerPixelX + cellSize / 2,
            playerPixelY + cellSize / 2,
            cellSize / 4,
            0,
            2 * Math.PI
        );
    }
    ctx.fill();
}

// Set canvas size and draw
mazeCanvas.width = mazeSize * cellSize;
mazeCanvas.height = mazeSize * cellSize;

// Initial maze draw
let mazeGrid = generateMaze(mazeSize);
playerX = START_POS.x;
playerY = START_POS.y;
playerPixelX = playerX * cellSize;
playerPixelY = playerY * cellSize;
drawMaze(mazeGrid, cellSize);

// Add event listener to regenerate maze
newMazeButton.addEventListener("click", () => {
    endlessModeActive = false;
    mazeGrid = generateMaze(mazeSize);
    mazeCanvas.width = mazeSize * cellSize;
    mazeCanvas.height = mazeSize * cellSize;
    drawMaze(mazeGrid, cellSize);
});

// Add event listener to print the maze
printMazeButton.addEventListener("click", () => {
    let url = mazeCanvas.toDataURL();
    let win = window.open();

    win.document.write("<img src='" + url + "'/>");
    win.setTimeout(() => win.print(), 0);
});

// Add event listener to toggle mode between regular and endless
toggleModeButton.addEventListener("click", () => {
    if (toggleModeButton.innerText === "Switch to Endless Mode") {
        toggleModeButton.innerText = "Switch to Regular Mode";
        endlessMazeMode();
    } else {
        toggleModeButton.innerText = "Switch to Endless Mode";
        endlessModeActive = false;
        mazeCanvas.width = mazeSize * cellSize;
        mazeCanvas.height = mazeSize * cellSize;
        drawMaze(mazeGrid, cellSize);
        document.onkeydown = null;
        document.addEventListener("keydown", regularMoveHandler);
    }
});

// Regular mode movement handler
function regularMoveHandler(e) {
    if (endlessModeActive || isMoving) return;
    const cell = mazeGrid[playerY][playerX];
    let nextX = playerX, nextY = playerY;
    if (e.key === "ArrowUp" && !cell.walls[0] && playerY > 0) {
        nextY--;
    } else if (e.key === "ArrowRight" && !cell.walls[1] && playerX < mazeSize - 1) {
        nextX++;
    } else if (e.key === "ArrowDown" && !cell.walls[2] && playerY < mazeSize - 1) {
        nextY++;
    } else if (e.key === "ArrowLeft" && !cell.walls[3] && playerX > 0) {
        nextX--;
    }
    if (nextX !== playerX || nextY !== playerY) {
        playerX = nextX;
        playerY = nextY;
        animatePlayerMove(playerX, playerY, "regular", () => {
            if (playerX === END_POS.x && playerY === END_POS.y) {
                alert("Congratulations! You've reached the end!");
                mazeGrid = generateMaze(mazeSize);
                playerX = 0;
                playerY = 0;
                playerPixelX = playerX * cellSize;
                playerPixelY = playerY * cellSize;
                drawMaze(mazeGrid, cellSize);
            }
        });
    }
}

// Helper for smooth movement animation
function animatePlayerMove(targetX, targetY, mode = "regular", callback) {
    isMoving = true;
    let startX, startY, endX, endY;
    if (mode === "endless") {
        startX = endlessPlayerPixelX;
        startY = endlessPlayerPixelY;
        endX = targetX * cellSize;
        endY = targetY * cellSize;
    } else {
        startX = playerPixelX;
        startY = playerPixelY;
        endX = targetX * cellSize;
        endY = targetY * cellSize;
    }
    const duration = 120; // ms
    const startTime = performance.now();
    function step(now) {
        let t = Math.min((now - startTime) / duration, 1);
        let currX = startX + (endX - startX) * t;
        let currY = startY + (endY - startY) * t;
        if (mode === "endless") {
            endlessPlayerPixelX = currX;
            endlessPlayerPixelY = currY;
        } else {
            playerPixelX = currX;
            playerPixelY = currY;
        }
        drawMaze(mode === "endless" ? getEndlessMazeSection(endlessOffset.x, endlessOffset.y, mazeSize) : mazeGrid, cellSize, true, mode);
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            if (mode === "endless") {
                endlessPlayerPixelX = endX;
                endlessPlayerPixelY = endY;
            } else {
                playerPixelX = endX;
                playerPixelY = endY;
            }
            isMoving = false;
            if (callback) callback();
        }
    }
    requestAnimationFrame(step);
}

// Helper for smooth maze fade
function fadeMazeOutIn(drawFn) {
    let opacity = 1;
    function fadeOut() {
        opacity -= 1;
        mazeCanvas.style.opacity = opacity;
        if (opacity > 0) {
            requestAnimationFrame(fadeOut);
        } else {
            drawFn();
            fadeIn();
        }
    }
    function fadeIn() {
        opacity += 0.1;
        mazeCanvas.style.opacity = opacity;
        if (opacity < 1) {
            requestAnimationFrame(fadeIn);
        } else {
            mazeCanvas.style.opacity = 1;
        }
    }
    fadeOut();
}