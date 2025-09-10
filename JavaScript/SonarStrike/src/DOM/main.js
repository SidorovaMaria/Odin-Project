import { Game } from "../modules/game";
import { BattleScreen } from "./ui/BattleScreen";
import { FleetSetUp } from "./ui/FleetSetUpScreen";
import { StartScreen } from "./UI/startScreen";
import uiUtils from "./uiUtils";

export class App {
    constructor() {
        this.root = document.getElementById("app");
        this.game = new Game();
        this.startScreen = new StartScreen(this.root);
        this.fleetSetUpScreen = null;
        this.battleScreen = new BattleScreen(this.root, this.game, this.restartGame.bind(this));
    }
    loadGame() {
        //Reset all app content
        this.root.replaceChildren("");
        this.startScreen.createStartCard(this.root);
        this.setUpGame();
    }
    setUpGame() {
        const form = document.getElementById("player-name-form");
        const inputField = document.querySelector("#player-name");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const playerName = inputField.value.trim();
            if (playerName) {
                this.game.setPlayer(playerName);
                uiUtils.updateAvatarName(playerName);
            }
            await this.startScreen.removeScreen();
            this.fleetSetUpScreen = new FleetSetUp(this.root, this.game);
            this.fleetSetUpScreen.render();
            this.startBattle();
        });
    }
    startBattle() {
        const startBattleButton = document.getElementById("start-game-button");
        startBattleButton.addEventListener("click", async () => {
            await this.fleetSetUpScreen.removeScreen();
            this.battleScreen.render();
        });
    }
    restartGame() {
        const playAgainBtns = document.querySelectorAll(".play-again-button");
        if (!playAgainBtns) return;
        playAgainBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.game = new Game();
                this.battleScreen = new BattleScreen(
                    this.root,
                    this.game,
                    this.restartGame.bind(this),
                );
                this.startScreen = new StartScreen(this.root);
                this.fleetSetUpScreen = null;
                uiUtils.closeModal();
                this.loadGame();
            });
        });
    }
}
