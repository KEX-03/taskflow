
// Format a due date as "31 Oct 2026"
export const formatDueDate = (dueDate) =>
  new Date(`${dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

// Get today's date in the user's local timezone as YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Check whether a task is overdue
export const isOverdue = (task) => {
  if (!task.dueDate || task.status === "done") {
    return false;
  }

  return task.dueDate.slice(0, 10) < getTodayDate();
};

// Check whether a task is due today
export const isDueToday = (task) => {
  if (!task.dueDate || task.status === "done") {
    return false;
  }

  return task.dueDate.slice(0, 10) === getTodayDate();
};
