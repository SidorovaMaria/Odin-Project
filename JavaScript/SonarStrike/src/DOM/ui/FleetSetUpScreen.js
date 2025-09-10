import { create } from "../../utils/utils";
import uiUtils from "../uiUtils";
import "../uiStyles/fleetSetUpScreen.css";
import { createShip } from "../../modules/ship";
export class FleetSetUp {
    constructor(root, game) {
        this.game = game;
        this.root = root;
        this.container = create("section", {
            classes: ["fleet-setup-screen", "fade-in"],
            attrs: {
                id: "fleet-setup-screen",
            },
        });
        this.posOrientation = "horizontal"; //'horizontal
        this.shipsToPlace = this.createFleets();
        this.chosenShip = this.shipsToPlace[0];
        this._bound = false;
        this.BOARD_SIZE = 10;
        this.highlightedCells = [];
    }
    render() {
        this.createHeader(this.container);
        const SetUpContainer = create("div", {
            classes: ["set-up-container"],
            attrs: { id: "set-up-container" },
        });
        this.gridElement = uiUtils.createMap(SetUpContainer);
        this.createFleetPanel(SetUpContainer);
        this.container.appendChild(SetUpContainer);
        this.createStartGameButton(this.container);
        this.bindEvents();
        this.root.appendChild(this.container);
    }
    createHeader(root) {
        const header = create("div", { classes: ["header-container", "set-up"] });
        const title = create("h2", { text: "Fleet Deployment", classes: ["fade-in"] });
        const subtitle = create("p", {
            text: "Position your ships -",
            classes: ["fade-in", "subtitle"],
        });
        const subtitleSpan = create("span", {
            text: " Mission Critical",
            classes: ["subtitle-span"],
        });
        subtitle.appendChild(subtitleSpan);
        header.append(title, subtitle);
        root.appendChild(header);
    }
    createFleets() {
        const carrier = createShip("Carrier", 5);
        const battleship = createShip("Battleship", 4);
        const destroyer = createShip("Destroyer", 3);
        const submarine = createShip("Submarine", 3);
        const patrolBoat = createShip("Patrol Boat", 2);
        return [carrier, battleship, destroyer, submarine, patrolBoat];
    }
    createFleetPanel(root) {
        const fleetPanel = create("div", { classes: ["fleet-panel"] });
        const TitleRotateContainer = create("div", { classes: ["title-rotate-container"] });
        //Rotate Button
        const orientationButton = create("button", {
            classes: ["orientation-button"],
            attrs: {
                type: "button",
                "aria-label": "Change ship orientation",
                tabindex: "0",
                id: "orientation-button",
            },
            html: `Horizontal <i class="fa-solid fa-arrow-right"></i>`,
        });
        const title = create("h3", { text: "Fleet Manifest" });
        const icon = create("i", { classes: ["fa-solid", "fa-ship"] });
        title.prepend(icon);
        TitleRotateContainer.append(title, orientationButton);

        const fleetsList = create("div", {
            classes: ["fleets-list"],
            attrs: { role: "listbox", "aria-label": "Choose a ship to deploy" },
        });
        this.shipsToPlace.forEach((ship) => {
            const fleetCard = this.createFleetCard(ship);
            fleetsList.appendChild(fleetCard);
        });
        const rulesBtn = create("button", {
            classes: ["rules-button"],
            attrs: {
                type: "button",
                "aria-label": "View game rules",
                tabindex: "0",
                id: "placement-rules-button",
            },
        });
        const text = create("span", { text: "Placement Rules" });
        const rulesIcon = create("i", { classes: ["fa-solid", "fa-circle-info"] });
        rulesBtn.prepend(rulesIcon, text);
        fleetPanel.append(TitleRotateContainer, fleetsList, rulesBtn);
        root.appendChild(fleetPanel);
    }
    createFleetCard(ship) {
        const isPlaced = this.shipsToPlace.includes(ship) ? false : true;
        const isActive = ship === this.chosenShip;
        const fleetCard = create("button", {
            classes: ["fleet-card"],
            attrs: {
                type: "button",
                role: "option",
                "aria-selected": isActive ? "true" : "false",
                "aria-pressed": isActive ? "true" : "false",
                "aria-label": `${ship.name} , length ${ship.length} units`,
                tabindex: "0",
                "data-ship-id": ship.id,
            },
        });
        if (isActive) fleetCard.classList.add("active");
        if (isPlaced) {
            fleetCard.classList.add("positioned");
            fleetCard.setAttribute("aria-disabled", "true");
            fleetCard.disabled = true;
        }

        const info = create("div", { classes: ["info"] });
        const infoStatus = create("span", { classes: ["info-status"] });
        const infoText = create("div", { classes: ["info-text"] });
        const infoName = create("p", { text: ship.name, classes: ["info-name"] });
        const infoClass = create("p", { text: `Class - ${ship.length}`, classes: ["info-class"] });
        infoText.append(infoName, infoClass);
        info.append(infoStatus, infoText);

        const shipLength = create("div", { classes: ["ship-length"] });
        for (let i = 0; i < ship.length; i++) {
            const segment = create("div", { classes: ["ship-segment"] });
            shipLength.appendChild(segment);
        }
        fleetCard.append(info, shipLength);
        return fleetCard;
    }
    createRulesModalContent() {
        const modalContent = create("div", {
            classes: ["rules-modal-content"],
            attrs: { id: "rules-modal-content" },
        });
        const rulesList = create("ul");
        const rules = [
            "Ships must be placed horizontally or vertically.",
            "Ships cannot overlap.",
            "Ships cannot touch each other.",
            "Ships must fit within the grid.",
            "Use rotate button (R) to change orientation.",
        ];
        rules.forEach((rule) => {
            const listItem = create("li", { text: rule, classes: ["rule-item"] });
            rulesList.appendChild(listItem);
        });
        modalContent.appendChild(rulesList);
        return modalContent;
    }
    createStartGameButton(root) {
        const button = create("button", {
            classes: ["start-game-button"],
            attrs: {
                type: "button",
                "aria-label": "Start Game",
                tabindex: "0",
                id: "start-game-button",
                disabled: this.shipsToPlace.length > 0,
            },
            text: "Engage Enemy",
        });
        const icon = create("i", { classes: ["fa-solid", "fa-burst"] });
        button.prepend(icon);
        root.appendChild(button);
    }

