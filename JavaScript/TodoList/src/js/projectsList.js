import { createEl, createIconBtn } from "./helper";
import { Project, ProjectView } from "./project";
import { Task } from "./task";
import CloseIcon from "../assets/icons/close.png";
import LogoIcon from "../assets/icons/logo.png";
import DeleteIcon from "../assets/icons/delete.png";
import AddIcon from "../assets/icons/add.png";
import EditIcon from "../assets/icons/edit-text.png";
import { add } from "date-fns";
export class ProjectsList {
  constructor(projects = []) {
    this._projects = projects;
    this._currentProject = null;
    projects.forEach((p) => this.addProject(p));
  }
  get projects() {
    return this._projects;
  }
  addProject(project) {
    if (!(project instanceof Project)) throw new Error("Invalid project");
    this._projects.push(project);
    if (!this._currentProject) this._currentProject = project;
  }
  removeProject(projectId) {
    const idx = this._projects.findIndex((p) => p.getId() === projectId);
    if (idx === -1) return null;
    const [removed] = this._projects.splice(idx, 1);
    if (this._currentProject && this._currentProject.getId() === projectId) {
      this._currentProject = this._projects[0] || null;
    }
    return removed;
  }
  setCurrentProject(projectId) {
    const project = this._projects.find((p) => p.getId() === projectId);
    if (!project) throw new Error("Project not found");
    this._currentProject = project;
  }
  getProjectsNames() {
    return this._projects.map((project) => project.name);
  }
  get currentProject() {
    return this._currentProject;
  }
  set currentProject(project) {
    if (project !== null && !(project instanceof Project)) throw new Error("Invalid project");
    this._currentProject = project;
  }
}
export class ProjectListView {
  constructor(projectsList, { onDelete = () => {}, onSelect = () => {} } = {}) {
    this.projectsList = projectsList;
    this.root = document.body;
    this.onDelete = onDelete;
    this.onSelect = onSelect;
    this._bound = false;
    this.sideBarEl = null;
    this.projectsUl = null;
    this.projectShowEl = null;
  }
  render() {
    this.root.innerHTML = "";
    this.renderSidebar();
    this.projectShowEl = createEl("section", { classes: ["project-show"] });
    if (this.projectsList.currentProject) {
      this.renderProjectView(this.projectsList.currentProject, this.projectShowEl);
    }
    this.root.appendChild(this.projectShowEl);
    if (!this._bound) {
      this.bindEvents();
      this._bound = true;
    }
  }
  renderSidebar() {
    this.sideBarEl = createEl("aside", { classes: ["sidebar"] });
    //Header
    const sidebarHeader = createEl("div", { classes: ["sidebar-header"] });
    const logo = createIconBtn({ icon: LogoIcon, title: "Logo", action: "logo" });
    const title = createEl("h1", { text: "Planerly" });
    sidebarHeader.append(logo, title);
    this.sideBarEl.append(sidebarHeader);

    //Projects list
    this.projectsUl = createEl("ul", { classes: ["projects-list"] });
    this.renderEmptyList(this.projectsUl);
    this.projectsList.projects.forEach((project) => {
      this.renderProjectListItems(project, this.projectsUl);
    });
    const addProjectBtn = createEl("button", {
      attrs: { id: "add-project-btn", type: "button", title: "Add Project", "data-action": "add" },
      text: "Add Project",
    });
    addProjectBtn.prepend(
      createEl("img", { classes: ["icon-btn"], attrs: { src: AddIcon, alt: "Add Project" } })
    );
    this.sideBarEl.append(sidebarHeader, this.projectsUl, addProjectBtn);
    this.root.appendChild(this.sideBarEl);
  }

