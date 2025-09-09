import { createPlayer, Player } from "../src/modules/player";
describe("Player creation methods test", () => {
    const defaultBoard = {
        A: [null, null, null, null, null, null, null, null, null, null],
        B: [null, null, null, null, null, null, null, null, null, null],
        C: [null, null, null, null, null, null, null, null, null, null],
        D: [null, null, null, null, null, null, null, null, null, null],
        E: [null, null, null, null, null, null, null, null, null, null],
        F: [null, null, null, null, null, null, null, null, null, null],
        G: [null, null, null, null, null, null, null, null, null, null],
        H: [null, null, null, null, null, null, null, null, null, null],
        I: [null, null, null, null, null, null, null, null, null, null],
        J: [null, null, null, null, null, null, null, null, null, null],
    };
    beforeEach(() => {
        player = createPlayer("Player 1");
    });

    test("Check player name", () => {
        expect(player.name).toBe("Player 1");
    });
    test("Check if player has game board", () => {
        expect(player.board).toBeDefined();
    });
    test("Check the board is empty at the start", () => {
        expect(player.board.getBoard()).toEqual(defaultBoard);
    });
    test("If player end turns, opponents turn begin", () => {
        let player1 = new Player("Player 1", true);
        let player2 = new Player("Player 2", false);
        player1.endTurn(player2);
        expect(player1.checkTurn()).toBe(false);
        expect(player2.checkTurn()).toBe(true);
    });
});
