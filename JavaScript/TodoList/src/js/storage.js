export const STORAGE_KEY = "planerly-todo-application-data";

export function saveState(projectList) {
  try {
    const data = projectList.toJSON();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving state:", error);
  }
}
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data;
  } catch (error) {
    console.error("Error loading state:", error);
    return null;
  }
}
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing state:", error);
  }
}
