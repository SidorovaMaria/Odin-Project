import "./reset.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./style.css";
import "./modules/gameBoard";
import { App } from "./DOM/main";
import { create } from "./utils/utils";
import { GameBoard } from "./modules/gameBoard";

const application = new App();
application.loadGame();
const status = document.querySelector(".system");
status.addEventListener("click", (e) => {
    e.preventDefault();
    console.log(application);
});
