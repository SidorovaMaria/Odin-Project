const { createGameBoard } = require("./gameBoard");

export class Player {
    constructor(name = "Player 1", startsGame = false) {
        this.name = name;
        this.board = createGameBoard();
        this.turn = startsGame;
    }
    checkTurn() {
        return this.turn;
    }
    switchTurn() {
        this.turn = !this.turn;
    }
    endTurn(opponent) {
        if (!(opponent instanceof Player)) {
            throw new Error("Please provide Opposite Player's Class");
        }
        opponent.switchTurn();
        this.switchTurn();
    }
    hasLost() {
        return this.board.allShipsSunk();
    }
    attack(opponent, coord) {
        if (!(opponent instanceof Player)) {
            throw new Error("Please provide Opposite Player's Class");
        }
        if (!this.turn) {
            throw new Error("It's not your turn!");
        }
        const result = opponent.board.attackResult(coord);
        if (result === "miss") {
            this.endTurn(opponent);
        }
        return result;
    }
}
export function createPlayer(name) {
    return new Player(name);
}
