import { v4 as uuid } from "uuid";
import { Task, TaskView } from "./task";
class Project {
  constructor(name, tasks = []) {
    this._id = uuid();
    this._name = name;
    this._tasks = tasks;
  }
  //  =====Getters and Setters=====
  getName() {
    return this._name;
  }
  setName(name) {
    if (name.length < 1) throw new Error("Project name cannot be empty");
    this._name = name.trim();
  }
  getTasks() {
    return this._tasks;
  }
  addTask(task) {
    if (!(task instanceof Task))
      throw new Error("You can only add Task instances to Project");
    this._tasks.push(task);
  }
  removeTask(taskId) {
    this._tasks = this._tasks.filter((task) => task.getId() !== taskId);
  }
}

const task1 = new Task(
  "Finish Project",
  "Complete the project by the end of the week.",
  new Date("2025-10-20"),
  "High"
);
task1.addChecklistItem("Set up project structure");
const taskView1 = new TaskView(task1, {});
task1.setTitle("Finish Project");
const project = new Project("Work", [task1]);
project.addTask(
  new Task(
    "Prepare Presentation",
    "Create slides for the upcoming presentation.",
    new Date("2025-10-22"),
    "Medium"
  )
);
project.getTasks().forEach((task) => {
  const taskView = new TaskView(task, {
    onDelete: (taskId) => {
      project.removeTask(taskId);
      console.log(project);
    },
  });
  taskView.render();
});
