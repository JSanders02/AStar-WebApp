// Elements used by this script
const instructions = document.getElementById("instructions");

let startCoords;
let finishCoords;

// Controls the stage of the program
function initAStar() {

    // Clear node parents
    for (let col of map) {
        for (let node of col) {
            node.parent = null;
        }
    }

    instructions.innerText = "Select start node";

    generateButton.classList.add("hidden");
    startButton.classList.add("hidden");

    mapCanvas.addEventListener("click", setStart);
}

function findMouseOnCanvas(event) {
    let rect = mapCanvas.getBoundingClientRect()
    let x = event.clientX - rect.left
    let y = event.clientY - rect.top
    return [x, y];
}

function findClickedNode(coords) {
    let x = Math.floor(coords[0] / (ctx.canvas.width / colNum));
    let y = Math.floor(coords[1] / (ctx.canvas.height / rowNum));

    return map[x][y];
}

function setFinish(event) {
    let finishNode = findClickedNode(findMouseOnCanvas(event));
    finishNode.fill = "red";

    finishCoords = finishNode.coords;

    redrawCanvas();

    instructions.innerText = "Observe";
    mapCanvas.removeEventListener("click", setFinish);
    search();
}

function setStart(event) {
    let startNode = findClickedNode(findMouseOnCanvas(event));
    startNode.fill = "green";

    startCoords = startNode.coords;

    redrawCanvas();

    instructions.innerText = "Select finish node";
    mapCanvas.removeEventListener("click", setStart);
    mapCanvas.addEventListener("click", setFinish);
}

function search() {
    let startNode = map[startCoords[0]][startCoords[1]]

    // Initialise open list with just starting node
    let openList = [startNode];
    let closedList = [];
    let currentNode;

    let directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];

    while (openList.length > 0) {
        // Remove node with lowest f-cost from the openList, and set as current
        currentNode = openList.shift();

        // If current node is finish, break loop
        if (isEqualArray(currentNode.coords, finishCoords)) {
            break;
        }

        let validNeighbours = [];
        for (let i=0; i<directions.length; i++) {
            if (!currentNode.walls[i] &&
                  !invalidCoords(addCoords(currentNode.coords, directions[i]))) {
                validNeighbours.push(directions[i]);
            }
        }

        // Check every neighbour of the current node
        for (let neighbour of validNeighbours) {
            let neighbourCoords = addCoords(neighbour, currentNode.coords);

            // Calculate g cost of current neighbour
            let travelled = currentNode.g + pythagoras(currentNode.coords, neighbourCoords);

            let inOpen;
            let inClosed;

            // Check if current neighbour is in openList
            for (let node of openList) {
                if (isEqualArray(node.coords, neighbourCoords)) {
                    // If in open list, but new path has a lower g cost,
                    // change the node in open list to reflect the better values
                    if (node.g >= travelled) {
                        node.parent = currentNode;
                        node.g = travelled;
                        node.f = travelled + pythagoras(neighbourCoords, finishCoords);
                    }
                    inOpen = true;
                    break;
                }
            }

            if (!inOpen) {
                // Check if neighbour in closed list
                for (let i=0; i<closedList.length; i++) {
                    // If in closed list, but new path has a lower g cost,
                    // remove the node from closed list, to be added to the
                    // open list later
                    if (isEqualArray(closedList[i].coords, neighbourCoords)) {
                        if (closedList[i].g >= travelled) {
                            closedList.splice(i, 1);
                        } else {
                            inClosed = true;
                        }
                        break;
                    }
                }
            }

            // If current neighbour is neither in the open list or the
            // closed list, add it to the open list, ensuring that the list
            // remains sorted with lowest f costs at the start.
            if (!inOpen && !inClosed) {
                let neighbour = map[neighbourCoords[0]][neighbourCoords[1]];
                neighbour.parent = currentNode;
                neighbour.g = travelled;
                neighbour.f = travelled + pythagoras(neighbourCoords, finishCoords);
                if (openList.length === 0) {
                    openList.push(neighbour);
                }

                let oLength = openList.length;
                for (let i=0; i<oLength; i++) {
                    if (!openList[i] || openList[i].f > travelled + pythagoras(neighbourCoords, finishCoords)) {
                        openList.splice(i, 0, neighbour);
                        break;
                    } else if (i === oLength - 1) {
                        openList.push(neighbour);
                        break;
                    }
                }
            }
        }
        // Add current node to closed list
        closedList.push(currentNode);
    }

    // If current node is the finish node, solution is found!
    // If not, then there is no valid path between the two nodes.
    if (isEqualArray(currentNode.coords, finishCoords)) {
        let parent = currentNode.parent;
        while (parent) {
            parent.fill = "green";
            parent = parent.parent;
        }

        redrawCanvas();
    } else {
        alert("No solution found!");
    }
}