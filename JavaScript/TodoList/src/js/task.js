import { v4 as uuid } from "uuid";
import { createEl } from "./helper.js";
import deleteIcon from "../assets/icons/delete.png";
import EditIcon from "../assets/icons/edit-text.png";
import addIcon from "../assets/icons/add.png";
import UndoIcon from "../assets/icons/undo.png";
import { format } from "date-fns";
export class Task {
  constructor(
    title,
    description,
    dueDate,
    priority,
    completed = false,
    checklist = []
  ) {
    //Unique identifier for each task
    this.id = uuid();
    //Task core details
    this._title = title;
    this._description = description;
    this._dueDate = dueDate;
    this._priority = priority;
    //Status tracking
    this._completed = completed; //Boolean to track if the task is completed
    this._checklist = checklist; //Array to hold checklist items
    this._createdAt = new Date(); //Timestamp to track when the task was created
  }

  // ======== Getters and Setters ========
  getTitle() {
    return this._title;
  }
  setTitle(title) {
    if (!title || title.trim() === "") {
      throw new Error("Title cannot be empty");
    }
    this._title = title;
  }
  getDescription() {
    return this._description;
  }
  setDescription(description) {
    if (!description || description.trim() === "") {
      throw new Error("Description cannot be empty");
    } else if (description.length < 10) {
      throw new Error("Description should be at least 10 characters long");
    }
    this._description = description;
  }
  getDueDate() {
    return this._dueDate;
  }
  setDueDate(dueDate) {
    if (!(dueDate instanceof Date) || isNaN(dueDate)) {
      throw new Error("Invalid date");
    } else if (dueDate < new Date()) {
      throw new Error("Due date cannot be in the past");
    }
    this._dueDate = dueDate;
  }
  getPriority() {
    return this._priority;
  }
  setPriority(priority) {
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Such priority does not exist`);
    }
    this._priority = priority;
  }
  isCompleted() {
    return this._completed;
  }
  getCreatedAt() {
    return this._createdAt;
  }
  getId() {
    return this.id;
  }
  getChecklist() {
    return this._checklist;
  }
  isChecklistEmpty() {
    return this._checklist.length === 0;
  }

  // ======== Methods ========

  //Method to toggle the completed status of the task
  toggleCompleted() {
    this._completed = !this._completed;
  }
  // Add checklist item
  addChecklistItem(item) {
    const text = String(item ?? "").trim();
    if (!text) {
      throw new Error("Checklist item cannot be empty");
    }
    const checklistItem = { text: item, completed: false, id: uuid() };
    this._checklist.push(checklistItem);
  }
  //Method to toggle the completed status of a checklist item
  toggleChecklistItem(id) {
    const index = this._checklist.findIndex((item) => item.id === id);
    if (index !== -1) {
      this._checklist[index].completed = !this._checklist[index].completed;
    }
  }
  //Remove checklist item by id
  removeChecklistItem(id) {
    this._checklist = this._checklist.filter((item) => item.id !== id);
  }
  getTimeSinceCreation() {
    const now = new Date();
    const diffInMs = now - this._createdAt;
    const diffinSeconds = Math.floor(diffInMs / 1000);
    if (diffinSeconds < 60) {
      return `less than 1 minute(s) ago`;
    }
    const diffInMinutes = Math.floor(diffinSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute(s) ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour(s) ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day(s) ago`;
  }
  completeAllChecklistItems() {
    this._checklist.forEach((item) => (item.completed = true));
  }
  uncompleteAllChecklistItems() {
    this._checklist.forEach((item) => (item.completed = false));
  }
}

