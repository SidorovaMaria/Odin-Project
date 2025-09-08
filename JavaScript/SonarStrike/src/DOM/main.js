import { StartScreen } from "./styles/startScreen";

// c app() {
//     const appElement = document.getElementById("app");
//     function loadGame() {
//         //Reset all app content
//         appElement.replaceChildren("");
//         const startScreen = new StartScreen(appElement);
//         startScreen.createStartCard(appElement);
//     }
//     // You may want to expose loadGame or call it here
// }

export class App {
    constructor() {
        this.root = document.getElementById("app");
    }
    loadGame() {
        //Reset all app content
        this.root.replaceChildren("");
        const startScreen = new StartScreen(this.root);
        startScreen.createStartCard(this.root);
    }
}