    setChosenShip(ship, buttonInteraction = true) {
        //update Previous active card
        const panel = this.container.querySelector(".fleets-list");
        const prevBtn = panel?.querySelector(".fleet-card.active");
        if (prevBtn) {
            prevBtn.classList.remove("active");
            prevBtn.setAttribute("aria-selected", "false");
            prevBtn.setAttribute("aria-pressed", "false");
            prevBtn.setAttribute("tabindex", "-1");
        }

        if (!ship) return;
        if (buttonInteraction && ship === this.chosenShip) return;
        //update new active card
        const nextBtn = panel?.querySelector(`[data-ship-id='${ship.id}']`);

        if (nextBtn) {
            nextBtn.classList.add("active");
            nextBtn.setAttribute("aria-selected", "true");
            nextBtn.setAttribute("aria-pressed", "true");
            nextBtn.setAttribute("tabindex", "0");
            nextBtn.focus();
        }
    }

    bindEvents() {
        if (this._bound) return;
        this._bound = true;
        //Fleet panel events
        //Single delegated listener for click
        const panel = this.container.querySelector(".fleets-list");
        panel.addEventListener("click", (e) => {
            const btn = e.target.closest(".fleet-card");
            if (!btn || !panel.contains(btn)) return;
            //Ignore already positioned ships
            if (btn.classList.contains("positioned") || btn.disabled) return;

            const shipId = btn.getAttribute("data-ship-id");
            const ship = this.shipsToPlace.find((s) => s.id === shipId);
            if (ship) {
                this.setChosenShip(ship);
                this.chosenShip = ship;
            }
        });
        //KeyBoard navigatin ("ArrowUp", "ArrowDown"))
        panel.addEventListener("keydown", (e) => {
            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
            const cards = Array.from(panel.querySelectorAll(".fleet-card:not(.positioned)"));
            if (!cards.length) return;
            const activeCard = panel.querySelector(".fleet-card.active");
            let currentIndex = cards.indexOf(activeCard);
            if (currentIndex === -1) currentIndex = 0;
            let nextIndex;
            if (e.key === "ArrowDown") {
                nextIndex = (currentIndex + 1) % cards.length;
            } else if (e.key === "ArrowUp") {
                nextIndex = (currentIndex - 1 + cards.length) % cards.length;
            }
            const next = cards[nextIndex];
            if (!next) return;
            const shipId = next.getAttribute("data-ship-id");
            const ship = this.shipsToPlace.find((s) => s.id === shipId);
            if (ship) {
                this.setChosenShip(ship);
                this.chosenShip = ship;
            }
            next.focus();
        });
        //GRID events
        const grid = this.gridElement;
        if (!grid) return;
        grid.addEventListener("mousemove", (e) => {
            const cell = e.target.closest(".data-cell");
            if (!cell || !grid.contains(cell)) {
                //Clear View
                return;
            }
            if (!this.chosenShip || this.chosenShip.placed) return;
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.cell);
            const shipLength = this.chosenShip.length;
            const orientation = this.posOrientation;
            const cells = this.getPlacementCells(row, col, shipLength, orientation);
            //Check if placement is valid
            const isValid = this.isValidPlacement(cells);
            const isClear =
                isValid && this.isClear(cells) && this.validPlacementNotNextToOtherShip(cells);
            this.paintPreview(cells, isClear);
        });
        grid.addEventListener("mouseleave", () => {
            this.clearPreview();
        });
        //Place Ship on Click if valid
        grid.addEventListener("click", (e) => {
            const cell = e.target.closest(".data-cell");
            if (!cell || !grid.contains(cell)) return;
            if (!this.chosenShip || this.chosenShip.placed) return;
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.cell);
            const shipLength = this.chosenShip.length;
            const orientation = this.posOrientation;
            const cells = this.getPlacementCells(row, col, shipLength, orientation);
            //Check if placement is valid
            const isValid = this.isValidPlacement(cells);
            const isClear =
                isValid && this.isClear(cells) && this.validPlacementNotNextToOtherShip(cells);
            if (!isClear) {
                const gridMessage = document.getElementById("grid-message");
                if (gridMessage) {
                    gridMessage.innerHTML = "Invalid placement.";
                    gridMessage.classList.add("error");
                    setTimeout(() => {
                        gridMessage.innerHTML =
                            "Click on the grid to place your ships<br/>Press R to rotate";
                        gridMessage.classList.remove("error");
                    }, 1000);
                }
                return;
            }
            //Commit placement
            this.commitPlacement(this.chosenShip, cells);
        });
        const orientationButton = this.container.querySelector("#orientation-button");
        orientationButton.addEventListener("click", (e) => {
            if (this.posOrientation === "horizontal") {
                this.posOrientation = "vertical";
                orientationButton.innerHTML = `Vertical <i class="fa-solid fa-arrow-down"></i>`;
            } else {
                this.posOrientation = "horizontal";
                orientationButton.innerHTML = `Horizontal <i class="fa-solid fa-arrow-right"></i>`;
            }
        });
        //Keyboard rotation
        document.addEventListener("keydown", (e) => {
            if (e.key !== "r" && e.key !== "R") return;
            if (this.posOrientation === "horizontal") {
                this.posOrientation = "vertical";
                orientationButton.innerHTML = `Vertical <i class="fa-solid fa-arrow-down"></i>`;
            } else {
                this.posOrientation = "horizontal";
                orientationButton.innerHTML = `Horizontal <i class="fa-solid fa-arrow-right"></i>`;
            }
        });
        //Placement Rules Modal
        const rulesBtn = this.container.querySelector("#placement-rules-button");
        rulesBtn.addEventListener("click", () => {
            const modalContent = this.createRulesModalContent();
            uiUtils.createModal("Placement Rules", modalContent);
        });
    }
    getPlacementCells(startRow, startCol, shipLength, orientation) {
        const cells = [];
        for (let i = 0; i < shipLength; i++) {
            const row = orientation === "vertical" ? startRow + i : startRow;
            const col = orientation === "horizontal" ? startCol + i : startCol;
            cells.push({ row, col, element: this.getCellElement(row, col) });
        }
        return cells;
    }
    getCellElement(row, col) {
        return this.gridElement.querySelector(`[data-row='${row}'][data-cell='${col}']`);
    }
    isValidPlacement(cells) {
        return cells.every(
            ({ row, col }) =>
                row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE,
        );
    }
    isClear(cells) {
        return cells.every(
            ({ element }) =>
                element && (element.dataset.status === "water" || element.dataset.status === ""),
        );
    }
    validPlacementNotNextToOtherShip(cells) {
        for (const { row, col } of cells) {
            for (let r = row - 1; r <= row + 1; r++) {
                for (let c = col - 1; c <= col + 1; c++) {
                    if (r < 0 || r >= this.BOARD_SIZE || c < 0 || c >= this.BOARD_SIZE) continue;
                    const cell = this.getCellElement(r, c);
                    if (cell && cell.dataset.status === "ship") {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    paintPreview(cells, isValid) {
        this.clearPreview();
        for (const { element } of cells) {
            if (!element) continue;
            element.classList.add("preview");
            element.classList.toggle("preview-invalid", !isValid);
            element.classList.toggle("preview-valid", !!isValid);
        }
        this.highlightedCells = cells.map(({ element }) => element).filter(Boolean);
    }
    clearPreview() {
        if (!this.highlightedCells.length) return;
        for (const el of this.highlightedCells) {
            el.classList.remove("preview", "preview-valid", "preview-invalid");
        }
        this.highlightedCells = [];
    }
    paintInvalidPlacement(cells) {
        for (const { element } of cells) {
            if (!element) continue;
            element.classList.add("preview", "preview-invalid");
            setTimeout(() => element.classList.remove("preview", "preview-invalid"), 1200);
        }
    }
    commitPlacement(ship, cells) {
        //make Sure ship is the placee in the same direction
        ship.setOrientation(this.posOrientation);
        //Starting cell
        const startCell = cells[0].element.id;
        //Mark cells as occupied
        for (const { element } of cells) {
            if (!element) continue;
            element.dataset.status = "ship";
            element.dataset.shipId = ship.id;
            element.classList.remove("preview", "preview-valid", "preview-invalid");
            element.classList.add("occupied");
            element.setAttribute("aria-label", `Occupied by ${ship.name}`);
            const icon = create("i", {
                classes: ["fa-solid", "fa-ship", "ship-grid-icon"],
                attrs: { "aria-hidden": "true" },
            });
            element.appendChild(icon);
        }

        this.shipsToPlace = this.shipsToPlace.filter((s) => s.id !== ship.id);
        this.chosenShip = this.shipsToPlace[0] || null;
        this.setChosenShip(this.chosenShip, false);
        if (!this.shipsToPlace.length) {
            const startButton = this.container.querySelector("#start-game-button");
            if (startButton) {
                startButton.disabled = false;
                startButton.focus();
            }
        }
        this.clearPreview();

        this.game.player.board.placeShip(startCell, ship);
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
}
