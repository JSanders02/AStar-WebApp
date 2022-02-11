
 const searchDiv = document.getElementById("search-area");
 const clearButton = document.getElementById("clear-map");
 const startButton = document.getElementById("start-search");
 const instructions = document.getElementById("instructions");

 const stages = [startModify, setStart, setFinish];
 const text = ["Draw a map", "Select start node", "Select finish node"];
 let currentStage = 0;

 const rowNum = 20;
 const colNum = 20;
 const boxSize = 100 / colNum;

 let map = new Array(rowNum);

 for (let i=0; i<map.length; i++) {
     map[i] = new Array(colNum);
 }

function colourNode(index, colour) {
    searchDiv.children[index].style.backgroundColor = colour;
    searchDiv.children[index].offsetHeight;
}

function calculateChildNum(coords) {
    return coords[0] * colNum + coords[1];
}

function advanceStage() {
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

function startModify(event) {
    event.preventDefault();

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

function clearMap() {
    for (let node of searchDiv.children) {
        map[node.dataset.y][node.dataset.x] = null;
        node.style.backgroundColor = null;
    }
}

function drawGrid() {
    for (let i=0; i<rowNum; i++) {
        for (let j=0; j<colNum; j++) {
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

function isEqualArray(arr1, arr2) {
    return arr1[0] === arr2[0] && arr1[1] === arr2[1];
}

function invalidCoords(coords) {
     return coords[0] < 0 || coords[0] >= rowNum || coords[1] < 0 || coords[1] > colNum;
}

function search() {
    for (let node of searchDiv.children) {
        node.removeEventListener("mousedown", stages[currentStage]);
    }

    // COORDS ARE [Y, X]
    let startCoords;
    let finishCoords;
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

    let openList = [{parent: null, coords: startCoords, g: 0, f: pythagoras(startCoords, finishCoords)}];
    let closedList = [];
    let currentNode;

    while (openList.length > 0) {
        currentNode = openList.shift();

        if (isEqualArray(currentNode.coords, finishCoords)) {
            break;
        } else {
            for (let neighbour of [[1, 0], [1, 1], [0, 1], [-1, 1],
                                    [-1, 0], [-1, -1], [0, -1], [1, -1]]) {
                let neighbourCoords = [currentNode.coords[0] + neighbour[0],
                                         currentNode.coords[1] + neighbour[1]];

                if (invalidCoords(neighbourCoords) || map[neighbourCoords[0]][neighbourCoords[1]] &&
                        map[neighbourCoords[0]][neighbourCoords[1]].wall) {
                    continue;
                }

                let travelled = currentNode.g + pythagoras(currentNode.coords, neighbourCoords);

                let inOpen;
                let inClosed;
                for (let node of openList) {
                    if (isEqualArray(node.coords, neighbourCoords)) {
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
                    for (let i=0; i<closedList.length; i++) {
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
        }
        closedList.push(currentNode);
    }

    if (isEqualArray(currentNode.coords, finishCoords)) {
        let parent = currentNode.parent;
        while (!isEqualArray(parent.coords, finishCoords)) {
            colourNode(calculateChildNum(parent.coords), "green");
            console.log(parent.coords);
            parent = parent.parent;
        }
    }
}



window.addEventListener("load", drawGrid, false);
clearButton.addEventListener("click", clearMap, false);
startButton.addEventListener("click", advanceStage, false);