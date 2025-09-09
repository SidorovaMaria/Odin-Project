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
}
export function createPlayer(name) {
    return new Player(name);
}