  renderProjectListItems(project, root) {
    const isActive = project.getId() === this.projectsList.currentProject?.getId();
    const projectItem = createEl("li", {
      classes: ["project-item", isActive ? "active" : null].filter(Boolean),
      attrs: { "data-id": project.getId() },
    });
    const projectNavigation = createEl("button", {
      attrs: { type: "button", title: `Open ${project.getName()}`, "data-action": "select" },
      classes: ["project-navigation"],
      text: project.getName(),
    });
    const editBtn = createIconBtn({
      icon: EditIcon,
      title: `Edit ${project.getName()}`,
      action: "edit",
    });
    editBtn.classList.add("project-edit-btn");
    const deleteBtn = createIconBtn({
      icon: DeleteIcon,
      title: `Delete ${project.getName()}`,
      action: "delete",
    });
    deleteBtn.classList.add("project-delete-btn");
    projectItem.append(projectNavigation, editBtn, deleteBtn);
    root.appendChild(projectItem);
  }
  renderProjectView(project, root) {
    root.innerHTML = "";
    const projectShow = new ProjectView(project, {
      root: root,
      onEdit: () => {
        this.renderProjectListItems(project, this.projectsUl);
      },
    });
    projectShow.render();
  }
  renderEmptyList(root) {
    if (this.projectsList.projects.length === 0) {
      const noProjectsMsg = createEl("p", {
        attrs: { id: "no-projects-msg" },
        text: "No projects yet to display. Add a project to get started!",
      });
      root.appendChild(noProjectsMsg);
    } else {
      const noProjectsMsg = root.querySelector("#no-projects-msg");
      if (noProjectsMsg) {
        root.removeChild(noProjectsMsg);
      }
    }
  }
  renderEditTitleForm(project) {
    const overlay = createEl("div", {
      classes: ["overlay"],
      attrs: { id: "edit-project-overlay" },
    });
    const formWrapper = createEl("form", {
      classes: ["form-container"],
      attrs: {
        id: "edit-project-form",
        tabindex: "-1",
        novalidate: "true",
        "data-project-id": project.getId(),
      },
    });
    //Header
    const formHeader = createEl("div", { classes: ["form-header"] });
    const title = createEl("h3", {
      text: `Editing Project `,
    });
    const titleText = createEl("span", { text: `"${project.getName()}"` });
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
        value: project.getName(),
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
    this.root.append(overlay, formWrapper);
  }
  renderAddProjectForm() {
    const overlay = createEl("div", {
      classes: ["overlay"],
      attrs: { id: "add-project-overlay" },
    });
    const formWrapper = createEl("form", {
      classes: ["form-container"],
      attrs: { id: "add-project-form", tabindex: "-1", novalidate: "true" },
    });
    //Header
    const formHeader = createEl("div", { classes: ["form-header"] });
    const title = createEl("h3", {
      text: `Adding Project `,
    });
    const closeBtn = createIconBtn({
      icon: CloseIcon,
      title: "Close add form",
      action: "close-add-project-form",
    });
    formHeader.append(title, closeBtn);
    //Project name
    const ProjectNameContainer = createEl("div", {
      classes: ["input-container"],
    });
    const projectNameLabel = createEl("label", {
      text: "Project Name",
      attrs: { for: "add-project-name" },
    });
    const projectNameInput = createEl("input", {
      attrs: {
        type: "text",
        id: "add-project-name",
        name: "project-name",
        required: "true",
        maxlength: "50",
        value: "",
        placeholder: "Enter project name",
      },
    });
    const projectNameError = createEl("p", {
      classes: ["error-message"],
      attrs: { id: "add-project-name-error" },
      text: "Project name cannot be empty or longer than 50 characters",
    });
    ProjectNameContainer.append(projectNameLabel, projectNameInput, projectNameError);
    const submitBtn = createEl("button", {
      classes: ["submit-btn"],
      attrs: {
        "container-data": this.formWrapper,
        type: "submit",
        title: "Add Project",
        "data-action": "add-project",
      },
      text: "Add Project",
    });
    formWrapper.append(formHeader, ProjectNameContainer, submitBtn);
    this.root.append(overlay, formWrapper);
  }
  updateActiveProjectListItem(projectId) {
    if (!this.projectsUl) return;
    this.projectsUl.querySelectorAll(".project-item").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-id") === projectId);
    });
  }

  bindEvents() {
    this.root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");

      switch (action) {
        case "select": {
          const li = btn.closest(".project-item");
          if (!li) return;
          const projectId = li.getAttribute("data-id");
          if (projectId === this.projectsList.currentProject?.getId()) break;
          this.projectsList.setCurrentProject(projectId);
          this.updateActiveProjectListItem(projectId);
          this.renderProjectView(this.projectsList.currentProject, this.projectShowEl);
          this.onSelect(this.projectsList.currentProject);
          break;
        }
        case "add": {
          this.renderAddProjectForm();
          break;
        }
        case "edit": {
          const li = btn.closest(".project-item");
          const projectId = li.getAttribute("data-id");
          const project = this.projectsList.projects.find((p) => p.getId() === projectId);
          if (!project) break;
          this.renderEditTitleForm(project);
          break;
        }
        case "close-edit-project-form": {
          document.querySelector("#edit-project-overlay")?.remove();
          document.querySelector("#edit-project-form")?.remove();
          break;
        }
        case "delete": {
          const li = btn.closest(".project-item");
          if (!li) break;
          const projectId = li.getAttribute("data-id");
          const removed = this.projectsList.removeProject(projectId);
          li.remove();
          this.renderEmptyList(this.projectsUl);
          if (this.projectsList.currentProject) {
            const newId = this.projectsList.currentProject.getId();
            this.updateActiveProjectListItem(newId);
            this.renderProjectView(this.projectsList.currentProject, this.projectShowEl);
          } else {
            this.projectShowEl.innerHTML = "";
          }
          this.onDelete(removed);
          break;
        }
        case "close-add-project-form": {
          document.querySelector("#add-project-overlay")?.remove();
          document.querySelector("#add-project-form")?.remove();
          break;
        }
        default:
          break;
      }
    });
    this.root.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      let valid = true;
      if (form.id === "add-project-form") {
        const nameInput = form.querySelector("#add-project-name");
        const nameError = form.querySelector("#add-project-name-error");
        const name = nameInput.value.trim();
        const project = new Project();
        try {
          project.setName(name);
          nameError.classList.remove("active");
          nameInput.classList.remove("input-error");
        } catch (error) {
          nameError.classList.add("active");
          nameInput.classList.add("input-error");
          valid = false;
        }
        if (valid) {
          this.projectsList.addProject(project);
          this.renderProjectView(project, this.root.querySelector(".project-show"));
          this.root.querySelector("#add-project-form").remove();
          this.root.querySelector(".overlay").remove();
          this.renderEmptyList(this.root.querySelector(".projects-list"));
          this.renderProjectListItems(project, this.root.querySelector(".projects-list"));
        }
      }
      if (form.id === "edit-project-form") {
        const nameInput = form.querySelector("#edit-project-name");
        const nameError = form.querySelector("#edit-project-name-error");
        const name = nameInput.value.trim();
        const projectId = form.getAttribute("data-project-id");
        const listItem = this.projectsUl.querySelector(`li[data-id='${projectId}']`);

        const project = this.projectsList.projects.find((p) => p.getId() === projectId);
        let valid = true;
        if (!project) return;
        try {
          project.setName(name);
          nameError.classList.remove("active");
          nameInput.classList.remove("input-error");
        } catch (error) {
          nameError.classList.add("active");
          nameInput.classList.add("input-error");
          valid = false;
        }
        if (!valid) return;
        listItem.querySelector(".project-navigation").textContent = project.getName();
        this.root.querySelector("#edit-project-form").remove();
        this.root.querySelector(".overlay").remove();
        this.renderProjectView(project, this.root.querySelector(".project-show"));
      }
    });
  }
}
