// Elements used by this script
const searchDiv = document.getElementById("search-area");
const clearButton = document.getElementById("clear-map");
const startButton = document.getElementById("start-search");
const instructions = document.getElementById("instructions");

// Stages of drawing a map for the algorithm - modifying walls, drawing
// start and finish.
const stages = [startModify, setStart, setFinish];
const text = ["Draw a map", "Select start node", "Select finish node"];
let currentStage = 0;

// Constants dictating size of the map
const rowNum = 20;
const colNum = 20;
const boxSize = 100 / colNum;

// Create map as an empty array, and populate that with empty arrays
let map = new Array(rowNum);

for (let i=0; i<map.length; i++) {
    map[i] = new Array(colNum);
}

// Calculate index of node from its coordinates (nodes are all stored as
// children of searchDiv in a 1D array
function calculateChildNum(coords) {
    return coords[0] * colNum + coords[1];
}

// Controls the stage of the program
function advanceStage() {
    // Advance stage and change eventListeners on the nodes.
    currentStage++;

    instructions.innerText = text[currentStage];

    clearButton.classList.add("hidden");
    startButton.classList.add("hidden");

    for (let node of searchDiv.children) {
        node.removeEventListener("mousedown", stages[currentStage-1]);
        node.addEventListener("mousedown", stages[currentStage], false);
    }
}

function clearWall(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;

    currentNode.style.backgroundColor = null;
    map[currentNode.dataset.y][currentNode.dataset.x] = null;
}

function setWall(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;
    currentNode.style.backgroundColor = "black";
    map[currentNode.dataset.y][currentNode.dataset.x] = {wall: true};
}

// Detects which mouse button is pressed, and sets eventListener for
// mouseover accordingly, to allow the user to move their mouse like a pen
// to draw the map.
function startModify(event) {
    event.preventDefault(); // Prevent dragging the divs

    // Set wall if left mouse, clear if right
    if (event.button === 0) {
        // Draw wall at start point (mouseover only detects mouse entering element)
        let currentNode = event.currentTarget;
        currentNode.style.backgroundColor = "black";
        map[currentNode.dataset.y][currentNode.dataset.x] = {wall: true};

        for (let node of searchDiv.children) {
            node.addEventListener("mouseover", setWall, false);
        }
    } else if (event.button === 2) {
        // Clear wall at start point (mouseover only detects mouse entering element)
        let currentNode = event.currentTarget;
        currentNode.style.backgroundColor = null;
        map[currentNode.dataset.y][currentNode.dataset.x] = null;

        for (let node of searchDiv.children) {
            node.addEventListener("mouseover", clearWall, false);
        }
    }

    window.addEventListener("mouseup", stopModify);
    return false;
}

// Clears eventListeners
function stopModify(event) {
    if (event.button === 0) {
        for (let node of searchDiv.children) {
            node.removeEventListener("mouseover", setWall, false);
        }
    } else if (event.button === 2) {
        for (let node of searchDiv.children) {
            node.removeEventListener("mouseover", clearWall, false);
        }
    }

    window.removeEventListener("mouseup", stopModify);
}

function setFinish(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;
    let nodeData = map[currentNode.dataset.y][currentNode.dataset.x];

    // If node is empty
    if (!nodeData) {
        currentNode.style.backgroundColor = "red";
        map[currentNode.dataset.y][currentNode.dataset.x] = {finish: true};

        // 0 second timeout to ensure that the background colour of node is
        // set before search starts.
        window.setTimeout(search, 0);
    }
}

function setStart(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;
    let nodeData = map[currentNode.dataset.y][currentNode.dataset.x];

    if (!nodeData) {
        currentNode.style.backgroundColor = "green";
        map[currentNode.dataset.y][currentNode.dataset.x] = {start: true};
        advanceStage();
    }
}


// Resets the map to have no walls
function clearMap() {
    for (let node of searchDiv.children) {
        map[node.dataset.y][node.dataset.x] = null;
        node.style.backgroundColor = null;
    }
}

