import { Player } from "./player";

export class Game {
    constructor() {
        this.player = new Player("Player 1", true);
        this.cpu = new Player("CPU");
    }
    setPlayer(name) {
        this.player = new Player(name, true);
    }
}
