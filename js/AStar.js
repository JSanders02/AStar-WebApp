let globals = {
    searchDiv: document.getElementById("search-area"),
    clearButton: document.getElementById("clear-map"),
    rowNum: 20,
    colNum: 20,
    // Use a getter as this.colNum does not work directly inside an object literal.
    get boxSize() {
        return 100 / this.colNum;
    }
}

function setWall(event) {
    // Select node that was clicked
    let currentNode = event.currentTarget;

    currentNode.style.backgroundColor = "black";
    currentNode.dataset.wall = true;
}

function clearWall(event) {
    // Prevent context menu (Default action of event)
    event.preventDefault();
    // Select node that was clicked
    let currentNode = event.currentTarget;

    currentNode.style.backgroundColor = null;
    currentNode.dataset.wall = false;

    // Return false to prevent context menu showing
    return false
}

function clearMap() {
    for (let node of globals.searchDiv.children) {
        node.dataset.wall = false;
        node.style.backgroundColor = null;
    }
}

function drawGrid() {
    for (let i=0; i<globals.rowNum; i++) {
        for (let j=0; j<globals.colNum; j++) {
            let node = document.createElement("div");
            node.classList.add("node");
            node.dataset.x = j;
            node.dataset.y = i;
            node.dataset.wall = false;

            node.style.width = globals.boxSize + "%";
            node.style.height = globals.boxSize + "%";
            node.style.outline = "1px solid black";

            node.addEventListener("click", setWall, false);
            node.addEventListener("contextmenu", clearWall, false);

            globals.searchDiv.appendChild(node);
        }
    }
}

window.addEventListener("load", drawGrid, false);
globals.clearButton.addEventListener("click", clearMap, false);