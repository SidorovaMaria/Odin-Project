import { create } from "../../utils/utils";
import "../uiStyles/battleScreen.css";
import uiUtils from "../uiUtils";
import { BattleGrid } from "./BattleGrid";
export class BattleScreen {
    constructor(root, game, restartCallback) {
        this.root = root;
        this.game = game;
        this.container = create("section", {
            classes: ["battle-screen", "fade-in"],
            attrs: {
                id: "battle-screen",
            },
        });
        this.restartCallback = restartCallback;
        this._bound = false;
    }
    render() {
        this.game.initializeGame();
        this.createHeader();
        this.createBattleBoard();

        this.root.appendChild(this.container);
        this.highlightGridToAttack(true); // Player starts first
        this.bindEvents();
    }
    createHeader() {
        const header = create("div", { classes: ["header-container", "battle"] });
        const title = create("h2", { classes: ["battle-title"], text: "Active Combat Zone" });
        const combatPlayers = create("h3", {
            classes: ["combat-player"],
            html: `<p id='combat-player-name'>${this.game.getPlayerName()}</p> <span id='combat-vs'></span> <p id='combat-cpu-name'>${this.game.getCpuName()}</p>`,
        });
        header.append(title, combatPlayers);

        this.container.appendChild(header);
    }
    createBattleBoard() {
        const battleBoards = create("div", { classes: ["battle-boards"] });
        const playerBoard = new BattleGrid(
            battleBoards,
            this.game.player.board,
            this.game.player,
        ).createGrid();

        const cpuBoard = new BattleGrid(
            battleBoards,
            this.game.cpu.board,
            this.game.cpu,
        ).createGrid();

        this.container.appendChild(battleBoards);
    }
    bindEvents() {
        if (this._bound) return;
        this._bound = true;

        //Event Listeneres for CPU grid cells
        const cpuGrid = document.getElementById("CPU-grid");
        if (!cpuGrid) return;

        cpuGrid.addEventListener("mousemove", (e) => {
            const cell = e.target.closest(".data-cell");
            if (!cell || !cpuGrid.contains(cell)) {
                this.clearAttackPreview(cpuGrid);
                return;
            }
            // reset previous highlights
            this.clearAttackPreview(cpuGrid);

            if (this.isNotPreviouslyAttacked(cell)) {
                this.showAttackAttempting(cell);
            }
        });

        // also clear when the mouse leaves the grid entirely
        cpuGrid.addEventListener("mouseleave", () => {
            this.clearAttackPreview(cpuGrid);
        });
        cpuGrid.addEventListener("click", (e) => {
            const cell = e.target.closest(".data-cell");
            if (!cell || !cpuGrid.contains(cell)) return;

            if (this.isNotPreviouslyAttacked(cell)) {
                this.playerAttacks(cell);
                this.clearAttackPreview(cpuGrid);
            } else {
                return;
            }
        });
    }

    isNotPreviouslyAttacked(element) {
        if (!element) return false;
        return element.dataset.status === "water";
    }

