
import { format, isValid, parse, isSameDay, isAfter, isBefore, subDays } from "date-fns";

// This utility ensures consistent mapping between different task status formats

// Maps statuses from KanbanBoard to KanbanColumn format
export function mapStatusToColumnFormat(status: string): "pending" | "in_progress" | "in_review" | "completed" {
  switch (status) {
    case "todo":
      return "pending";
    case "in-progress":
      return "in_progress";
    case "review":
      return "in_review";
    case "completed":
      return "completed";
    default:
      // If already in the correct format, return as is
      if (["pending", "in_progress", "in_review", "completed"].includes(status)) {
        return status as "pending" | "in_progress" | "in_review" | "completed";
      }
      // Default fallback
      return "pending";
  }
}

// Maps statuses from KanbanColumn to KanbanBoard format
export function mapStatusToBoardFormat(status: string): "todo" | "in-progress" | "review" | "completed" {
  switch (status) {
    case "pending":
      return "todo";
    case "in_progress":
      return "in-progress";
    case "in_review":
      return "review";
    case "completed":
      return "completed";
    default:
      // If already in the correct format, return as is
      if (["todo", "in-progress", "review", "completed"].includes(status)) {
        return status as "todo" | "in-progress" | "review" | "completed";
      }
      // Default fallback
      return "todo";
  }
}

// Unified status validation function
export function isValidStatus(status: string): boolean {
  return [
    "todo", "in-progress", "review", "completed",
    "pending", "in_progress", "in_review"
  ].includes(status);
}

// Helper function to ensure status is in a valid format
export function normalizeStatus(status: string): "todo" | "in-progress" | "review" | "completed" | "pending" | "in_progress" | "in_review" {
  if (isValidStatus(status)) {
    return status as "todo" | "in-progress" | "review" | "completed" | "pending" | "in_progress" | "in_review";
  }
  return "todo";
}

// Parse date from various formats to ensure consistency
export function parseDateString(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Handle edge cases
  if (dateString === 'Invalid Date' || dateString === 'NaN') return null;
  
  let result: Date | null = null;
  
  // Try direct Date parsing for ISO format (YYYY-MM-DD)
  if (dateString.includes('-')) {
    try {
      result = new Date(dateString);
      if (isValid(result)) return result;
      
      // Try explicit parsing for YYYY-MM-DD
      const [year, month, day] = dateString.split('-').map(Number);
      result = new Date(year, month - 1, day);
      if (isValid(result)) return result;
    } catch (e) {
      console.error("Error parsing ISO date:", e);
    }
  }
  
  // Try DD/MM/YYYY format
  if (dateString.includes('/')) {
    try {
      const [day, month, year] = dateString.split('/').map(Number);
      result = new Date(year, month - 1, day);
      if (isValid(result)) return result;
    } catch (e) {
      console.error("Error parsing date:", e);
    }
  }
  
  // Try epoch timestamp
  if (/^\d+$/.test(dateString)) {
    result = new Date(parseInt(dateString));
    if (isValid(result)) return result;
  }
  
  // Last resort, try any format
  result = new Date(dateString);
  return isValid(result) ? result : null;
}

// Format date consistently for display
export function formatDateForDisplay(date: Date | string | null): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseDateString(date) : date;
  
  if (!dateObj || !isValid(dateObj)) {
    return "";
  }
  
  return format(dateObj, 'dd/MM/yyyy');
}

// Check if a task is overdue
export function isTaskOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  
  const taskDate = parseDateString(dueDate);
  if (!taskDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return isBefore(taskDate, today);
}

// Check if a task is due today
export function isTaskDueToday(dueDate: string): boolean {
  if (!dueDate) return false;
  
  const taskDate = parseDateString(dueDate);
  if (!taskDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return isSameDay(taskDate, today);
}

// Check if a task was completed yesterday
export function wasCompletedYesterday(task: any): boolean {
  if (task.status !== "completed" && task.status !== "completed") return false;
  
  // Check if the task has a completedDate field
  if (task.completedDate) {
    try {
      const completedDate = new Date(task.completedDate);
      const yesterday = subDays(new Date(), 1);
      
      return isSameDay(completedDate, yesterday);
    } catch (e) {
      console.error("Error checking completion date:", e);
      return false;
    }
  }
  
  return false;
}

// Normalize date format for consistent storage - always use YYYY-MM-DD
export function normalizeDate(date: Date | string | null): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? parseDateString(date) : date;
  
  if (!dateObj || !isValid(dateObj)) {
    return "";
  }
  
  return format(dateObj, 'yyyy-MM-dd');
}
