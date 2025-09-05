import { v4 as uuid } from "uuid";
import { Task, TaskView } from "./task";
import { createEl, createIconBtn } from "./helper";
import DeleteIcon from "../assets/icons/delete.png";

import AddIcon from "../assets/icons/add.png";
import CloseIcon from "../assets/icons/close.png";
import { format } from "date-fns";
import { persist } from "..";
export class Project {
  constructor(name, tasks = []) {
    this._id = uuid();
    this._name = name;
    this._tasks = tasks;
    this._destroyed = false;
  }
  //  =====Getters and Setters=====
  getId() {
    return this._id;
  }
  getName() {
    return this._name;
  }
  setName(name) {
    const trimmedName = name.trim();
    if (trimmedName.length < 1) throw new Error("Project name cannot be empty");
    if (trimmedName.length > 50)
      throw new Error("Project name cannot be longer than 50 characters");
    this._name = trimmedName;
  }
  getTasks() {
    return this._tasks;
  }
  updateTaskById(taskId, newTask) {
    const index = this._tasks.findIndex((task) => task.getId() === taskId);
    if (index === -1) throw new Error("Task not found");
    if (!(newTask instanceof Task)) throw new Error("You can only add Task instances to Project");
    this._tasks[index] = newTask;
  }
  //  =====Methods=====
  getTaskById(taskId) {
    return this._tasks.find((task) => task.getId() === taskId);
  }
  addTask(task) {
    if (!(task instanceof Task)) throw new Error("You can only add Task instances to Project");
    this._tasks.push(task);
  }
  removeTask(taskId) {
    this._tasks = this._tasks.filter((task) => task.getId() !== taskId);
  }
  getTotalTasks() {
    return this._tasks.length;
  }
  getCompletedTasks() {
    return this._tasks.filter((task) => task.isCompleted()).length;
  }
  getHighPriorityTasks() {
    return this._tasks.filter((task) => task.getPriority() === "High");
  }
  getLowPriorityTasks() {
    return this._tasks.filter((task) => task.getPriority() === "Low");
  }
  getMediumPriorityTasks() {
    return this._tasks.filter((task) => task.getPriority() === "Medium");
  }
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      tasks: this._tasks.map((task) => task.toJSON()),
    };
  }

  static fromJSON(obj) {
    const proj = new Project(obj.name);
    proj._id = obj.id;
    proj._tasks = (obj.tasks || []).map((t) => Task.fromJSON(t));
    return proj;
  }
}
export class ProjectView {
  constructor(project, { onDelete = () => {}, onEdit = () => {}, root = document.body } = {}) {
    this._project = project;
    this.root = root;
    this.onDelete = onDelete;
    this.onEdit = onEdit;

    this.container = createEl("section", {
      classes: ["project-view"],
      attrs: { "data-project-id": this._project.getId() },
    });

    //State flags
    this._bound = false; // Whether events are already bound
    this._destroyed = false; // Whether the task view is destroyed
  }
  render() {
    this.container.innerHTML = ""; // Clear previous content
    const header = createEl("div", {
      classes: ["project-header"],
      attrs: {
        role: "heading",
      },
    });
    const title = createEl("h2", { text: this._project.getName() });
    const addBtn = createEl("button", {
      attrs: {
        id: "add-task-btn",
        "data-action": "add-task-btn",
        title: "Add Task",
        type: "button",
      },
      text: " Add Task",
    });
    addBtn.prepend(
      createEl("img", {
        classes: ["icon-btn"],
        attrs: { src: AddIcon, alt: "Add Task" },
      })
    );

    header.append(title, addBtn);
    //Tasks Container
    const tasksContainer = createEl("div", { classes: ["tasks-container"] });
    this.container.appendChild(header);
    this.container.appendChild(tasksContainer);
    this._project.getTasks().forEach((task) => this.renderTask(task, tasksContainer));

    if (!this.container.isConnected) {
      this.root.appendChild(this.container);
    }
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
  }
  renderTask(task, root) {
    const taskView = new TaskView(task, {
      root: root,
      onDelete: (taskId) => {
        this._project.removeTask(taskId);
      },
    });
    taskView.render();
  }

