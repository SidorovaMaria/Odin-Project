import { create } from "../utils/utils";
import "../style.css";
const BOARD_SIZE = 10;
const LETTERS = "ABCDEFGHIJ";
const uiUtils = (() => {
    function updateAvatarName(playerName) {
        const avatarName = document.querySelector("#player-avatar");
        const avatarContainer = document.querySelector(".player-container");
        avatarName.textContent = playerName;
        avatarContainer.classList.remove("hidden");
    }
    function createMap(root) {
        const mapContainer = create("div", { classes: ["map-container"] });
        const mapGrid = create("div", {
            classes: ["map-grid"],
            attrs: { role: "grid", "aria-label": "Deployment grid" },
        });
        createNumbersRow(mapGrid);
        createCellRows(mapGrid);
        mapContainer.appendChild(mapGrid);
        const gridmessage = create("p", {
            html: "Click on the grid to place your ships<br/>Press R to rotate",
            attrs: { "aria-live": "polite", id: "grid-message" },
        });
        mapContainer.appendChild(gridmessage);
        root.appendChild(mapContainer);
        return mapGrid;
    }

    function createNumbersRow(root) {
        for (let i = 0; i <= BOARD_SIZE; i++) {
            const numberCell = create("div", { classes: ["number-cell", "cell"] });
            numberCell.textContent = i === 0 ? "" : i;
            root.appendChild(numberCell);
        }
    }
    function createCellRows(root) {
        for (let row = 1; row <= BOARD_SIZE; row++) {
            for (let cell = 0; cell <= BOARD_SIZE; cell++) {
                const letterDiv = create("div", { classes: ["cell", "letter-cell"] });
                const cellButton = create("button", {
                    classes: ["cell-button", "data-cell"],
                    attrs: {
                        type: "button",
                        "aria-label": `Row ${LETTERS[row - 1]} Cell ${cell}`,
                        "data-status": "water",
                        tabindex: "0",
                        "data-row": row - 1,
                        "data-cell": cell - 1,
                        "data-ship-id": "",
                        id: `${LETTERS[row - 1]}${cell}`,
                    },
                });
                if (cell === 0) {
                    root.appendChild(letterDiv);
                    letterDiv.textContent = LETTERS[row - 1];
                } else {
                    cellButton.textContent = "";
                    root.appendChild(cellButton);
                }
            }
        }
    }
    function createModal(modalTitle, modalContent) {
        // Prevent background from scrolling when modal is open
        document.body.style.overflow = "hidden";
        const overlay = create("div", { classes: ["modal-overlay", "fade-in"] });
        const modal = create("div", { classes: ["modal", "slide-in-from-top"] });
        const header = create("div", { classes: ["modal-header"] });
        const title = create("h2", { text: modalTitle });
        const closeButton = create("button", {
            classes: ["modal-close-button"],
            attrs: { "aria-label": "Close modal" },
            html: "&times;",
        });

        header.append(title, closeButton);
        modal.append(header, modalContent);
        overlay.appendChild(modal);
        closeButton.addEventListener("click", closeModal);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        document.body.appendChild(overlay);
    }
    function closeModal() {
        const overlay = document.querySelector(".modal-overlay");
        const modal = document.querySelector(".modal");
        if (overlay) {
            overlay.classList.remove("fade-in");
            overlay.classList.add("fade-out");
            modal.classList.remove("slide-in-from-top");
            modal.classList.add("slide-out-to-bottom");
            setTimeout(() => {
                document.body.removeChild(overlay);
                // Re-enable background scrolling when modal is closed
                document.body.style.overflow = "auto";
            }, 300); // Match the duration of the fade-out animation
        }
    }

    return { updateAvatarName, createMap, createModal };
})();
export default uiUtils;
