// for rotations see 
// https://tetris.wiki/Original_Rotation_System

var activeTetrominoContainer = null
var gameGrid = null
const cellBackgroundColor = 'gray'
const numberOfTetrominos = 7
const numberOfColors = 7
var fallDelta = 500

// data describing the tetrominos
const ITetrominoData = Object.freeze({
    positions: [
        [[0,1], [1,1], [2,1], [3,1]],
        [[2,0], [2,1], [2,2], [2,3]],
    ],
    offset: [2,1],
})

const OTetrominoData = Object.freeze({
    positions: [
        [[1,1], [1,2], [2,1], [2,2]],
    ],
    offset: [2,1],
})

const TTetrominoData = Object.freeze({
    positions: [
        [[0,1], [1,1], [2,1], [1,2]],
        [[1,0], [1,1], [1,2], [2,1]],
        [[0,1], [1,1], [2,1], [1,0]],
        [[1,0], [1,1], [1,2], [0,1]],
    ],
    offset: [1,1],
})

const LTetrominoData = Object.freeze({
    positions: [
        [[0,1], [1,1], [2,1], [0,2]],
        [[1,0], [1,1], [1,2], [2,2]],
        [[0,1], [1,1], [2,1], [2,0]],
        [[1,0], [1,1], [1,2], [0,0]],
    ],
    offset: [1,1],
})

const JTetrominoData = Object.freeze({
    positions: [
        [[0,1], [1,1], [2,1], [2,2]],
        [[1,0], [1,1], [1,2], [2,0]],
        [[0,1], [1,1], [2,1], [0,0]],
        [[1,0], [1,1], [1,2], [0,2]],
    ],
    offset: [1,1],
})

const STetrominoData = Object.freeze({
    positions: [
        [[1,1], [2,1], [0,2], [1,2]],
        [[1,0], [1,1], [2,1], [2,2]],
    ],
    offset: [1,1],
})

const ZTetrominoData = Object.freeze({
    positions: [
        [[0,1], [1,1], [1,2], [2,2]],
        [[2,0], [1,1], [2,1], [1,2]],
    ],
    offset: [1,1],
})

const Colors = Object.freeze({
    0: 'red',
    1: 'blue',
    2: 'yellow',
    3: 'green',
    4: 'pink',
    5: 'purple',
    6: 'orange',
});

const TetrominoData = Object.freeze({
    0: ITetrominoData,
    1: OTetrominoData,
    2: TTetrominoData,
    3: LTetrominoData,
    4: JTetrominoData,
    5: STetrominoData,
    6: ZTetrominoData,
});

const Tetrominos = Object.freeze({
    I: 0,
    O: 1,
    T: 2,
    L: 3,
    J: 4,
    S: 5,
    Z: 6,
});

class GameGrid {
    constructor() {
        this.gridContainer = document.querySelector('.grid-container');
        this.width = window.getComputedStyle(this.gridContainer).gridTemplateColumns.split(' ').length;
        this.height = window.getComputedStyle(this.gridContainer).gridTemplateRows.split(' ').length;
        this.cells = Array(this.height * this.width).fill(false);
    }

    fillCell(x, y) {
        this.cells[x + y * this.width] = true;
    }

    emptyCell(x, y) {
        this.cells[x + y * this.width] = false;
    }

    checkCollision(x, y) {
        // check against bounds of the grid
        if(x < 0 || x >= this.width || y < 0 || y >= this.height){
            return true;
        }
        // check against cells
        if(this.cells[x + y * this.width]){
            return true;
        }
        return false;
    }

    isRowFull(rowIndex) {
        const rowCells = this.cells.slice(rowIndex * this.width, (rowIndex + 1) * this.width);
        return rowCells.every(x => x === true);
    }

    removeRows(rows){
        rows = toUniqueArray(rows)
        rows.sort()
        for(let rowIndex of rows){
            this.removeRow(rowIndex)
        }
    }

    removeRow(rowIndex){
        this.cells.slice(0, rowIndex * this.width)
    }
}

class TetrominoContainer {
    constructor(tetrominoId, x, y, color) {
        this.tetrominoData = TetrominoData[tetrominoId];
        const offset = this.tetrominoData.offset;
        this.x = x - offset[0];
        this.y = y - offset[1]; 
        this.color = color;
        this.rotation = 0;
    }

    rotate(delta){
        const n = this.tetrominoData.positions.length;
        // mod a negative number is negative, this fixes that
        this.rotation = (((this.rotation + delta) % n) + n) % n;
    }

    *yieldAbsoluteCellPositions(){
        for(i=0; i<4; i++) {
            yield [
                this.tetrominoData.positions[this.rotation][i][0] + this.x,
                this.tetrominoData.positions[this.rotation][i][1] + this.y
            ];
        }
    }
}

function getRandomTetromino() {
    return Math.floor(Math.random() * numberOfTetrominos);
}

