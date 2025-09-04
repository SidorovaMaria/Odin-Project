import { aboutUs, ourPeople } from "./data";
import { createEl } from "./helper";

export function createAboutContent() {
  const content = document.getElementById("content");
  // About Us Section

  //Title
  const title = createEl("h1", {
    text: "About Us",
    attrs: {
      id: "about-title",
    },
  });

  // About Content
  const aboutContent = createEl("section", {
    classes: ["about-section"],
    attrs: { "aria-labelledby": "about-title" },
  });
  aboutUs.forEach((paragraph) => {
    const p = createEl("p", { text: paragraph });
    aboutContent.appendChild(p);
  });

  // Our Team section

  const peopleTitle = createEl("h2", {
    text: "Our Team",
    attrs: {
      id: "team-title",
    },
  });
  const peoples = createEl("ul", {
    classes: ["people"],
    attrs: { "aria-labelledby": "team-title", role: "list" },
  });

  ourPeople.forEach((person) => {
    const card = createEl("li", {
      classes: ["person"],
      attrs: { role: "listitem", tabindex: "0" },
    });
    const img = createEl("img", {
      attrs: {
        src: person.avatar,
        alt: person.name,
        decoding: "async",
        loading: "lazy",
      },
    });
    const name = createEl("h3", { text: person.name });
    const position = createEl("p", {
      classes: ["position"],
      text: person.position,
    });
    const desc = createEl("p", { text: person.bio });
    card.append(img, name, position, desc);
    peoples.appendChild(card);
  });

  content.append(title, aboutContent, peopleTitle, peoples);
}
