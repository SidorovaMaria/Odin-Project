import "./Screenstyle.css";
import "./animation.css";
import { create } from "../../utils/utils";

export class StartScreen {
    constructor(root) {
        this.root = root;
        this.conatiner = create("section", {
            classes: ["start-screen", "fade-in"],
            attrs: {
                id: "start-screen",
            },
        });
        this._bound = false;

        this._fadeTimeout = null;
        this._removeTimeout = null;
    }
    createStartCard() {
        this.createHeader();
        this.createFormInput();
        this.creaatePlayButton();
        this.createAboutMe();
        this.bindEvents();
        //to be implemented
        this.root.appendChild(this.conatiner);
    }
    createHeader() {
        const header = create("div", { classes: ["header-container"] });
        const IconContainer = create("div", { classes: ["icon-container"] });
        const icon = create("i", { classes: ["fa-solid", "fa-ship"] });
        IconContainer.appendChild(icon);
        const title = create("h2", { text: "Sonar Strike" });
        const description = create("p", {
            text: "Classfied mission - Sonar Strike",
        });
        header.append(IconContainer, title, description);
        this.conatiner.appendChild(header);
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
        this.conatiner.appendChild(form);
    }
    creaatePlayButton() {
        const button = create("button", {
            classes: ["play-button"],
            text: "Initiate Mission",
            attrs: { type: "submit", form: "player-name-form", disabled: true },
        });
        const icon = create("i", { classes: ["fa-solid", "fa-play", "fa-mp3"] });
        button.prepend(icon);
        this.conatiner.appendChild(button);
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
        this.conatiner.appendChild(aboutMe);
    }
    removeScreen() {
        if (this._fadeTimeout) clearTimeout(this._fadeTimeout);
        if (this._removeTimeout) clearTimeout(this._removeTimeout);

        this._fadeTimeout = setTimeout(() => {
            this.conatiner.classList.add("fade-out");
        }, 1000);
        this._removeTimeout = setTimeout(() => {
            this.conatiner.remove();
        }, 1500);
    }
    bindEvents() {
        if (this._bound) return;
        const inputField = this.conatiner.querySelector("#player-name");
        const playButton = this.conatiner.querySelector(".play-button");
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