// Draws the map onto the webpage
function drawGrid() {
    for (let i=0; i<map.length; i++) {
        for (let j=0; j<map[i].length; j++) {
            let node = document.createElement("div");
            node.classList.add("node");
            node.dataset.x = j;
            node.dataset.y = i;

            node.style.width = boxSize + "%";
            node.style.height = boxSize + "%";

            node.addEventListener("mousedown", startModify, false);
            // Prevent context menu showing when clearing walls
            node.addEventListener("contextmenu", function(event) {
                event.preventDefault();
                return false;
            }, false);

            searchDiv.appendChild(node);
        }
    }
}

function pythagoras(node, finish) {
    return Math.sqrt((finish[1] - node[1]) ** 2 + (finish[0] - node[0]) ** 2)
}

// Check if coordinates are equal (arr1 === arr2 checks references, not content)
function isEqualArray(arr1, arr2) {
    return arr1[0] === arr2[0] && arr1[1] === arr2[1];
}

// Check if coordinates are invalid due to being out-of-bounds
function invalidCoords(coords) {
     return coords[0] < 0 || coords[0] >= rowNum || coords[1] < 0 || coords[1] >= colNum;
}

function search() {
    for (let node of searchDiv.children) {
        node.removeEventListener("mousedown", stages[currentStage]);
    }

    // COORDS ARE [Y, X]
    let startCoords;
    let finishCoords;

    // Iterate through the map and find start/finish coords
    for (let i=0; i<rowNum; i++) {
        for (let j=0; j<colNum; j++) {
            if (map[i][j]) {
                if (map[i][j].start) {
                    startCoords = [i, j];
                } else if (map[i][j].finish) {
                    finishCoords = [i, j];
                }
            }
        }
    }

    // Initialise open list with just starting node
    let openList = [{parent: null, coords: startCoords, g: 0, f: pythagoras(startCoords, finishCoords)}];
    let closedList = [];
    let currentNode;

    while (openList.length > 0) {
        // Remove node with lowest f-cost from the openList, and set as current
        currentNode = openList.shift();

        // If current node is finish, break loop
        if (isEqualArray(currentNode.coords, finishCoords)) {
            break;
        }

        // Check every neighbour of the current node
        for (let neighbour of [[1, 0], [1, 1], [0, 1], [-1, 1],
                                [-1, 0], [-1, -1], [0, -1], [1, -1]]) {
            let neighbourCoords = [currentNode.coords[0] + neighbour[0],
                                     currentNode.coords[1] + neighbour[1]];

            // If the coords are invalid, or the current neighbour is a
            // wall, skip
            if (invalidCoords(neighbourCoords) || map[neighbourCoords[0]][neighbourCoords[1]] &&
                    map[neighbourCoords[0]][neighbourCoords[1]].wall) {
                continue;
            }

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
                if (openList.length === 0) {
                    openList.push({parent: currentNode, coords: neighbourCoords,
                        g: travelled, f: travelled + pythagoras(neighbourCoords, finishCoords)});
                }

                let oLength = openList.length;
                for (let i=0; i<oLength; i++) {
                    if (!openList[i] || openList[i].f > travelled + pythagoras(neighbourCoords, finishCoords)) {
                        openList.splice(i, 0,
                            {parent: currentNode, coords: neighbourCoords,
                                    g: travelled, f: travelled + pythagoras(neighbourCoords, finishCoords)});
                        break;
                    } else if (i === oLength - 1) {
                        openList.push({parent: currentNode, coords: neighbourCoords,
                            g: travelled, f: travelled + pythagoras(neighbourCoords, finishCoords)});
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
            searchDiv.children[calculateChildNum(parent.coords)].style.backgroundColor = "green";
            parent = parent.parent;
        }
    } else {
        alert("No solution found!");
    }
}



window.addEventListener("load", drawGrid, false);
clearButton.addEventListener("click", clearMap, false);
startButton.addEventListener("click", advanceStage, false);