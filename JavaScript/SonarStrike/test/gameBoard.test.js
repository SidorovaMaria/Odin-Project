import { createShip } from "../src/modules/ship";
import { createGameBoard } from "../src/modules/gameBoard.js";
describe("Funcionaility of the Board Class", () => {
    let board;
    let ship;
    const expectedBoard = {
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
        board = createGameBoard();
        ship = createShip("Destroyer", 3);
    });
    test("Board initializes correctly", () => {
        expect(board.getBoard()).toEqual(expectedBoard);
        expect(board.previouslyAttacked.size).toBe(0);
        expect(board.hitShots).toEqual([]);
        expect(board.missedShots).toEqual([]);
        expect(board.ships).toEqual([]);
    });
    test("Can parse and stringify coordinates correctly", () => {
        expect(board.parseCoordinate("A1")).toEqual({ row: "A", col: 0 });
        expect(board.parseCoordinate("J10")).toEqual({ row: "J", col: 9 });
        expect(board.stringifyCoord({ row: "C", col: 4 })).toBe("C5");
        expect(board.stringifyCoord({ row: "H", col: 9 })).toBe("H10");
        expect(() => board.parseCoordinate("K1")).toThrow("Invalid Coordinates K1");
        expect(() => board.parseCoordinate("A11")).toThrow("Invalid Coordinates A11");
        expect(() => board.parseCoordinate("Z5")).toThrow("Invalid Coordinates Z5");
    });
    test("Can get and set cell values correctly", () => {
        board.setCell("B2", ship);
        expect(board.getCell("B2")).toBe(ship);
        expect(board.getCell("C3")).toBeNull();
        expect(() => board.setCell("K1", ship)).toThrow("Invalid Coordinates K1");
        expect(() => board.getCell("A11")).toThrow("Invalid Coordinates A11");
    });
    test("Can place ships correctly", () => {
        board.placeShip("A1", ship);
        expect(board.getCell("A1")).toBe(ship);
        expect(board.getCell("A2")).toBe(ship);
        expect(board.getCell("A3")).toBe(ship);
        expect(board.ships).toContain(ship);
        expect(() => board.placeShip("A9", ship)).toThrow("Invalid placement");
        ship.chngeOrientation();
        board.placeShip("A9", ship);
        expect(board.getCell("A9")).toBe(ship);
        expect(board.getCell("B9")).toBe(ship);
        expect(board.getCell("C9")).toBe(ship);
    });
    test("Can place ships randomly without overlap", () => {
        const ship1 = createShip("Destroyer", 4);
        const ship2 = createShip("Submarine", 3);
        const pos1 = board.placeShipRandomly(ship1);
        const pos2 = board.placeShipRandomly(ship2);
        const allPositions = [...pos1, ...pos2];
        const uniquePositions = new Set(allPositions);
        expect(uniquePositions.size).toBe(allPositions.length);
        pos1.forEach((coord) => {
            expect(board.getCell(coord)).toBe(ship1);
        });
        pos2.forEach((coord) => {
            expect(board.getCell(coord)).toBe(ship2);
        });
    });

    test("Missed Shot set updates correctly", () => {
        board.receivedAttack("A1");
        expect(board.missedShots).toContain("A1");
        expect(board.hitShots).not.toContain("A1");
        expect(board.previouslyAttacked.has("A1")).toBe(true);
    });
    test("Attack on same coordinate throws error", () => {
        board.receivedAttack("B2");
        expect(() => board.receivedAttack("B2")).toThrow("Coordinate B2 has been already attacked");
    });
    test("Attacked coordinates saved correctly", () => {
        board.receivedAttack("C3");
        board.receivedAttack("D4");
        expect(board.previouslyAttacked.has("C3")).toBe(true);
        expect(board.previouslyAttacked.has("D4")).toBe(true);
        expect(board.previouslyAttacked.size).toBe(2);
    });
    test("Get adjacent coordinates correctly", () => {
        expect(board.getAdjacentCoords(1, 1)).toEqual([
            "A1",
            "A2",
            "A3",
            "B1",
            "B3",
            "C1",
            "C2",
            "C3",
        ]);
    });
    test("All ships sunk detection works", () => {
        const ship1 = createShip("Destroyer", 2);
        const ship2 = createShip("Submarine", 3);
        board.placeShip("A1", ship1);
        board.placeShip("C1", ship2);
        expect(board.allShipsSunk()).toBe(false);
        board.receivedAttack("A1");
        board.receivedAttack("A2");
        expect(board.allShipsSunk()).toBe(false);
        board.receivedAttack("C1");
        board.receivedAttack("C2");
        board.receivedAttack("C3");
        expect(board.allShipsSunk()).toBe(true);
    });
    test("Reset board works correctly", () => {
        board.placeShip("A1", ship);
        board.receivedAttack("A1");
        board.resetBoard();
        expect(board.getBoard()).toEqual(expectedBoard);
        expect(board.previouslyAttacked.size).toBe(0);
        expect(board.hitShots).toEqual([]);
        expect(board.missedShots).toEqual([]);
        expect(board.ships).toEqual([]);
    });
    test('Attack result returns "hit", "miss" or "sunk" appropriately', () => {
        const testShip = createShip("Destroyer", 2);
        board.placeShip("E5", testShip);
        expect(board.attckResult("A1")).toBe("miss");
        expect(board.attckResult("E5")).toBe("hit");
        expect(board.attckResult("E6")).toBe("sunk");
    });
});
