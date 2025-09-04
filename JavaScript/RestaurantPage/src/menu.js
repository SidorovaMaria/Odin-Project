import { menuItems } from "./data";
import { createEl } from "./helper";

export function createMenuContent() {
  {
    const menuItemsContainer = createEl("div", { classes: ["menu-items"] });
    const ourMenu = createEl("h1", { text: "Our Menu" });

    menuItems.forEach((item) => {
      const menuItem = createEl("div", { classes: ["menu-item"] });
      const img = createEl("img", {
        attrs: { src: item.image, alt: item.alt },
      });
      const name = createEl("h3", { text: item.name });
      const description = createEl("p", { text: item.description });
      const orderBtn = createEl("button", { text: "Order Now" });
      menuItem.append(img, name, description, orderBtn);
      menuItemsContainer.appendChild(menuItem);
    });
    document.getElementById("content").append(ourMenu, menuItemsContainer);
    requestAnimationFrame(() => {
      const x =
        (menuItemsContainer.scrollWidth - menuItemsContainer.clientWidth) / 2;
      menuItemsContainer.scrollLeft = x;
    });
  }
}
