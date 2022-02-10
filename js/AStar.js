
 const searchDiv = document.getElementById("search-area");
 const clearButton = document.getElementById("clear-map");
 const startButton = document.getElementById("start-search");
 const instructions = document.getElementById("instructions");

 const stages = [setWall, setStart, setFinish];
 const text = ["Draw a map", "Select start node", "Select finish node"];
 let currentStage = 0;

 const rowNum = 20;
 const colNum = 20;
 const boxSize = 100 / colNum;

 let map = new Array(rowNum);

 for (let i=0; i<map.length; i++) {
     map[i] = new Array(colNum);
 }

function advanceStage() {
    currentStage++;

    instructions.innerText = text[currentStage];

    clearButton.classList.add("hidden");
    startButton.classList.add("hidden");

    for (let node of searchDiv.children) {
        node.removeEventListener("contextmenu", clearWall);
        node.removeEventListener("click", stages[currentStage-1]);
        node.addEventListener("click", stages[currentStage], false);
    }
}

function setWall(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;
    currentNode.style.backgroundColor = "black";
    map[currentNode.dataset.y][currentNode.dataset.x] = {wall: true};
}

function clearWall(event) {
    // Prevent context menu (Default action of event)
    event.preventDefault();
    // Select node that was clicked
    let currentNode = event.currentTarget;

    currentNode.style.backgroundColor = null;
    map[currentNode.dataset.y][currentNode.dataset.x] = null;

    // Return false to prevent context menu showing
    return false
}

function setFinish(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;
    let nodeData = map[currentNode.dataset.y][currentNode.dataset.x];

    // If node is empty
    if (!nodeData) {
        currentNode.style.backgroundColor = "red";
        map[currentNode.dataset.y][currentNode.dataset.x] = {finish: true};
        console.log(map);
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

            node.addEventListener("click", setWall, false);
            node.addEventListener("contextmenu", clearWall, false);

            searchDiv.appendChild(node);
        }
    }
}

function search() {
    for (let row of map) {
        for (let node of row) {
            if (node === "start") {
                let startNode = node;
            } else if (node === "finish") {
                let finishNode = node;
            }
        }
    }
}

window.addEventListener("load", drawGrid, false);
clearButton.addEventListener("click", clearMap, false);
startButton.addEventListener("click", advanceStage, false);