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
        this.cells = Array(this.height, this.width).fill(false);
    }

    fillCell(x, y) {
        this.cells[x + y * this.width] = true
    }

    checkCollision(x, y) {
        // check against bounds of the grid
        if(x < 0 || x >= this.width || y < 0 || y >= this.height){
            return true
        }
        // check against cells
        if(this.cells[x + y * this.width]){
            return true
        }
        return false
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
        const n = this.tetrominoData.positions.length
        // mod a negative number is negative, this fixes that
        this.rotation = (((this.rotation + delta) % n) + n) % n
    }

    *getCellPosition(){
        for(i=0; i<4; i ++){
            yield [
                this.x + this.tetrominoData.positions[this.rotation][i][0],
                this.x + this.tetrominoData.positions[this.rotation][i][1],
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
    activeTetrominoContainer = new TetrominoContainer(getRandomTetromino(), 5, 0, getRandomColor())
    gameGrid = new GameGrid()

    // make the grid reflect the initial conditions
    const gameColumns = gameGrid.height
    const gameRows = gameGrid.width

    for(i=0; i < gameColumns * gameRows; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        gameGrid.gridContainer.appendChild(cell);
    }

    drawTetrominoContainer(gameGrid, activeTetrominoContainer)

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
    const gridDom = grid.gridContainer
    const x = tetrominoContainer.x;
    const y = tetrominoContainer.y;
    for(i=0; i < 4; i++){
        const u = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][0];
        const v = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][1];
        const color = tetrominoContainer.color;
        drawCell(x+u, y+v, gridDom, color);
    }
}

function undrawTetrominoContainer(grid, tetrominoContainer) {
    const gridDom = grid.gridContainer
    const x = tetrominoContainer.x;
    const y = tetrominoContainer.y;
    for(i=0; i < 4; i++){
        const u = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][0];
        const v = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][1];
        const color = 'grey';
        drawCell(x+u, y+v, gridDom, color);
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
    const x = tetrominoContainer.x;
    const y = tetrominoContainer.y;
    for(i=0; i<4; i++) {
        const u = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][0];
        const v = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][1];
        if(gameGrid.checkCollision(x+u, y+v)) {
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
        // check for rows to remove
        // check for end game
        activeTetrominoContainer = new TetrominoContainer(getRandomTetromino(), 5, 0, getRandomColor())
    } else {
        activeTetrominoContainer.y -= 1
        undrawTetrominoContainer(gameGrid, activeTetrominoContainer)
        activeTetrominoContainer.y += 1
    }
    drawTetrominoContainer(gameGrid, activeTetrominoContainer)
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
    const x = tetrominoContainer.x;
    const y = tetrominoContainer.y;
    for(i=0; i<4; i++) {
        const u = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][0];
        const v = tetrominoContainer.tetrominoData.positions[tetrominoContainer.rotation][i][1];
        gameGrid.fillCell(x+u, y+v)
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