    showAttackAttempting(element) {
        const icon = create("i", { classes: ["fa-solid", "fa-xmark", "attack-icon"] });
        if (element) {
            element.classList.add("attacking");
            element.setAttribute("aria-label", `${element.id} targeting`);
            if (!element.querySelector(".attack-icon")) {
                element.appendChild(icon);
            }
        }
    }
    clearAttackPreview(grid) {
        const prev = grid.querySelector(".attacking");
        if (prev) {
            prev.classList.remove("attacking");
            prev.innerHTML = "";
            // restore ARIA if needed
            if (prev.dataset.status === "water") {
                prev.setAttribute("aria-label", `${prev.id} water`);
            }
        }
    }
    playerAttacks(element) {
        const elementId = element.id;
        if (!elementId) return;
        const coord = elementId;
        const result = this.game.player.attack(this.game.cpu, coord);
        if (result === "miss") {
            this.paintMissedShot(element);
            const result = this.game.cpuAttack();
            this.highlightGridToAttack(false);
            if (result.winner) {
                this.paintCpuShot(result.attacks);
                this.setWinner(result.winner);
                return;
            }
            this.paintCpuShot(result);
        } else if (result === "hit") {
            this.paintHitShot(element);
        } else if (result === "sunk") {
            this.paintHitShot(element);
            this.paintNotPossibleCells(element);
        } else if (result === "all-sunk") {
            this.paintHitShot(element);
            this.setWinner(this.game.player);
            return;

            // Here you can add additional logic for ending the game, showing a modal, etc.
        }
    }
    paintMissedShot(element) {
        if (!element) return;
        element.dataset.status = "miss";
        element.classList.remove("attacking");
        element.innerHTML = "";
        const missIcon = create("i", { classes: ["fa-solid", "fa-circle", "miss-icon"] });
        element.appendChild(missIcon);
        element.setAttribute("aria-label", `${element.id} missed shot`);
    }
    paintHitShot(element) {
        if (!element) return;
        element.dataset.status = "hit";
        element.classList.remove("attacking");
        element.innerHTML = "";
        const hitIcon = create("i", { classes: ["fa-solid", "fa-skull-crossbones", "hit-icon"] });
        element.appendChild(hitIcon);
        element.setAttribute("aria-label", `${element.id} hit`);
    }
    getAdjacentCellsAfterTheShipIsSunk(cell) {
        const shipid = cell.dataset.shipId;
        const allCoords = document.querySelectorAll(`[data-ship-id='${shipid}']`);

        const parent = cell.parentElement;
        const adjacentCells = new Set();

        allCoords.forEach((shipCell) => {
            const row = parseInt(shipCell.dataset.row, 10);
            const col = parseInt(shipCell.dataset.cell, 10);
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r >= 0 && r < 10 && c >= 0 && c < 10) {
                        const adjacentCell = parent.querySelector(
                            `.data-cell[data-row='${r}'][data-cell='${c}']`,
                        );
                        if (adjacentCell && adjacentCell.dataset.status === "water") {
                            adjacentCells.add(adjacentCell);
                        }
                    }
                }
            }
        });
        adjacentCells.forEach((adjCell) => {
            adjCell.dataset.status = "not-possible";
            const missIcon = create("i", {
                classes: ["fa-solid", "fa-circle", "miss-icon"],
            });
            adjCell.appendChild(missIcon);
            adjCell.setAttribute("aria-label", `${adjCell.id} not possible`);
        });
    }
    setWinner(winner) {
        this.createWinnerModal(winner);
        this.createPlayAgainButton(this.container);
        this.restartCallback();
    }
    paintNotPossibleCells(cell) {
        const shipid = cell.dataset.shipId;
        const allCoords = document.querySelectorAll(`[data-ship-id='${shipid}']`);
        this.getAdjacentCellsAfterTheShipIsSunk(cell);
    }
    paintCpuShot(attackArray) {
        if (!attackArray || attackArray.length === 0) return;
        const playerGrid = document.getElementById("Player-grid");
        const cpuGrid = document.getElementById("CPU-grid");
        cpuGrid.style.pointerEvents = "none"; // Disable interaction during CPU
        if (!playerGrid) return;
        // Highlight CPU's chosen cells with a "thinking" effect before revealing the result
        attackArray.forEach(({ cell, result }, idx) => {
            const cellElement = playerGrid.querySelector(`#${cell}`);
            const cpuName = document.getElementById("combat-cpu-name");
            if (!cellElement) return;

            // Step 1: Show "thinking" highlight
            setTimeout(() => {
                cpuName.classList.add("cpu-thinking");
                cpuName.setAttribute("aria-label", `${cell} cpu targeting`);
                cpuName.textContent = "CPU is thinking...";
            }, idx * 1000);

            // Step 2: Reveal result after a short delay
            setTimeout(
                () => {
                    cpuName.classList.remove("cpu-thinking");
                    cpuName.setAttribute("aria-label", `CPU`);
                    cpuName.textContent = this.game.getCpuName();
                    if (result === "miss") {
                        this.paintMissedShot(cellElement);
                    } else if (result === "hit") {
                        this.paintHitShot(cellElement);
                    } else if (result === "sunk" || result === "all-sunk") {
                        this.paintHitShot(cellElement);
                        this.paintNotPossibleCells(cellElement);
                    }
                },
                idx * 1000 + 1000,
            );
        });
        // Re-enable interaction after all CPU attacks are processed

        setTimeout(
            () => {
                this.highlightGridToAttack(true);
            },
            attackArray.length * 1000 + 1000,
        );
    }
    createWinnerModal(winner) {
        const modalContent = create("div", { classes: ["modal-content"] });
        const message = create("p", {
            text: `${winner.name} wins the game!`,
            classes: ["winner-message"],
        });
        modalContent.append(message);
        this.createPlayAgainButton(modalContent);
        uiUtils.createModal("Game Over", modalContent);
    }

    createPlayAgainButton(root) {
        const playAgainBtn = create("button", {
            classes: ["play-again-button"],
            attrs: {
                type: "button",
                "aria-label": "Play Again",
                tabindex: "0",
                id: "play-again-button",
            },
        });

        const text = create("span", { text: "Play Again" });
        const rulesIcon = create("i", { classes: ["fa-solid", "fa-rotate"] });
        playAgainBtn.prepend(rulesIcon, text);
        root.appendChild(playAgainBtn);
    }
    removeScreen() {
        return new Promise((resolve) => {
            this.container.classList.remove("fade-in");
            this.container.classList.add("fade-out");

            setTimeout(() => {
                this.container.remove();
                resolve();
            }, 500);
        });
    }
    highlightGridToAttack(playersTurn = true) {
        const playerGrid = document.getElementById("Player-grid");
        const cpuGrid = document.getElementById("CPU-grid");
        if (!playerGrid || !cpuGrid) return;
        if (playersTurn) {
            cpuGrid.classList.add("active-grid");
            playerGrid.classList.remove("active-grid");
            cpuGrid.style.pointerEvents = "auto";
        } else {
            playerGrid.classList.add("active-grid");
            cpuGrid.classList.remove("active-grid");
            cpuGrid.style.pointerEvents = "none";
        }
    }
}
