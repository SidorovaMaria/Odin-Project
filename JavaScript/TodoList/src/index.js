import "./global.css";
import "./style.css";
import "./js/task";
import "./js/project";
import "./js/projectsList";
import { ProjectListView, ProjectsList } from "./js/projectsList";
import { Project } from "./js/project";
import { Task } from "./js/task";
import { loadState, saveState } from "./js/storage";
import { debounce } from "./js/helper";

let projectsList;
const saved = loadState();
if (saved) {
  projectsList = ProjectsList.fromJSON(saved);
} else {
  projectsList = new ProjectsList();
  const exampleProject = new Project("Welcome to Planerly!");
  const exampleTask = new Task(
    "This is an example task",
    "You can edit or delete it, and add new tasks using the + button. Or complete it by checking the circle box at the bottom!",
    new Date(),
    "Medium"
  );
  exampleTask.addChecklistItem("Check off items as you complete them");
  exampleTask.addChecklistItem("Edit tasks by clicking the edit icon");
  exampleTask.addChecklistItem("Delete tasks with the trash icon");
  exampleProject.addTask(exampleTask);
  projectsList.addProject(exampleProject);
  saveState(projectsList);
}
export const persist = () => saveState(projectsList);
const app = new ProjectListView(projectsList);
app.render();
