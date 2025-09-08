const { createShip } = require("./ship");

const BOARD_LETTERS = "ABCDEFGHIJ".split("");

export class GameBoard {
    constructor() {
        this.board = this.setEmptyBoard();
        this.previouslyAttacked = new Set();
        this.hitShots = [];
        this.missedShots = [];
        this.ships = [];
    }
    setEmptyBoard() {
        return Object.fromEntries(BOARD_LETTERS.map((letter) => [letter, Array(10).fill(null)]));
    }

    getBoard() {
        return this.board;
    }
    parseCoordinate(coord) {
        const row = coord[0].toUpperCase();
        const col = parseInt(coord.slice(1), 10) - 1;
        if (!BOARD_LETTERS.includes(row) || col < 0 || col >= 10) {
            throw new Error(`Invalid Coordinates ${coord}`);
        }
        return { row, col };
    }
    stringifyCoord({ row, col }) {
        return `${row}${col + 1}`;
    }
    getCell(coord) {
        const { row, col } = this.parseCoordinate(coord);
        return this.board[row][col];
    }
    setCell(coord, ship) {
        const { row, col } = this.parseCoordinate(coord);
        this.board[row][col] = ship;
    }
    getAdjacentCoords(rowIndex, colIndex) {
        const coord = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                //Skip the cell itself
                if (dr === 0 && dc === 0) continue;

                const r = rowIndex + dr;
                const c = colIndex + dc;
                //Stay in home bounds(0-9  for both row and col
                if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                    coord.push(this.stringifyCoord({ row: BOARD_LETTERS[r], col: c }));
                }
            }
        }
        return coord;
    }
    canPlaceShip(startCoord, ship) {
        const { row, col } = this.parseCoordinate(startCoord);
        const rowIndex = BOARD_LETTERS.indexOf(row);
        for (let i = 0; i < ship.length; i++) {
            let r = rowIndex;
            let c = col;
            ship.isHorizontal() ? (c += i) : (r += i);

            if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;

            const coord = this.stringifyCoord({ row: BOARD_LETTERS[r], col: c });
            if (this.getCell(coord) !== null) return false;

            const adjacentCoords = this.getAdjacentCoords(r, c);
            for (const neighbor of adjacentCoords) {
                if (this.getCell(neighbor) !== null) return false;
            }
        }
        return true;
    }
    placeShip(startCoord, ship) {
        if (!this.canPlaceShip(startCoord, ship)) {
            throw new Error("Invalid placement.");
        }
        const { row, col } = this.parseCoordinate(startCoord);
        const rowIndex = BOARD_LETTERS.indexOf(row);
        const position = [];
        for (let i = 0; i < ship.length; i++) {
            let r = rowIndex;
            let c = col;
            ship.isHorizontal() ? (c += i) : (r += i);
            const coord = this.stringifyCoord({ row: BOARD_LETTERS[r], col: c });
            position.push(coord);
        }

        //Place the ship in the coordinate
        position.forEach((coord) => this.setCell(coord, ship));
        this.ships.push(ship);
        return position;
    }
    placeShipRandomly(ship) {
        // Avoidinhg Unbounded recursion
        const MAX_ATTEMPTS = 500;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
            ship.setOrientation(orientation);

            const maxRowIndex = orientation === "horizontal" ? 9 : 10 - ship.length;
            const maxColIndex = orientation === "horizontal" ? 10 - ship.length : 9;
            const rowIndex = Math.floor(Math.random() * (maxRowIndex + 1));
            const colIndex = Math.floor(Math.random() * (maxColIndex + 1));
            const startCoord = this.stringifyCoord({ row: BOARD_LETTERS[rowIndex], col: colIndex });
            try {
                return this.placeShip(startCoord, ship);
            } catch (error) {
                return this.placeShipRandomly(ship);
            }
        }
        throw new Error("Failed to place ship after maximum attempts");
    }
    placeAllShipsRandom() {
        const shipsToPlace = [5, 4, 3, 3, 2];
        shipsToPlace.forEach((length) => {
            const ship = createShip(length);
            this.placeShipRandomly(ship);
        });
    }
    resetBoard() {
        this.board = this.setEmptyBoard();
        this.previouslyAttacked.clear();
        this.hitShots = [];
        this.missedShots = [];
        this.ships = [];
    }
    receivedAttack(coord) {
        if (this.previouslyAttacked.has(coord)) {
            throw new Error(`Coordinate ${coord} has been already attacked`);
        }
        const { row, col } = this.parseCoordinate(coord);
        const target = this.board[row][col];
        this.previouslyAttacked.add(coord);
        if (target) {
            this.hitShots.push(coord);
            target.hit();
            return "hit";
        } else {
            this.missedShots.push(coord);
            return "miss";
        }
    }
    attckResult(coord) {
        const result = this.receivedAttack(coord);
        if (result === "hit") {
            const ship = this.getCell(coord);
            if (ship.isSunk()) return "sunk";
        }
        return result;
    }
    getMissedShots() {
        return this.missedShots;
    }
    getHitShots() {
        return this.hitShots;
    }
    allShipsSunk() {
        return this.ships.every((ship) => ship.isSunk());
    }
    getAvailableShots() {
        const shots = [];
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                const coord = this.stringifyCoord({ row: BOARD_LETTERS[r], col: c });
                if (!this.previouslyAttacked.has(coord)) {
                    shots.push(coord);
                }
            }
        }
        return shots;
    }
    getRemainingShips() {
        return this.ships.filter((ship) => !ship.isSunk()).length;
    }
}
const playerBoard = new GameBoard();
const shipOne = createShip(4);
// playerBoard.placeAllShipsRandom();
// playerBoard.receivedAttack("A7");
// console.log(playerBoard.getBoard());
// console.log(playerBoard.allShipsSunk());
export function createGameBoard() {
    return new GameBoard();
}
