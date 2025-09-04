import { v4 as uuid } from "uuid";
class Project {
  constructor(name, tasks = []) {
    this.id = uuid();
    this.name = name;
    this.tasks = tasks;
  }
}