function getRandomColor() {
    return Colors[Math.floor(Math.random() * numberOfColors)];
}

function init() {
    // the objects that define the state of the grid
    activeTetrominoContainer = new TetrominoContainer(getRandomTetromino(), 5, 0, getRandomColor());
    gameGrid = new GameGrid();

    // make the grid reflect the initial conditions
    const gameColumns = gameGrid.height;
    const gameRows = gameGrid.width;

    for(i=0; i < gameColumns * gameRows; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        gameGrid.gridContainer.appendChild(cell);
    }

    drawTetrominoContainer(gameGrid, activeTetrominoContainer);

    // the objects that define the state of the next object grid
    const nextGrid = document.querySelector('.next-tetromino-grid-container');
    
    const nextColumns = window.getComputedStyle(nextGrid).gridTemplateColumns.split(' ').length;
    const nextRows = window.getComputedStyle(nextGrid).gridTemplateRows.split(' ').length;

    // make the next object grid reflect the initial conditions
    for(i=0; i < nextColumns * nextRows; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        nextGrid.appendChild(cell);
    }

}

function drawTetrominoContainer(grid, tetrominoContainer) {
    const gridDom = grid.gridContainer;
    for(let pos of tetrominoContainer.yieldAbsoluteCellPositions()){
        const color = tetrominoContainer.color;
        drawCell(pos[0], pos[1], gridDom, color);
    }
}

function undrawTetrominoContainer(grid, tetrominoContainer) {
    const gridDom = grid.gridContainer;
    for(let pos of tetrominoContainer.yieldAbsoluteCellPositions()){
        const color = 'grey';
        drawCell(pos[0], pos[1], gridDom, color);
    }
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
        console.error([x, y, columns, rows]);
    }
}

function hasCollision(tetrominoContainer, gameGrid){
    for(let pos of tetrominoContainer.yieldAbsoluteCellPositions()){
        if(gameGrid.checkCollision(pos[0], pos[1])) {
            return true
        }
    }
    return false
}

function fall(){
    activeTetrominoContainer.y += 1
    if(hasCollision(activeTetrominoContainer, gameGrid)){
        activeTetrominoContainer.y -= 1
        fillGridCellsWithTetromino(activeTetrominoContainer, gameGrid)
        checkFullRows(activeTetrominoContainer, gameGrid)
        // check for end game
        activeTetrominoContainer = new TetrominoContainer(getRandomTetromino(), 5, 0, getRandomColor())
    } else {
        activeTetrominoContainer.y -= 1
        undrawTetrominoContainer(gameGrid, activeTetrominoContainer)
        activeTetrominoContainer.y += 1
    }
    drawTetrominoContainer(gameGrid, activeTetrominoContainer)
}

function checkFullRows(activeTetrominoContainer, gameGrid){
    let filledRows = []
    for(let cell of activeTetrominoContainer.yieldAbsoluteCellPositions()){
        let row = cell[1]
        if(gameGrid.isRowFull(row)){
            filledRows.appendChild(row)
        }
    }
    gameGrid.removeRows(filledRows)
}

function xMove(delta){
    activeTetrominoContainer.x += delta
    if(hasCollision(activeTetrominoContainer, gameGrid)){
        activeTetrominoContainer.x -= delta
    } else {
        activeTetrominoContainer.x -= delta
        undrawTetrominoContainer(gameGrid, activeTetrominoContainer)
        activeTetrominoContainer.x += delta
        drawTetrominoContainer(gameGrid, activeTetrominoContainer)
    }
}

function rotate(){
    activeTetrominoContainer.rotate(1)
    if(hasCollision(activeTetrominoContainer, gameGrid)){
        activeTetrominoContainer.rotate(-1)
    } else {
        activeTetrominoContainer.rotate(-1)
        undrawTetrominoContainer(gameGrid, activeTetrominoContainer)
        activeTetrominoContainer.rotate(1)
        drawTetrominoContainer(gameGrid, activeTetrominoContainer)
    }
}

function fillGridCellsWithTetromino(tetrominoContainer, gameGrid){
    for(let pos of tetrominoContainer.yieldAbsoluteCellPositions()){
        gameGrid.fillCell(pos[0], pos[1])
    }
}


init()
const intervalId = setInterval(fall, fallDelta);

document.addEventListener('keydown', function(event) {
    // You can use event.key to get the value of the pressed key
    if(event.key == 'ArrowUp'){
        rotate()
    }
    if(event.key == 'ArrowLeft'){
        xMove(-1)
    }
    if(event.key == 'ArrowRight'){
        xMove(1)
    }
});


function toUniqueArray(mArray){
    // this is used on arrays of max len 4 so big O doesnt matter 
    let output = []
    for(let i of mArray){
        if(!output.includes(i)){
            output.push(i)
        }
    }
    return output
}