import { createShip } from "../src/modules/ship";

describe("Ship creation methods test", () => {
    beforeEach(() => {
        ship = createShip("Destroyer", 3);
    });

    test("Increment hit Count", () => {
        ship.hit();
        ship.hit();
        expect(ship.timesHit()).toBe(2);
    });
    test("IF ship is sunk return true", () => {
        ship.hit();
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBeTruthy();
    });
    test("Check falsy value if ship is not sunk", () => {
        ship.hit();
        expect(ship.isSunk()).toBeFalsy();
    });
    test("Change orientation method", () => {
        expect(ship.isHorizontal()).toBeTruthy();
        ship.chngeOrientation();
        expect(ship.isVertical()).toBeTruthy();
    });
    test("Orientation is horizontal by default", () => {
        expect(ship.isHorizontal()).toBeTruthy();
    });
});
