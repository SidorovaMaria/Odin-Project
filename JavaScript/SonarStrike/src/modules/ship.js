class Ship {
    constructor(length, orientation = "horizontal") {
        this.id = crypto.randomUUID();
        this.length = length;
        this.orientation = orientation; //'vertical';
        this.hitCount = 0;
    }
    hit(coords) {
        this.hitCount++;
    }
    isSunk() {
        return this.hitCount >= this.length;
    }
    timesHit() {
        return this.hitCount;
    }
    setOrientation(orientation) {
        this.orientation = orientation;
    }
    chngeOrientation() {
        this.orientation = this.orientation === "horizontal" ? "vertical" : "horizontal";
    }
    isVertical() {
        return this.orientation === "vertical";
    }
    isHorizontal() {
        return this.orientation === "horizontal";
    }
}

export function createShip(length, orientation) {
    return new Ship(length, orientation);
}
