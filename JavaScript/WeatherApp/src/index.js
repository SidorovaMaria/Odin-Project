import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";
import "./reset.css";
import { getWeatherData, parseWeatherData } from "./js/api";
import "./js/ui";
import "./js/api";
import "./js/controller";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");
  import("./js/controller").then(({ mountController }) => {
    mountController(root);
  });
});
