// Elements used by all scripts
const mapCanvas = document.getElementById("maze-area");
const ctx = mapCanvas.getContext("2d");

const startButton = document.getElementById("start-search");
const generateButton = document.getElementById("generate-maze");

// Constants dictating size of the map
const rowNum = 20;
const colNum = 20;

// Create map as an empty array, and populate that with empty arrays
let map = new Array(colNum);

for (let i=0; i<map.length; i++) {
    map[i] = new Array(rowNum);
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