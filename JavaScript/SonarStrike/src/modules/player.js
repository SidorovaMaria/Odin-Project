const { createGameBoard } = require("./gameBoard");

class Player {
    constructor(name = "Player 1", mode = "player") {
        this.name = name;
        this.mode = mode; //player or cpu
        this.board = createGameBoard();
        this.turn = true;
    }
    checkTurn() {
        return this.turn;
    }
    switchTurn() {
        this.turn = !this.turn;
    }
    endTurn() {
        this.turn = false;
    }
    hasLost() {
        return this.board.allShipsSunk();
    }
}
export function creaatePlayer(name, mode) {
    return new Player(name, mode);
}
