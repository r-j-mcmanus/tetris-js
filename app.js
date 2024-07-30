const Tetromino = Object.freeze({
    I: 0,
    O: 1,
    T: 2,
    L: 3,
    J: 4,
    S: 5,
    Z: 6,
});

const Colors = Object.freeze({
    0: 'red',
    1: 'blue',
    2: 'yellow',
    3: 'green',
    4: 'pink',
    5: 'purple',
    6: 'orange',
});

const cellBackgroundColor = 'gray'

const numberOfTetrominos = 7
const numberOfColors = 7

function getRandomTetromino() {
    return Math.floor(Math.random() * numberOfTetrominos);
}

function getRandomColor() {
    return Colors[Math.floor(Math.random() * numberOfColors)];
}

function init() {
    const gameGrid = document.querySelector('.grid-container');
    
    var columns = window.getComputedStyle(gameGrid).gridTemplateColumns.split(' ').length;
    var rows = window.getComputedStyle(gameGrid).gridTemplateRows.split(' ').length;

    for(i=0; i < columns * rows; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        gameGrid.appendChild(cell);
    }

    const nextGrid = document.querySelector('.next-tetromino-grid-container');
    
    columns = window.getComputedStyle(nextGrid).gridTemplateColumns.split(' ').length;
    rows = window.getComputedStyle(nextGrid).gridTemplateRows.split(' ').length;

    for(i=0; i < columns * rows; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        nextGrid.appendChild(cell);
    }

    const startingCol = 3

    drawL(0, 0, nextGrid, getRandomColor(), 0);
    drawL(startingCol, 0, gameGrid, getRandomColor(), 0);
}

function drawCell(x, y, grid, color){
    const columns = window.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const rows = window.getComputedStyle(grid).gridTemplateRows.split(' ').length;

    const cells = Array.from(grid.querySelectorAll('.grid-item'));

    if (x < columns && y < rows) {
        const cellIndex = x + y * columns;
        cells[cellIndex].style.backgroundColor = color;
    }
    else {
        console.error('x or y is out of grid bounds');
    }
}

function drawL(x, y, grid, color, rotation) {
    if(rotation == 0 | rotation == 2){
        drawCell(x, y, grid, color)
        drawCell(x+1, y, grid, color)
        drawCell(x+2, y, grid, color)
        drawCell(x+3, y, grid, color)
    }
    if(rotation == 1 | rotation == 3){
        drawCell(x, y, grid, color)
        drawCell(x, y+1, grid, color)
        drawCell(x, y+2, grid, color)
        drawCell(x, y+3, grid, color)
    }
}

let currentX = 3
let currentY = 0
let currentColor = Colors[0]

function moveActiveTetromino(){
    const gameGrid = document.querySelector('.grid-container');
    const rows = window.getComputedStyle(gameGrid).gridTemplateRows.split(' ').length;

    drawL(currentX, currentY, gameGrid, cellBackgroundColor, 0);
    currentY = Math.min(currentY + 1, rows-1)
    drawL(currentX, currentY, gameGrid, getRandomColor(), 0);
}

init()
const intervalId = setInterval(moveActiveTetromino, 1000);