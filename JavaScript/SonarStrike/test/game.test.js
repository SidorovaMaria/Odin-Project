import { Game } from "../src/modules/game";
import { Player } from "../src/modules/player";
// Mocks
const mockBoard = () => ({
    getAvailableShots: jest.fn(),
    getHitShots: jest.fn(),
    stringifyCoord: jest.fn(),
    parseCoordinate: jest.fn(),
    resetBoard: jest.fn(),
    placeAllShipsRandom: jest.fn(),
});

const mockPlayer = (name = "Player", isHuman = false) => {
    return {
        name,
        isHuman,
        board: mockBoard(),
        checkTurn: jest.fn(),
        attack: jest.fn(),
    };
};

jest.mock("../src/modules/player", () => {
    return {
        Player: jest.fn((name, isHuman) => mockPlayer(name, isHuman)),
    };
});

describe("Game", () => {
    let game;
    beforeEach(() => {
        game = new Game();
    });

    test("constructor initializes player and cpu", () => {
        expect(game.player.name).toBe("Player 1");
        expect(game.player.isHuman).toBe(true);
        expect(game.cpu.name).toBe("CPU");
        expect(game.cpu.isHuman).toBe(false);
    });

    test("getPlayerName returns player name", () => {
        expect(game.getPlayerName()).toBe("Player 1");
    });

    test("getCpuName returns cpu name", () => {
        expect(game.getCpuName()).toBe("CPU");
    });

    test("setPlayer sets player name and isHuman", () => {
        game.setPlayer("Maria");
        expect(game.player.name).toBe("Maria");
        expect(game.player.isHuman).toBe(true);
    });

    test("initializeGame calls cpu board reset and placeAllShipsRandom", () => {
        game.cpu.board.resetBoard.mockClear();
        game.cpu.board.placeAllShipsRandom.mockClear();
        game.initializeGame();
        expect(game.cpu.board.resetBoard).toHaveBeenCalled();
        expect(game.cpu.board.placeAllShipsRandom).toHaveBeenCalled();
    });

    test("getActivePlayer returns player if it's player's turn", () => {
        game.player.checkTurn.mockReturnValue(true);
        expect(game.getActivePlayer()).toBe(game.player);
    });

    test("getActivePlayer returns cpu if it's not player's turn", () => {
        game.player.checkTurn.mockReturnValue(false);
        expect(game.getActivePlayer()).toBe(game.cpu);
    });

    describe("CPUAttack", () => {
        beforeEach(() => {
            game.cpu.checkTurn.mockReset();
            game.cpu.attack.mockReset();
            game.player.board.getAvailableShots.mockReset();
            game.player.board.getHitShots.mockReset();
            game.pickBestAvailable = jest.fn(() => "A1");
        });

        test("throws error if not cpu's turn", () => {
            game.cpu.checkTurn.mockReturnValue(false);
            expect(() => game.cpuAttack()).toThrow("It's not CPU's turn!");
        });

        test("returns attacks array and stops on miss", () => {
            game.cpu.checkTurn.mockReturnValue(true);
            game.cpu.attack.mockReturnValueOnce("hit").mockReturnValueOnce("miss");
            game.pickBestAvailable.mockReturnValue("A1");
            const result = game.cpuAttack();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[1].result).toBe("miss");
        });

        test("returns winner if all-sunk", () => {
            game.cpu.checkTurn.mockReturnValue(true);
            game.cpu.attack.mockReturnValueOnce("all-sunk");
            game.pickBestAvailable.mockReturnValue("A1");
            const result = game.cpuAttack();
            expect(result.winner).toBe(game.cpu);
            expect(Array.isArray(result.attacks)).toBe(true);
            expect(result.attacks[0].result).toBe("all-sunk");
        });

        test("returns empty array if no available cell", () => {
            game.cpu.checkTurn.mockReturnValue(true);
            game.pickBestAvailable.mockReturnValue(null);
            const result = game.cpuAttack();
            expect(result).toEqual([]);
        });
    });

    describe("pickRandomAvailable", () => {
        test("returns null if no available shots", () => {
            const board = mockBoard();
            board.getAvailableShots.mockReturnValue([]);
            expect(game.pickRandomAvailable(board)).toBeNull();
        });

        test("returns one of available shots", () => {
            const board = mockBoard();
            board.getAvailableShots.mockReturnValue(["A1", "B2", "C3"]);
            const result = game.pickRandomAvailable(board);
            expect(["A1", "B2", "C3"]).toContain(result);
        });
    });

    describe("pickBestAvailable", () => {
        let board;
        beforeEach(() => {
            board = mockBoard();
            board.stringifyCoord.mockImplementation(({ row, col }) => `${row}${col}`);
            board.parseCoordinate.mockImplementation((coord) => {
                // e.g. "B5" => { row: "B", col: 5 }
                return { row: coord[0], col: Number(coord.slice(1)) };
            });
        });

        test("returns null if no available shots", () => {
            board.getAvailableShots.mockReturnValue([]);
            expect(game.pickBestAvailable(board)).toBeNull();
        });

        test("returns random available if no hits", () => {
            board.getAvailableShots.mockReturnValue(["A1", "B2"]);
            board.getHitShots.mockReturnValue([]);
            game.pickRandomAvailable = jest.fn(() => "B2");
            expect(game.pickBestAvailable(board)).toBe("B2");
        });

        test("extends line if last two hits are adjacent", () => {
            board.getAvailableShots.mockReturnValue(["B7"]);
            board.getHitShots.mockReturnValue(["B5", "B6"]);
            board.stringifyCoord.mockReturnValue("B7");
            expect(game.pickBestAvailable(board)).toBe("B7");
        });

        test("picks neighbor if only one hit", () => {
            board.getAvailableShots.mockReturnValue(["C4"]);
            board.getHitShots.mockReturnValue(["C3"]);
            board.stringifyCoord.mockReturnValue("C4");
            expect(game.pickBestAvailable(board)).toBe("C4");
        });

        test("falls back to hunt mode if no neighbors", () => {
            board.getAvailableShots.mockReturnValue(["A1"]);
            board.getHitShots.mockReturnValue(["B2"]);
            game.pickRandomAvailable = jest.fn(() => "A1");
            expect(game.pickBestAvailable(board)).toBe("A1");
        });
    });
});
