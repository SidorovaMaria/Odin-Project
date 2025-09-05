import { v4 as uuid } from "uuid";
import { createEl, createIconBtn, getPrioritySymbol } from "./helper.js";
import deleteIcon from "../assets/icons/delete.png";
import EditIcon from "../assets/icons/edit-text.png";
import addIcon from "../assets/icons/add.png";
import UndoIcon from "../assets/icons/undo.png";
import closeIcon from "../assets/icons/close.png";
import { format } from "date-fns";
import { persist } from "../index.js";

const PRIORITIES = ["Low", "Medium", "High"];
const toYMD = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export class Task {
  constructor(title, description, dueDate, priority, completed = false, checklist = []) {
    //Unique identifier for each task
    this.id = uuid();

    //Task core details
    this._title = title;
    this._description = description;
    this._dueDate = dueDate;
    this._priority = priority;

    //Status tracking
    this._completed = completed; // Boolean – task done or not
    this._checklist = checklist; // Array of checklist items {text, completed, id}
    this._createdAt = new Date(); // Timestamp when task was created
    this._destroyed = false; // Lifecycle flag
  }

  // ======== Getters and Setters with validation ========
  getTitle() {
    return this._title;
  }
  setTitle(title) {
    if (!title || title.trim() === "") throw new Error("Title cannot be empty");
    if (title.length > 50) throw new Error("Title cannot be longer than 50 characters");
    this._title = title;
  }

  getDescription() {
    return this._description;
  }
  setDescription(description) {
    if (!description || description.trim() === "") throw new Error("Description cannot be empty");
    if (description.length < 10)
      throw new Error("Description should be at least 10 characters long");
    this._description = description;
  }

  getDueDate() {
    return this._dueDate;
  }
  setDueDate(dueDate) {
    //Ensure dueDate is a valid Date object
    if (!(dueDate instanceof Date) || Number.isNaN(dueDate.getTime())) {
      throw new Error("Invalid date");
    }
    // Normalize to midnight and disallow past dates
    const today = toYMD(new Date());
    const candidate = toYMD(dueDate);
    if (candidate < today) {
      throw new Error("Due date cannot be in the past");
    }
    this._dueDate = dueDate;
  }
  getPriority() {
    return this._priority;
  }
  setPriority(priority) {
    if (!PRIORITIES.includes(priority)) throw new Error(`Such priority does not exist`);
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

  // ======== Domain Methods ========
  destroy() {
    this._destroyed = true;
  }
  //Method to toggle the completed status of the task
  toggleCompleted() {
    this._completed = !this._completed;
  }
  // Add a checklist item (auto-generates id)
  addChecklistItem(item) {
    const text = String(item ?? "").trim();
    if (!text) throw new Error("Checklist item cannot be empty");
    const checklistItem = { text: item, completed: false, id: uuid() };
    this._checklist.push(checklistItem);
  }
  //Method to toggle the completed status of a checklist item
  toggleChecklistItem(id) {
    const index = this._checklist.findIndex((item) => item.id === id);
    if (index !== -1) this._checklist[index].completed = !this._checklist[index].completed;
  }

  //Remove checklist item by id
  removeChecklistItem(id) {
    this._checklist = this._checklist.filter((item) => item.id !== id);
  }
  // Human-readable time since creation (e.g. “3 hours ago”)
  getTimeSinceCreation() {
    const now = new Date();
    const diffMs = now - this._createdAt.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return "less than 1 minute ago";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  // Mark all checklist items complete/incomplete
  completeAllChecklistItems() {
    this._checklist.forEach((item) => (item.completed = true));
  }
  uncompleteAllChecklistItems() {
    this._checklist.forEach((item) => (item.completed = false));
  }
  // Serialize task to JSON-friendly object
  toJSON() {
    return {
      id: this.id,
      title: this._title,
      description: this._description,
      dueDate: this._dueDate.toISOString(),
      priority: this._priority,
      completed: this._completed,
      checklist: this._checklist,
      createdAt: this._createdAt.toISOString(),
    };
  }
  // Hydrate task instance from JSON
  static fromJSON(json) {
    const task = new Task(
      json.title,
      json.description,
      new Date(json.dueDate),
      json.priority,
      Boolean(json.completed),
      Array.isArray(json.checklist) ? json.checklist : []
    );
    task.id = json.id; // Preserve original ID
    task._createdAt = json.createdAt ? new Date(json.createdAt) : new Date();
    return task;
  }
}

/**
 * TaskView class – manages rendering Task state into the DOM,
 * binding event listeners, and updating UI when Task changes.
 */
export class TaskView {
  constructor(task, { onDelete = () => {}, onEdit = () => {}, root = document.body } = {}) {
    this.task = task;
    this.root = root;
    this.onDelete = onDelete;
    this.onEdit = onEdit;

    //Main container for the task's DOM elements
    this.container = createEl("article", {
      classes: [
        "task",
        `${this.task.getPriority().toLowerCase()}-priority`,
        `${this.task.isCompleted() && "completed"}`,
      ],
      attrs: {
        "data-task-id": this.task.getId(),
      },
    });
    // Cached DOM elements for easy access
    this.headerEl = null;
    this.descEl = null;
    this.checkListWrapper = null;
    this.timeEl = null;
    this.completedToggle = null;

    //State flags
    this._bound = false; // Whether events are already bound
    this._createdTime = null; // Interval ID for “created at” updater
    this._destroyed = false; // Whether the task view is destroyed
  }
  //===== RENDERING METHODS =======
  renderChecklist() {
    this.checkListWrapper.innerHTML = "";

    //Header Section with Add Button
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
    // CheckList Section: either empty message or list of items
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
        // Checklist item structure: checkbox, text, delete button
        // Checkbox
        const label = createEl("label", { classes: ["checklist-label"] });
        const checkbox = createEl("input", {
          attrs: {
            type: "checkbox",
            "data-action": "toggle-check",
            "data-check-id": item.id,
            ...(item.completed ? { checked: "" } : {}),
          },
        });
        const styleCheck = createEl("span", { classes: ["style-check"] });
        label.append(checkbox, styleCheck);
        // Text and delete button
        const p = createEl("p", { text: item.text });
        const delBtn = createEl("button", {
          classes: ["icon-btn"],
          attrs: {
            "data-action": "delete-check",
            "data-check-id": item.id,
            title: "Delete checklist item",
          },
        });
        delBtn.append(createEl("img", { attrs: { src: deleteIcon, alt: "Delete" } }));

        li.append(label, p, delBtn);
        ul.appendChild(li);
      });
      content.appendChild(ul);
    }
    this.checkListWrapper.append(header, content);
  }
  // Return emoji for priority level

  //Live-update created-at text every minute
  renderCreatedAt() {
    const update = () => {
      if (!this.timeEl) return;
      this.timeEl.textContent = this.task.getTimeSinceCreation();
    };
    update();
    if (this._createdTime) return;
    this._createdTime = setInterval(update, 60000);
  }
  // Show due date + task completion checkbox
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
  // Full Render of task card
  render() {
    this.container.innerHTML = "";
    // Title + edit/delete buttons
    const titleText = `${getPrioritySymbol(this.task.getPriority())} ${this.task.getTitle()}`;
    const titleEl = createEl("h3", { text: titleText });
    this.descEl = createEl("p", { text: this.task.getDescription() });

    const editBtn = createIconBtn({
      icon: EditIcon,
      title: "Edit task",
      action: "edit-task",
    });
    const deleteBtn = createIconBtn({
      icon: deleteIcon,
      title: "Delete task",
      action: "delete-task",
    });
    const btns = createEl("div", { classes: ["button-container"] });
    btns.append(editBtn, deleteBtn);

    const top = createEl("div", { classes: ["top-container"] });
    top.append(titleEl, btns);

    //Checklist section
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

    //Mount everything
    this.renderChecklist();
    this.renderCreatedAt();
    this.renderCompletedDue();
    this.container.append(top, this.descEl, this.checkListWrapper, timeText, this.completedToggle);
    // Append to root if not already attached
    if (!this.container.isConnected) {
      this.root.appendChild(this.container);
    }
    // Bind events only once
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
  }
  // Remove task DOM + clean intervals
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._createdTime) {
      clearInterval(this._createdTime);
      this._createdTime = null;
    }
    this.container.remove();
  }
  // Render the Edit Task form
  renderEditTaskForm() {
    const overlay = createEl("div", {
      classes: ["overlay"],
      attrs: { tabindex: "-1", id: "edit-task-overlay" },
    });
    const formWrapper = createEl("div", {
      classes: ["form-container"],
      attrs: { id: "edit-task-form" },
    });
    //Header
    const formHeader = createEl("div", { classes: ["form-header"] });
    const title = createEl("h3", {
      text: `Editing Task `,
    });
    const titleText = createEl("span", { text: `"${this.task.getTitle()}"` });
    title.appendChild(titleText);
    const closeBtn = createIconBtn({
      icon: closeIcon,
      title: "Close edit form",
      action: "close-edit-form",
    });
    formHeader.append(title, closeBtn);
    //END Header

    const form = createEl("form", {
      classes: ["edit-task-form"],
      attrs: { novalidate: "true" },
    });
    // Title input
    const titleInputContainer = createEl("div", {
      classes: ["input-container"],
    });
    const titleLabel = createEl("label", {
      text: "Title",
      attrs: { for: "edit-title" },
    });
    const titleInput = createEl("input", {
      attrs: {
        type: "text",
        id: "edit-title",
        name: "title",
        required: "true",
        maxlength: "50",
        value: this.task.getTitle(),
      },
    });
    const titleError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "edit-form-title-error" },
      text: "Title cannot be empty or longer than 50 characters",
    });
    titleInputContainer.append(titleLabel, titleInput, titleError);
    // End Title input

    // Description input
    const descInputContainer = createEl("div", {
      classes: ["input-container"],
    });
    const descLabel = createEl("label", {
      text: "Description",
      attrs: { for: "edit-description" },
    });
    const descInput = createEl("textarea", {
      attrs: {
        id: "edit-description",
        name: "description",
        required: "true",
        minlength: "10",
        rows: "4",
      },
      text: this.task.getDescription(),
    });
    const descError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "edit-form-desc-error" },
      text: "Description should be at least 10 characters long",
    });
    descInputContainer.append(descLabel, descInput, descError);
    // End Description input
    // Due date input
    const dueDateInputContainer = createEl("div", {
      classes: ["input-container"],
    });
    const dueDateLabel = createEl("label", {
      text: "Due Date",
      attrs: { for: "edit-due-date" },
    });
    const dueDateInput = createEl("input", {
      attrs: {
        type: "date",
        id: "edit-due-date",
        name: "dueDate",
        required: "true",
        value: format(this.task.getDueDate(), "yyyy-MM-dd"),
        min: format(new Date(), "yyyy-MM-dd"),
      },
    });
    const dueDateError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "edit-form-due-date-error" },
      text: "Due date cannot be in the past or invalid",
    });
    dueDateInputContainer.append(dueDateLabel, dueDateInput, dueDateError);
    //End Due date input
    // Priority input
    const priorityInputContainer = createEl("div", {
      classes: ["input-container"],
    });
    const priorityLabel = createEl("label", {
      text: "Priority",
      attrs: { for: "edit-priority" },
    });
    const prioritySelect = createEl("select", {
      attrs: { id: "edit-priority", name: "priority", required: "true" },
    });
    ["Low", "Medium", "High"].forEach((level) => {
      const option = createEl("option", {
        attrs: { value: level, selected: this.task.getPriority() === level },
        text: level,
        classes: ["priority-option"],
      });
      prioritySelect.appendChild(option);
    });
    priorityInputContainer.append(priorityLabel, prioritySelect);
    //End Priority input
    const submitBtn = createEl("button", {
      classes: ["submit-btn"],
      attrs: {
        "container-data": this.formWrapper,
        type: "submit",
        title: "Save Changes",
        "data-action": "update-task",
      },
      text: "Save Changes",
    });

    form.append(
      titleInputContainer,
      descInputContainer,
      dueDateInputContainer,
      priorityInputContainer,
      submitBtn
    );
    formWrapper.append(formHeader, form);
    this.container.append(overlay, formWrapper);
  }
  // Render the Add Checklist Item form
  renderAddChecklistItemForm() {
    const container = this.checkListWrapper.querySelector(".checklist-content");
    const form = createEl("form", { classes: ["checklist-form"] });
    const input = createEl("input", {
      classes: ["checklist-input"],
      attrs: { type: "text", placeholder: "Drink coffee", required: "true" },
    });
    const addBtn = createIconBtn({
      icon: addIcon,
      title: "Add checklist item",
      action: "add-checklist-item",
    });
    const errorMsg = createEl("p", {
      classes: ["checklist-error-msg"],
      text: "Please enter a valid checklist item",
    });

    const undoBtn = createIconBtn({
      icon: UndoIcon,
      title: "Undo add Checklist Item",
      action: "undo-add-checklist-item",
    });

    const btns = createEl("div", { classes: ["form-btns"] });
    btns.append(undoBtn, addBtn);
    form.append(input, btns);
    container.append(form, errorMsg);
  }
  // ===== EVENT BINDING =======
  bindEvents() {
    //Delegate click events
    this.container.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      switch (action) {
        // Delete task
        case "delete-task":
          this.onDelete(this.task.getId());
          this.destroy();
          persist();
          break;
        // Edit task
        case "edit-task":
          this.renderEditTaskForm();
          break;
        // Add checklist item form
        case "add-checklist-form":
          if (!this.checkListWrapper.querySelector(".checklist-form")) {
            this.renderAddChecklistItemForm();
          }
          break;
        // Delete checklist item
        case "delete-check":
          const id = btn.getAttribute("data-check-id");
          this.task.removeChecklistItem(id);
          this.renderChecklist();
          persist();
          break;
        // Undo add checklist item form
        case "undo-add-checklist-item":
          this.renderChecklist();
          break;
        // Add checklist item submission
        case "add-checklist-item":
          e.preventDefault();
          const form = btn.closest("form");
          const input = form.querySelector("input");
          const value = input.value.trim();
          form.classList.remove("error");
          if (value) {
            this.task.addChecklistItem(value);
            this.renderChecklist();
          } else {
            form.classList.add("error");
          }
          persist();
          break;
        // Close edit task form
        case "close-edit-form":
          document.querySelector("#edit-task-overlay")?.remove();
          document.querySelector("#edit-task-form")?.remove();
          break;
      }
    });
    // Checkbox state changes (toggle check or task completion)
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
        persist();
      }
    });
    // Form submission for editing task
    this.container.addEventListener("submit", (e) => {
      const form = e.target.closest("form");
      if (!form) return;
      e.preventDefault();
      if (form.classList.contains("edit-task-form")) {
        //Edit task form submission
        const titleInput = form.querySelector("input[name='title']");
        const descInput = form.querySelector("textarea[name='description']");
        const dueDateInput = form.querySelector("input[name='dueDate']");
        const prioritySelect = form.querySelector("select[name='priority']");
        let valid = true;

        // Validate Title
        try {
          this.task.setTitle(titleInput.value);
          form.querySelector("#edit-form-title-error").classList.remove("active");
          titleInput.classList.remove("input-error");
        } catch (error) {
          valid = false;
          console.log("title error catched");
          form.querySelector("#edit-form-title-error").classList.add("active");
          titleInput.classList.add("input-error");
        }
        // Validate Description
        try {
          this.task.setDescription(descInput.value);
          form.querySelector("#edit-form-desc-error").classList.remove("active");
          descInput.classList.remove("input-error");
        } catch (error) {
          valid = false;
          form.querySelector("#edit-form-desc-error").classList.add("active");
          descInput.classList.add("input-error");
        }
        // Validate Due Date
        try {
          this.task.setDueDate(new Date(dueDateInput.value));
          form.querySelector("#edit-form-due-date-error").classList.remove("active");
          dueDateInput.classList.remove("input-error");
        } catch (error) {
          valid = false;
          form.querySelector("#edit-form-due-date-error").classList.add("active");
          dueDateInput.classList.add("input-error");
        }
        // Priority (no validation needed as it's a select with fixed options)
        this.container.classList.remove(`${this.task.getPriority().toLowerCase()}-priority`);
        this.task.setPriority(prioritySelect.value);
        this.container.classList.add(`${this.task.getPriority().toLowerCase()}-priority`);

        if (valid) {
          this.render();
          document.querySelector("#edit-task-overlay")?.remove();
          document.querySelector("#edit-task-form")?.remove();
          persist();
        }
      }
    });
  }
}
