import { create } from "../../utils/utils";
import "../uiStyles/battleGrid.css";
import uiUtils from "../uiUtils";
export class BattleGrid {
    constructor(root, board, player) {
        this.root = root;
        this.board = board;
        this.player = player;
        this.isCPU = player.name === "CPU";
        const BOARD_SIZE = 10;
        this.container = create("div", {
            classes: ["battle-grid"],
        });
        this.bound = false;
    }
    createGrid = () => {
        const gridContainer = create("div", { classes: ["grid-container"] });
        let gridTitleText;
        let icon;
        let className;
        let gridId;
        if (this.player.name === "CPU") {
            gridTitleText = "Enemy Sector";
            icon = '<i class="fa-solid fa-crosshairs"></i>';
            className = "enemy";
            gridId = "CPU-grid";
        } else {
            gridTitleText = `Friendly Sector`;
            icon = '<i class="fa-solid fa-shield-alt"></i>';
            className = "friendly";
            gridId = "Player-grid";
        }
        const gridTitle = create("h3", {
            classes: ["grid-title", className],
            html: `${icon} ${gridTitleText}`,
        });

        const battleBoard = create("div", {
            classes: ["battle-board"],
            attrs: { role: "grid", "aria-label": `${this.player.name} battle grid`, id: gridId },
        });
        uiUtils.createNumbersRow(battleBoard);
        uiUtils.createCellRows(battleBoard, this.player);
        this.populateGrid(battleBoard);
        gridContainer.append(gridTitle, battleBoard);
        this.container.appendChild(gridContainer);
        this.root.appendChild(this.container);
    };
    populateGrid = (parent) => {
        if (this.isCPU) {
            const boardData = this.board.getShipsCoordsonBoard();
            boardData.forEach((coord) => {
                const cell = parent.querySelector(`#${coord}`);
                cell.dataset.shipId = this.board.getCell(coord).id;
            });
        } else {
            const boardData = this.board.getShipsCoordsonBoard();
            boardData.forEach((coord) => {
                const cell = parent.querySelector(`#${coord}`);
                cell.dataset.status = "ship";
                cell.dataset.shipId = this.board.getCell(coord).id;
                const shipIcon = create("i", { classes: ["fa-solid", "fa-ship", "ship-icon"] });
                cell.appendChild(shipIcon);
            });
        }
    };
}
