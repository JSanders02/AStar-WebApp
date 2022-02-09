let globals = {
    searchDiv: document.getElementById("SearchArea"),
    rowNum: 20,
    colNum: 20,
    // Use getter as this.colNum does not work usually inside an object literal.
    get boxSize() {
        return 100 / this.colNum;
    }
}

function drawGrid() {
    for (let i=0; i<globals.rowNum; i++) {
        for (let j=0; j<globals.colNum; j++) {
            let node = document.createElement("div");
            node.classList.add("node");
            node.dataset.x = j;
            node.dataset.y = i;

            node.style.width = globals.boxSize + "%";
            node.style.height = globals.boxSize + "%";
            node.style.outline = "1px solid black";

            globals.searchDiv.appendChild(node);
        }
    }
}

window.addEventListener("load", drawGrid, false);