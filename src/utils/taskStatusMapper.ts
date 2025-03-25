
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
