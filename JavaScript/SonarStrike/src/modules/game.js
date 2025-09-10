import { Player } from "./player";
const LETTERS = "ABCDEFGHIJ";
export class Game {
    constructor() {
        this.player = new Player("Player 1", true);
        this.cpu = new Player("CPU");
    }
    getPlayerName() {
        return this.player.name;
    }
    getCpuName() {
        return this.cpu.name;
    }
    setPlayer(name) {
        this.player = new Player(name, true);
    }
    initializeGame() {
        this.cpu.board.resetBoard();
        this.cpu.board.placeAllShipsRandom();
        //For testing purposes only
    }
    getActivePlayer() {
        if (this.player.checkTurn()) {
            return this.player;
        } else {
            return this.cpu;
        }
    }
    CPUAttack() {
        if (!this.cpu.checkTurn()) throw new Error("It's not CPU's turn!");

        const attacks = [];
        const board = this.player.board;

        while (true) {
            const cell = this.pickBestAvailable(board);
            if (!cell) break; // safety
            const result = this.cpu.attack(this.player, cell); // -> "hit" | "miss" | "sunk" | "all-sunk"
            attacks.push({ cell, result });

            if (result === "miss") break; // stop firing on miss
            if (result === "all-sunk") {
                return { attacks, winner: this.cpu };
            }
        }
        return attacks;
    }
    pickRandomAvailable(board) {
        const available = board.getAvailableShots();
        if (!available.length) return null;
        return available[Math.floor(Math.random() * available.length)];
    }
    // Drop-in replacement
    // Drop-in replacement
    pickBestAvailable(board) {
        const available = board.getAvailableShots();
        if (!available.length) return null;

        const availSet = new Set(available);
        const hits = board.getHitShots(); // assumed latest at the end
        if (!hits.length) return this.pickRandomAvailable(board);

        const LETTERS = "ABCDEFGHIJ";
        const toIndex = (L) => LETTERS.indexOf(L);
        const inBounds = (r, c) => r >= 0 && r < 10 && c >= 0 && c < 10;
        const toCoord = (r, c) => board.stringifyCoord({ row: LETTERS[r], col: c });

        // --- 1) If last two hits form a line, extend it the attacking direction ---
        const last = hits.at(-1);
        const prev = hits.at(-2);
        if (last && prev) {
            const a = board.parseCoordinate(prev); // { row:'B', col:5 }  // zero-based col
            const b = board.parseCoordinate(last); // { row:'B', col:6 }
            const r0 = toIndex(a.row),
                c0 = a.col;
            const r1 = toIndex(b.row),
                c1 = b.col;
            const adjacent = Math.abs(r1 - r0) + Math.abs(c1 - c0) === 1;

            if (adjacent) {
                const dr = Math.sign(r1 - r0); // -1, 0, 1
                const dc = Math.sign(c1 - c0); // -1, 0, 1

                // try forward from the last
                let r = r1 + dr,
                    c = c1 + dc;
                if (inBounds(r, c)) {
                    const fwd = toCoord(r, c);
                    if (availSet.has(fwd)) return fwd;
                }
                // try backward from the prev
                r = r0 - dr;
                c = c0 - dc;
                if (inBounds(r, c)) {
                    const back = toCoord(r, c);
                    if (availSet.has(back)) return back;
                }
                // fall through to neighbor logic if both blocked
            }
        }

        // --- 2) Single-hit (or blocked line): check 4 neighbors of the last hit ---
        {
            const { row, col } = board.parseCoordinate(hits.at(-1));
            const r = toIndex(row),
                c = col;
            const neighbors = [
                [r - 1, c],
                [r + 1, c],
                [r, c - 1],
                [r, c + 1],
            ];
            const choices = neighbors
                .filter(([nr, nc]) => inBounds(nr, nc))
                .map(([nr, nc]) => toCoord(nr, nc))
                .filter((coord) => availSet.has(coord));

            if (choices.length) {
                return choices[Math.floor(Math.random() * choices.length)];
            }
        }

        // --- 3) Nothing around the last hit: try neighbors of any hit (simple cluster hunt) ---
        for (let i = hits.length - 1; i >= 0; i--) {
            const { row, col } = board.parseCoordinate(hits[i]);
            const r = toIndex(row),
                c = col;
            for (const [dr, dc] of [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
            ]) {
                const nr = r + dr,
                    nc = c + dc;
                if (!inBounds(nr, nc)) continue;
                const coord = toCoord(nr, nc);
                if (availSet.has(coord)) return coord;
            }
        }

        // --- 4) Hunt mode ---
        return this.pickRandomAvailable(board);
    }
}
