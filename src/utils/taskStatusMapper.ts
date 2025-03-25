
import { format, parseISO } from "date-fns";

// Define types for task priority
export type TaskPriority = "low" | "medium" | "high";

// Define types for task status
export type TaskStatus = "todo" | "in-progress" | "completed";

// Define types for task data
export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigned?: string;
  projectId: string;
  subtasks?: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  notes?: string;
  tags?: string[];
  created: string;
}

// Map task priority to Tailwind classes
export const mapPriorityToClass = (priority: TaskPriority): string => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400";
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400";
  }
};

// Map task status to Tailwind classes
export const mapStatusToClass = (status: TaskStatus): string => {
  switch (status) {
    case "todo":
      return "border-l-4 border-slate-400";
    case "in-progress":
      return "border-l-4 border-indigo-500";
    case "completed":
      return "border-l-4 border-green-500";
    default:
      return "border-l-4 border-slate-400";
  }
};

// Format a due date
export const formatDueDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Sem data";
  
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Data inválida";
  }
};

// Format a date from a task
export const formatTaskDate = (task: TaskData): string => {
  const date = task.created ? new Date(task.created) : new Date();
  return format(date, "dd MMM yyyy");
};

