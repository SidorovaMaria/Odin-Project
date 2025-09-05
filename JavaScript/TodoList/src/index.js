import "./global.css";
import "./style.css";
import "./js/task";
import "./js/project";
import "./js/projectsList";
import { ProjectListView, ProjectsList } from "./js/projectsList";
import { Project } from "./js/project";
import { Task } from "./js/task";

const projectsList = new ProjectsList();

//SAMPLE DATA FOR VISUALIZATION PURPOSES
const exampleProject1 = new Project("Procrastination Station");
const exampleTask1 = new Task(
  "Triage the Todo Tsunami",
  "Sort the chaotic backlog into bite-sized, scheduled chunks.",
  new Date("2025-12-01"),
  "High"
);
exampleTask1.addChecklistItem("List all pending tasks");
const exampleTask2 = new Task(
  "Make the Plan Plan",
  "Create a weekly planning ritual and write it down.",
  new Date("2025-12-05"),
  "Medium"
);
exampleTask2.addChecklistItem("Choose a planning day");
exampleTask2.addChecklistItem("Set reminders");
exampleTask2.addChecklistItem("Review and adjust weekly");

const exampleTask3 = new Task(
  "Set Realistic Deadlines",
  "Establish achievable timelines to avoid burnout and ensure steady progress.",
  new Date("2025-12-10"),
  "Low"
);

exampleProject1.addTask(exampleTask1);
exampleProject1.addTask(exampleTask2);
exampleProject1.addTask(exampleTask3);
projectsList.addProject(exampleProject1);

const app = new ProjectListView(projectsList);
app.render();
