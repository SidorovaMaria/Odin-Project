import { aboutMainText, aboutText } from "./data";
import "./global.css";
import { createEl } from "./helper";
import { createMenuContent } from "./menu";
import "./style.css";
import "./menu.css";
import "./about.css";
import { createAboutContent } from "./about";
/*
 * function createHomeScreen
 * Creates and renders the conent of he home page section.
 * This inlcudes restaurant info, about text, and button to navigate to the menu
 */
function createHomeContent() {
  const content = document.getElementById("content");

  // Info Section
  const aside = createEl("aside", {
    classes: ["info"],
    attrs: { "aria-labelledby": "home-title" },
  });
  // Restaurant title
  const title = createEl("h1", {
    attrs: { id: "home-title" },
    text: "Welcome Nōma",
  });
  // About Text
  const about = createEl("p", { text: aboutMainText });
  //  === Contact Info Section ===
  const contactInfo = createEl("div", { classes: ["contact-info"] });
  //   Hours
  const hours = createEl("p");
  hours.append(
    document.createTextNode("Open daily from "),
    createEl("span", { text: "11:00 PM" }),
    document.createTextNode(" to "),
    createEl("span", { text: "10:00 PM" })
  );
  //Address
  const address = createEl("p", {
    text: `123 Culinary Lane, Foodie City, FL 12345`,
  });
  //Phone
  const phone = createEl("p");
  const boldspanPhone = createEl("span");
  const phoneLink = createEl("a", {
    attrs: { href: "tel:+11234567890" },
    text: "(123) 456-7890",
  });
  boldspanPhone.appendChild(phoneLink);
  phone.append("Phone: ", boldspanPhone);
  // Email
  const email = createEl("p");
  const boldspan = createEl("span");
  const emailLink = createEl("a", {
    attrs: { href: "mailto:info@noma.com" },
    text: "info@noma.com",
  });
  boldspan.appendChild(emailLink);
  email.append("Email: ", boldspan);
  contactInfo.append(hours, address, phone, email);

  aside.appendChild(title);
  aside.append(about);
  aside.append(contactInfo);

  const buttonToMenu = createEl("button", {
    attrs: { id: "menu_button" },
    html: "Check Our Menu &#10140",
  });
  content.append(aside, buttonToMenu);
}
function contentControl() {
  let currentPage = "home";
  const home = document.getElementById("home_page");
  const menu = document.getElementById("menu_page");
  const about = document.getElementById("about_page");
  displayPage(currentPage);
  UpdateNavItem(home);
  home.addEventListener("click", () => {
    currentPage = "home";
    displayPage(currentPage);
    UpdateNavItem(home);
  });
  menu.addEventListener("click", () => {
    currentPage = "menu";
    displayPage(currentPage);
    UpdateNavItem(menu);
  });
  about.addEventListener("click", () => {
    currentPage = "about";
    displayPage(currentPage);
    UpdateNavItem(about);
  });
}

function displayPage(current) {
  const content = document.getElementById("content");
  content.innerHTML = "";

  if (current === "home") {
    content.classList.add("home");
    content.classList.remove("about");
    content.classList.remove("menu");
    createHomeContent();
    const navigateToMenu = document.getElementById("menu_button");
    const menuNavItem = document.getElementById("menu_page");
    navigateToMenu.addEventListener("click", () => {
      displayPage("menu");
      UpdateNavItem(menuNavItem);
    });
  } else if (current === "menu") {
    content.classList.remove("home");
    content.classList.remove("about");
    content.classList.add("menu");
    createMenuContent();
  } else if (current === "about") {
    content.classList.remove("home");
    content.classList.remove("menu");
    content.classList.add("about");
    createAboutContent();
  }
  return;
}
function UpdateNavItem(element) {
  const navItems = Array.from(document.querySelectorAll("nav button"));
  navItems.forEach((item) => item.classList.remove("active"));
  element.classList.add("active");
}

contentControl();
