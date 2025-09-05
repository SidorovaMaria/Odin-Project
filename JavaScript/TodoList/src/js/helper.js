export function createEl(tag, { classes = [], attrs = {}, text, html } = {}) {
  const node = document.createElement(tag);
  if (classes.length) node.classList.add(...classes);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  if (html != null) node.innerHTML = html;
  return node;
}

export function createIconBtn({ icon, title, action }) {
  return createEl("button", {
    html: `<img src='${icon}' alt='${title}'/> `,
    classes: ["icon-btn"],
    attrs: {
      type: "button",
      title: title,
      "data-action": action,
    },
  });
}

export const getPrioritySymbol = (priority) => {
  switch (priority) {
    case "Low":
      return "🟢";
    case "Medium":
      return "🟠";
    case "High":
      return "🔴";
    default:
      return "";
  }
};
