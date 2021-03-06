// Elements used by all scripts
const mapCanvas = document.getElementById("maze-area");
const ctx = mapCanvas.getContext("2d");

const startButton = document.getElementById("start-search");
const generateButton = document.getElementById("generate-maze");
const screenshotButton = document.getElementById("save-png");

const sizeInput = document.getElementById("map-size");
const errorText = document.getElementById("error-text");

// Constants dictating size of the map
let rowNum;
let colNum;
let map;

function initialiseMap() {
    colNum = rowNum = parseInt(sizeInput.children[1].value);

    // Map size below 2 will only have 1 node. Not enough for start and finish.
    if (2 >  colNum) {
        errorText.innerText = "Map size too small. Must be at least 2.";
        return;
    }

    // Create map as an empty array, and populate that with empty arrays
    map = new Array(colNum);

    for (let i=0; i<map.length; i++) {
        map[i] = new Array(rowNum);
    }

    sizeInput.style.display = "none";

    try {
        generateMaze();
    } catch(e) {
        // In case the map size is such that a recursion error is thrown
        map = [];
        redrawCanvas();
        sizeInput.style.display = null;

        // Inform the user of the error, and how to resolve it
        errorText.innerText = "An error occurred while generating the map." +
            " Try again, or try a smaller value for side length.";

        /* Remove event listeners to prevent the user from starting a search
         in an empty maze (will soft-lock the application).
         */
        startButton.removeEventListener("click", initAStar);
        screenshotButton.removeEventListener("click", savePNG);
    }
}

// Save a screenshot of the map as a png
function savePNG() {
    const link = document.createElement('a');

    for (let col of map) {
        for (let node of col) {
            if (node.fill === "green") {
                node.fill = "white";
            }
        }
    }

    redrawCanvas();

    link.download = 'map.png';
    link.href = mapCanvas.toDataURL();
    link.click();

    for (let col of map) {
        for (let node of col) {
            if (node.fill === "white") {
                node.fill = "green";
            }
        }
    }

    redrawCanvas();

    link.download = 'map-solution.png';
    link.href = mapCanvas.toDataURL();
    link.click();
    link.remove();
}

// Functions that can be used by all scripts
// Check if coordinates are equal (arr1 === arr2 checks references, not content)
function isEqualArray(arr1, arr2) {
    return arr1[0] === arr2[0] && arr1[1] === arr2[1];
}

// Check if coordinates are invalid due to being out-of-bounds
function invalidCoords(coords) {
    return coords[0] < 0 || coords[0] >= colNum || coords[1] < 0 || coords[1] >= rowNum;
}

// Returns a random integer between two values
function randInt(lower, upper) {
    return lower + Math.floor(Math.random() * (upper - lower));
}

// Selects and returns a random element from a given array
function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Adds two coordinates together, and returns the result
function addCoords(coord1, coord2) {
    return [coord1[0] + coord2[0], coord1[1] + coord2[1]];
}

function pythagoras(node, finish) {
    return Math.sqrt((finish[1] - node[1]) ** 2 + (finish[0] - node[0]) ** 2)
}

// Adding event listeners
generateButton.addEventListener("click", initialiseMap, false);