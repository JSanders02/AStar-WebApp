const directions = [[1, 0, "EW"], [0, 1, "SN"], [-1, 0, "WE"], [0, -1, "NS"]];

// Clears the canvas and redraws all nodes
function redrawCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let column of map) {
        for (let node of column) {
            node.draw();
        }
    }
}

// Main function of the maze generator.
function pickRandomNeighbour(currentNode) {
    // Parent will be null for the start node and only the start node.
    if (!currentNode.parent && currentNode.visited) {
        return;
    }

    currentNode.visit();

    let validDirections = [];
    for (let direction of directions) {
        let newCoords = addCoords(direction, currentNode.coords)
        if (!invalidCoords(newCoords) && !map[newCoords[0]][newCoords[1]].visited) {
            validDirections.push(direction);
        }
    }

    if (validDirections.length === 0) {
        pickRandomNeighbour(currentNode.parent);
        return;
    }

    let direction = randChoice(validDirections);
    let neighbour = addCoords(direction, currentNode.coords);
    neighbour = map[neighbour[0]][neighbour[1]];

    neighbour.parent = currentNode;

    currentNode.removeWall(direction[2][0]);
    neighbour.removeWall(direction[2][1]);

    pickRandomNeighbour(neighbour);
}

function generateMaze() {
    //generateButton.removeEventListener("click", generateMaze);

    // Initialise map with empty nodes
    for (let i=0; i<map.length; i++) {
        for (let j=0; j<map[i].length; j++) {
            map[i][j] = new Node(i, j, ctx.canvas.width / colNum, ctx.canvas.height / rowNum);
        }
    }

    for (let column of map) {
        for (let node of column) {
            node.walls = [true,true, true, true];
            node.draw();
        }
    }

    let startCoords = [randInt(0, colNum), randInt(0, rowNum)];

    let startNode = map[startCoords[0]][startCoords[1]]

    pickRandomNeighbour(startNode);

    redrawCanvas();

    startButton.addEventListener("click", initAStar, false);
    screenshotButton.addEventListener("click", savePNG, false);
}