class TaskView {
  constructor(
    task,
    { onDelete = () => {}, onEdit = () => {}, root = document.body } = {}
  ) {
    this.task = task;
    this.root = root;
    this.onDelete = onDelete;
    this.onEdit = onEdit;
    this.container = createEl("article", {
      classes: ["task"],
      attrs: {
        "data-task-id": this.task.getId(),
      },
    });
    this.headerEl = null;
    this.descEl = null;
    this.checkListWrapper = null;
    this.timeEl = null;
    this.completedToggle = null;
    this._bound = false;
    // this.mainContainer = document.querySelector("#tasks-container");
  }
  renderChecklist() {
    this.checkListWrapper.innerHTML = "";
    const header = createEl("div", { classes: ["checklist-header"] });
    const title = createEl("h4", { text: "Checklist" });
    const addBtn = createEl("button", {
      classes: ["icon-btn"],
      attrs: {
        "data-action": "add-checklist-form",
        title: "Add checklist item",
      },
      html: `<img src="${addIcon}" alt="Add">`,
    });
    header.append(title, addBtn);

    const content = createEl("div", { classes: ["checklist-content"] });
    if (this.task.isChecklistEmpty()) {
      content.appendChild(
        createEl("p", {
          text: "No checklist items",
          classes: ["empty-checklist-msg"],
        })
      );
    } else {
      const ul = createEl("ul", { classes: ["checklist"] });
      this.task.getChecklist().forEach((item) => {
        const li = createEl("li", {
          classes: ["checklist-item"],
          attrs: { "data-check-id": item.id },
        });
        li.innerHTML = `
        <label class='checklist-label'>
          <input type="checkbox" data-action="toggle-check" data-check-id="${
            item.id
          }" ${item.completed ? "checked" : ""}>
          <span class='style-check'></span>
        </label>
       <p>${item.text}</p>
       <button class='icon-btn' data-action='delete-check' data-check-id="${
         item.id
       }" title='Delete checklist item'>
         <img src='${deleteIcon}' alt='Delete'>
       </button>
        `;
        ul.appendChild(li);
      });
      content.appendChild(ul);
    }
    this.checkListWrapper.append(header, content);
  }
  getPrioritySymbol() {
    switch (this.task.getPriority()) {
      case "Low":
        return "🟢";
      case "Medium":
        return "🟠";
      case "High":
        return "🔴";
      default:
        return "";
    }
  }
  renderCreatedAt() {
    this.timeEl.textContent = `${this.task.getTimeSinceCreation()}`;
    setTimeout(() => {
      if (this.timeEl) {
        this.timeEl.textContent = `${this.task.getTimeSinceCreation()}`;
      }
      this.renderCreatedAt();
    }, 60000);
  }
  renderCompletedDue() {
    const completedLabel = createEl("label", { classes: ["completed-toggle"] });
    completedLabel.innerHTML = `
      <input type="checkbox" ${
        this.task.isCompleted() ? "checked" : ""
      } data-action='toggle-completed'>
       <span class='style-check'></span>
    `;
    const dueDateText = format(this.task.getDueDate(), "do MMM yyyy");
    const dueDate = createEl("p", {
      text: `Due:`,
      classes: ["due-date"],
    });
    dueDate.appendChild(createEl("span", { text: ` ${dueDateText}` }));
    this.completedToggle.append(dueDate, completedLabel);
  }
  render() {
    this.container.innerHTML = "";
    const titleText = `${this.getPrioritySymbol()} ${this.task.getTitle()}`;
    const titleEl = createEl("h3", { text: titleText });
    this.descEl = createEl("p", { text: this.task.getDescription() });

    const editBtn = createEl("button", {
      classes: ["icon-btn"],
      attrs: { "data-action": "edit-task", title: "Edit task" },
      html: `<img src="${EditIcon}" alt="Edit">`,
    });
    const deleteBtn = createEl("button", {
      classes: ["icon-btn"],
      attrs: { "data-action": "delete-task", title: "Delete task" },
      html: `<img src="${deleteIcon}" alt="Delete">`,
    });
    const btns = createEl("div", { classes: ["button-container"] });
    btns.append(editBtn, deleteBtn);

    const top = createEl("div", { classes: ["top-container"] });
    top.append(titleEl, btns);

    this.checkListWrapper = createEl("section", {
      classes: ["checklist-wrapper"],
    });
    const timeText = createEl("p", {
      text: "Created: ",
      classes: ["created-text"],
    });
    this.timeEl = createEl("span");
    this.completedToggle = createEl("div", { classes: ["completedDue"] });
    timeText.appendChild(this.timeEl);
    this.renderChecklist();
    this.renderCreatedAt();
    this.renderCompletedDue();
    this.container.append(
      top,
      this.descEl,
      this.checkListWrapper,
      timeText,
      this.completedToggle
    );
    if (!this.container.isConnected) {
      this.root.appendChild(this.container);
    }
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
  }

  renderAddChecklistItemForm() {
    const container = this.checkListWrapper.querySelector(".checklist-content");
    const form = createEl("form", { classes: ["checklist-form"] });
    const input = createEl("input", {
      classes: ["checklist-input"],
      attrs: { type: "text", placeholder: "Drink coffee", required: "true" },
    });
    const addBtn = createEl("button", {
      html: `<img src='${addIcon}' alt='Add'/> `,
      classes: ["icon-btn", "add-btn"],
      attrs: {
        type: "submit",
        title: "Add checklist item",
        "data-action": "add-checklist-item",
      },
    });
    const errorMsg = createEl("p", {
      classes: ["checklist-error-msg"],
      text: "Please enter a valid checklist item",
    });

    const undoBtn = createEl("button", {
      html: `<img src='${UndoIcon}' alt='Undo'/> `,
      classes: ["icon-btn", "undo-btn"],
      attrs: {
        type: "button",
        title: "Undo add Checklist Item",
        "data-action": "undo-add-checklist-item",
      },
    });

    const btns = createEl("div", { classes: ["form-btns"] });
    btns.append(undoBtn, addBtn);
    form.append(input, btns);
    container.append(form, errorMsg);
  }
  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      console.log(btn);

      const action = btn.getAttribute("data-action");
      switch (action) {
        case "delete-task":
          console.log("delete task");
          break;
        case "edit-task":
          console.log("editing task");
          break;
        case "add-checklist-form":
          if (!this.checkListWrapper.querySelector(".checklist-form")) {
            this.renderAddChecklistItemForm();
          }
          break;
        case "delete-check":
          const id = btn.getAttribute("data-check-id");
          this.task.removeChecklistItem(id);
          this.renderChecklist();
          break;
        case "undo-add-checklist-item":
          this.renderChecklist();
          break;
        case "add-checklist-item":
          e.preventDefault();
          const form = btn.closest("form");
          const input = form.querySelector("input");
          const value = input.value.trim();
          if (value) {
            this.task.addChecklistItem(value);
            this.renderChecklist();
          }
          form.classList.add("error");
          break;
      }
    });
    this.container.addEventListener("change", (e) => {
      const checkbox = e.target.closest("input[data-action]");
      if (!checkbox) return;
      const action = checkbox.getAttribute("data-action");
      if (action === "toggle-check") {
        const id = checkbox.getAttribute("data-check-id");
        this.task.toggleChecklistItem(id);
      } else if (action === "toggle-completed") {
        this.task.toggleCompleted();
        if (this.task.isCompleted()) {
          this.task.completeAllChecklistItems();
        } else {
          this.task.uncompleteAllChecklistItems();
        }
        this.renderChecklist();
        this.container.classList.toggle("completed", this.task.isCompleted());
      }
    });
  }
}

const task1 = new Task(
  "Finish Project",
  "Complete the project by the end of the week.",
  new Date("2023-10-20"),
  "High"
);
task1.addChecklistItem("Set up project structure");

const taskView1 = new TaskView(task1, {});
taskView1.render();