  renderAddTaskForm() {
    const overlay = createEl("div", {
      classes: ["overlay"],
      attrs: { tabindex: "-1", id: "add-task-overlay" },
    });
    const formWrapper = createEl("div", {
      classes: ["form-container"],
      attrs: { id: "add-task-form-container", tabindex: "-1" },
    });
    //Header
    const formHeader = createEl("div", { classes: ["form-header"] });
    const title = createEl("h3", {
      text: `Adding Task `,
    });
    const closeBtn = createIconBtn({
      icon: CloseIcon,
      title: "Close add task form",
      action: "close-add-task-form",
    });
    formHeader.append(title, closeBtn);
    //END Header

    const form = createEl("form", {
      classes: ["add-task-form"],
      attrs: { novalidate: "true", id: "add-task-form" },
    });
    // Title input
    const titleInputContainer = createEl("div", {
      classes: ["input-container"],
    });
    const titleLabel = createEl("label", {
      text: "Title",
      attrs: { for: "add-title" },
    });
    const titleInput = createEl("input", {
      attrs: {
        type: "text",
        id: "add-title",
        name: "title",
        required: "true",
        maxlength: "50",
        value: "",
      },
    });
    const titleError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "add-form-title-error" },
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
        id: "add-description",
        name: "description",
        required: "true",
        minlength: "10",
        rows: "4",
      },
      text: "",
    });
    const descError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "add-form-desc-error" },
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
      attrs: { for: "add-due-date" },
    });
    const dueDateInput = createEl("input", {
      attrs: {
        type: "date",
        id: "add-due-date",
        name: "dueDate",
        required: "true",
        value: format(new Date(), "yyyy-MM-dd"),
        min: format(new Date(), "yyyy-MM-dd"),
      },
    });
    const dueDateError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "add-form-due-date-error" },
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
      attrs: { for: "add-priority" },
    });
    const prioritySelect = createEl("select", {
      attrs: { id: "add-priority", name: "priority", required: "true" },
    });
    ["Low", "Medium", "High"].forEach((level) => {
      const option = createEl("option", {
        attrs: { value: level, selected: level === "Medium" },
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
        "data-action": "add-task",
      },
      text: "Add Task",
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
  destroy() {
    //to be implemented
  }
  bindEvents() {
    if (this._bound) return;
    this.container.addEventListener("click", (e) => {
      const action = e.target.closest("button[data-action]")?.getAttribute("data-action");
      console.log(action);
      switch (action) {
        case "close-edit-project-form":
          this.container.querySelector("#edit-project-overlay")?.remove();
          this.container.querySelector("#edit-project-form")?.remove();
          break;
        case "add-task-btn":
          this.renderAddTaskForm();
          break;
        case "close-add-task-form":
          this.container.querySelector("#add-task-overlay")?.remove();
          this.container.querySelector("#add-task-form-container")?.remove();
          break;
        default:
          break;
      }
    });
    this.container.addEventListener("submit", (e) => {
      if (e.target.id === "add-task-form") {
        e.preventDefault();
        const titleInput = e.target.querySelector("input[name='title']");
        const descInput = e.target.querySelector("textarea[name='description']");
        const dueDateInput = e.target.querySelector("input[name='dueDate']");
        const prioritySelect = e.target.querySelector("select[name='priority']");
        const form = e.target.closest("form");
        let valid = true;
        const task = new Task();
        try {
          task.setTitle(titleInput.value);
          form.querySelector("#add-form-title-error").classList.remove("active");
          titleInput.classList.remove("input-error");
        } catch (error) {
          form.querySelector("#add-form-title-error").classList.add("active");
          titleInput.classList.add("input-error");
          valid = false;
        }
        try {
          task.setDescription(descInput.value);
          form.querySelector("#add-form-desc-error").classList.remove("active");
          descInput.classList.remove("input-error");
        } catch (error) {
          form.querySelector("#add-form-desc-error").classList.add("active");
          descInput.classList.add("input-error");
          valid = false;
        }
        try {
          task.setDueDate(new Date(dueDateInput.value));
          form.querySelector("#add-form-due-date-error").classList.remove("active");
          dueDateInput.classList.remove("input-error");
        } catch (error) {
          form.querySelector("#add-form-due-date-error").classList.add("active");
          dueDateInput.classList.add("input-error");
          valid = false;
        }
        try {
          task.setPriority(prioritySelect.value);
        } catch (error) {
          valid = false;
        }
        if (valid) {
          this._project.addTask(task);
          const tasksContainer = this.container.querySelector(".tasks-container");
          this.renderTask(task, tasksContainer);
          this.container.querySelector("#add-task-overlay")?.remove();
          this.container.querySelector("#add-task-form-container")?.remove();
          persist();
        }
      }
    });
  }
}
