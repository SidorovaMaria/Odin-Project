import "../uiStyles/animation.css";
import "../uiStyles/startScreen.css";
import "../uiStyles/animation.css";
import { create } from "../../utils/utils";

export class StartScreen {
    constructor(root) {
        this.root = root;
        this.container = create("section", {
            classes: ["start-screen", "fade-in"],
            attrs: {
                id: "start-screen",
            },
        });
        this._bound = false;
    }
    createStartCard() {
        this.createHeader();
        this.createFormInput();

        this.createAboutMe();
        this.bindEvents();
        //to be implemented
        this.root.appendChild(this.container);
    }
    createHeader() {
        const header = create("div", { classes: ["header-container", "start"] });
        const IconContainer = create("div", { classes: ["icon-container"] });
        const icon = create("i", { classes: ["fa-solid", "fa-ship"] });
        IconContainer.appendChild(icon);
        const title = create("h2", { text: "Sonar Strike" });
        const description = create("p", {
            text: "Classfied mission - Sonar Strike",
        });

        header.append(IconContainer, title, description);
        this.container.appendChild(header);
    }
    createFormInput() {
        const form = create("form", { classes: ["start-form"], attrs: { id: "player-name-form" } });
        const label = create("label", {
            text: "Commander Callsign",
            attrs: { for: "player-name" },
        });
        const input = create("input", {
            classes: ["input-field"],
            attrs: {
                type: "text",
                id: "player-name",
                name: "player-name",
                placeholder: "Enter your callsign...",
            },
        });
        form.append(label, input);
        this.createPlayButton(form);
        this.container.appendChild(form);
    }
    createPlayButton(parent) {
        const button = create("button", {
            classes: ["play-button"],
            text: "Initiate Mission",
            attrs: { type: "submit", form: "player-name-form", disabled: true },
        });
        const icon = create("i", { classes: ["fa-solid", "fa-play", "fa-mp3"] });
        button.prepend(icon);
        parent.appendChild(button);
    }
    createAboutMe() {
        const aboutMe = create("div", { classes: ["about-me"] });
        const github = create("button", { classes: ["github-link", "link-icon"] });
        const icon = create("i", { classes: ["fa-brands", "fa-github"] });
        const githubLink = create("a", {
            attrs: { href: "https://github.com/SidorovaMaria", target: "_blank" },
        });
        const githubSpan = create("span", {
            attrs: {
                id: "github-span",
            },
        });
        githubLink.append(icon);
        github.append(githubLink, githubSpan);
        const portfolio = create("button", { classes: ["portfolio-link", "link-icon"] });
        const portfolioIcon = create("i", { classes: ["fa-solid", "fa-globe"] });
        const portfolioLink = create("a", {
            attrs: { href: "https://portfolio-6dft.vercel.app/", target: "_blank" },
        });
        const portfolioSpan = create("span", {
            attrs: { id: "portfolio-span" },
        });
        portfolioLink.append(portfolioIcon);
        portfolio.append(portfolioLink, portfolioSpan);
        aboutMe.append(github, portfolio);
        this.container.appendChild(aboutMe);
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
    bindEvents() {
        if (this._bound) return;
        const inputField = this.container.querySelector("#player-name");
        const playButton = this.container.querySelector(".play-button");
        inputField.addEventListener("input", () => {
            if (inputField.value.trim().length > 0) {
                playButton.disabled = false;
            } else {
                playButton.disabled = true;
            }
        });
        this._bound = true;
    }
}
