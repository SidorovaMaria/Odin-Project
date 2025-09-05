import { v4 as uuid } from "uuid";
import { Task, TaskView } from "./task";
import { createEl, createIconBtn } from "./helper";
import DeleteIcon from "../assets/icons/delete.png";
import EditIcon from "../assets/icons/edit-text.png";
import AddIcon from "../assets/icons/add.png";
import CloseIcon from "../assets/icons/close.png";
import { format } from "date-fns";
class Project {
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
    proj._tasks = obj.tasks.map((taskObj) => {
      const task = new Task();
      task.fromJSON(taskObj);
      return task;
    });
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
    const btnContainer = createEl("div", { classes: ["project-btns"] });
    const editBtn = createIconBtn({
      icon: EditIcon,
      title: "Edit Project",
      action: "edit-project",
    });
    const deleteBtn = createIconBtn({
      icon: DeleteIcon,
      title: "Delete Project",
      action: "delete-project",
    });
    btnContainer.append(editBtn, deleteBtn);
    header.append(title, btnContainer);
    //Tasks Container
    const tasksContainer = createEl("div", { classes: ["tasks-container"] });
    this.container.appendChild(header);
    this.container.appendChild(tasksContainer);
    this._project.getTasks().forEach((task) => this.renderTask(task, tasksContainer));

    const addTaskBtn = createIconBtn({
      icon: AddIcon,
      title: "Add Task",
      action: "add-task-btn",
    });
    addTaskBtn.classList.add("add-task-btn");
    this.container.appendChild(addTaskBtn);

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
  renderEditTitleForm() {
    const overlay = createEl("div", {
      classes: ["overlay"],
      attrs: { id: "edit-project-overlay" },
    });
    const formWrapper = createEl("form", {
      classes: ["form-container"],
      attrs: { id: "edit-project-form", tabindex: "-1", novalidate: "true" },
    });
    //Header
    const formHeader = createEl("div", { classes: ["form-header"] });
    const title = createEl("h3", {
      text: `Editing Project `,
    });
    const titleText = createEl("span", { text: `"${this._project.getName()}"` });
    title.appendChild(titleText);
    const closeBtn = createIconBtn({
      icon: CloseIcon,
      title: "Close edit form",
      action: "close-edit-project-form",
    });
    formHeader.append(title, closeBtn);
    //Project name
    const ProjectNameContainer = createEl("div", {
      classes: ["input-container"],
    });
    const projectNameLabel = createEl("label", {
      text: "Project Name",
      attrs: { for: "edit-project-name" },
    });
    const projectNameInput = createEl("input", {
      attrs: {
        type: "text",
        id: "edit-project-name",
        name: "project-name",
        required: "true",
        maxlength: "50",
        value: this._project.getName(),
      },
    });
    const projectNameError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "edit-project-name-error" },
      text: "Project name cannot be empty or longer than 50 characters",
    });
    ProjectNameContainer.append(projectNameLabel, projectNameInput, projectNameError);
    const submitBtn = createEl("button", {
      classes: ["submit-btn"],
      attrs: {
        "container-data": this.formWrapper,
        type: "submit",
        title: "Save Changes",
        "data-action": "update-project",
      },
      text: "Save Changes",
    });
    formWrapper.append(formHeader, ProjectNameContainer, submitBtn);
    this.container.append(overlay, formWrapper);
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
      switch (action) {
        case "edit-project":
          this.renderEditTitleForm();
          break;
        case "close-edit-project-form":
          this.container.querySelector("#edit-project-overlay")?.remove();
          this.container.querySelector("#edit-project-form")?.remove();
          break;
        case "add-task-btn":
          this.renderAddTaskForm();
          break;
      }
    });
    this.container.addEventListener("submit", (e) => {
      if (e.target.id === "edit-project-form") {
        e.preventDefault();
        const nameInput = e.target.querySelector("input[name='project-name']");
        const form = e.target.closest("form");
        try {
          this._project.setName(nameInput.value);
          this.container.querySelector("#edit-project-overlay")?.remove();
          this.container.querySelector("#edit-project-form")?.remove();
          const title = this.container.querySelector(".project-header h2");
          title.textContent = this._project.getName();
        } catch (error) {
          form.querySelector("#edit-project-name-error").classList.add("active");
          nameInput.classList.add("input-error");
        }
      }
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
        }
      }
    });
  }
}

// const task = new Task("Sample Task", "This is a sample task", new Date("2023-10-01"), "medium");
// const taskTwo = new Task(
//   "Sample Task Two",
//   "This is a sample task",
//   new Date("2025-10-01"),
//   "medium"
// );
// project.addTask(task);
// project.addTask(taskTwo);
// project.getTasks().forEach((t) => {
//   const taskView = new TaskView(t, {
//     root: document.body,
//     onDelete: (taskId) => {
//       project.removeTask(taskId);
//     },
//     onEdit: (updatedTask) => {
//       project.updateTaskById(updatedTask.getId(), updatedTask);
//     },
//   });
//   taskView.render();
// });
// const btn = document.createElement("button");
// btn.textContent = "Click Me";
// btn.addEventListener("click", () => {
//   console.log(project);
// });
// document.body.appendChild(btn);
const project = new Project("Sample Project");
const projectView = new ProjectView(project);
const task1 = new Task("Task 1", "Description 1", new Date("2026-01-01"), "High");
const task2 = new Task("Task 2", "Description 2", new Date("2026-01-02"), "Medium");
const task3 = new Task("Task 3", "Description 3", new Date("2026-01-03"), "Low");
project.addTask(task1);
project.addTask(task2);
project.addTask(task3);
projectView.render();
const checkBtn = document.createElement("button");
checkBtn.textContent = "Check Project State";
checkBtn.addEventListener("click", () => {
  console.log(project);
});
document.body.appendChild(checkBtn);
