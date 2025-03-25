// Undo system for tracking and reverting user actions
import { toast } from "sonner";

// Define action types that can be undone
export type UndoableActionType = 'DELETE_TASK' | 'MOVE_TASK' | 'UPDATE_TASK' | 'ADD_TASK';

// Interface for action that can be undone
export interface UndoableAction {
  type: UndoableActionType;
  projectId: string;
  payload: any; // Original state/data before the action
  timestamp: number;
}

// Maximum number of actions to keep in history
const MAX_HISTORY_LENGTH = 20;

class UndoSystem {
  private actionHistory: UndoableAction[] = [];
  private isListenerActive = false;
  
  constructor() {
    this.init();
  }
  
  // Initialize the undo system
  private init() {
    if (!this.isListenerActive && typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      this.isListenerActive = true;
    }
  }
  
  // Clean up when not needed
  public destroy() {
    if (this.isListenerActive && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.isListenerActive = false;
    }
  }
  
  // Handle keyboard shortcuts
  private handleKeyDown = (event: KeyboardEvent) => {
    // Check for Ctrl+Z (Windows/Linux) or Command+Z (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      this.undo();
    }
  }
  
  // Record an action that can be undone later
  public addAction(action: UndoableAction): void {
    this.actionHistory.unshift(action);
    
    // Trim the history if it gets too long
    if (this.actionHistory.length > MAX_HISTORY_LENGTH) {
      this.actionHistory = this.actionHistory.slice(0, MAX_HISTORY_LENGTH);
    }
  }
  
  // Undo the most recent action
  public undo(): void {
    if (this.actionHistory.length === 0) {
      toast.info("Nothing to undo");
      return;
    }
    
    const action = this.actionHistory.shift();
    if (!action) return;
    
    try {
      switch (action.type) {
        case 'DELETE_TASK':
          this.undoTaskDeletion(action);
          break;
        case 'MOVE_TASK':
          this.undoTaskMove(action);
          break;
        case 'UPDATE_TASK':
          this.undoTaskUpdate(action);
          break;
        case 'ADD_TASK':
          this.undoTaskAddition(action);
          break;
        default:
          toast.error("Cannot undo this action");
      }
    } catch (error) {
      console.error("Error undoing action:", error);
      toast.error("Failed to undo action");
    }
  }
  
  // Handle undoing task deletion
  private undoTaskDeletion(action: UndoableAction): void {
    const { projectId, payload: task } = action;
    const tasksKey = `tasks-${projectId}`;
    
    try {
      // Get current tasks
      const storedTasks = localStorage.getItem(tasksKey);
      const currentTasks = storedTasks ? JSON.parse(storedTasks) : [];
      
      // Add the deleted task back
      const updatedTasks = [...currentTasks, task];
      localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));
      
      // Trigger a custom event to notify components
      window.dispatchEvent(new CustomEvent('kanban-data-update', { 
        detail: { 
          type: 'UNDO_DELETE_TASK', 
          projectId 
        } 
      }));
      
      toast.success("Deleted task restored");
    } catch (error) {
      console.error("Error undoing task deletion:", error);
      throw error;
    }
  }
  
  // Handle undoing task move
  private undoTaskMove(action: UndoableAction): void {
    const { projectId, payload } = action;
    const { taskId, previousStatus } = payload;
    const tasksKey = `tasks-${projectId}`;
    
    try {
      // Get current tasks
      const storedTasks = localStorage.getItem(tasksKey);
      if (!storedTasks) throw new Error("No tasks found");
      
      const tasks = JSON.parse(storedTasks);
      
      // Find the task and revert its status
      const updatedTasks = tasks.map((task: any) => 
        task.id === taskId ? { ...task, status: previousStatus } : task
      );
      
      localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));
      
      // Trigger a custom event to notify components
      window.dispatchEvent(new CustomEvent('kanban-data-update', { 
        detail: { 
          type: 'UNDO_MOVE_TASK', 
          projectId 
        } 
      }));
      
      toast.success("Task movement undone");
    } catch (error) {
      console.error("Error undoing task move:", error);
      throw error;
    }
  }
  
  // Handle undoing task update
  private undoTaskUpdate(action: UndoableAction): void {
    const { projectId, payload: originalTask } = action;
    const tasksKey = `tasks-${projectId}`;
    
    try {
      // Get current tasks
      const storedTasks = localStorage.getItem(tasksKey);
      if (!storedTasks) throw new Error("No tasks found");
      
      const tasks = JSON.parse(storedTasks);
      
      // Find the task and revert it to original state
      const updatedTasks = tasks.map((task: any) => 
        task.id === originalTask.id ? originalTask : task
      );
      
      localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));
      
      // Trigger a custom event to notify components
      window.dispatchEvent(new CustomEvent('kanban-data-update', { 
        detail: { 
          type: 'UNDO_UPDATE_TASK', 
          projectId 
        } 
      }));
      
      toast.success("Task update undone");
    } catch (error) {
      console.error("Error undoing task update:", error);
      throw error;
    }
  }
  
  // Handle undoing task addition
  private undoTaskAddition(action: UndoableAction): void {
    const { projectId, payload: taskId } = action;
    const tasksKey = `tasks-${projectId}`;
    
    try {
      // Get current tasks
      const storedTasks = localStorage.getItem(tasksKey);
      if (!storedTasks) throw new Error("No tasks found");
      
      const tasks = JSON.parse(storedTasks);
      
      // Remove the added task
      const updatedTasks = tasks.filter((task: any) => task.id !== taskId);
      localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));
      
      // Trigger a custom event to notify components
      window.dispatchEvent(new CustomEvent('kanban-data-update', { 
        detail: { 
          type: 'UNDO_ADD_TASK', 
          projectId 
        } 
      }));
      
      toast.success("New task removed");
    } catch (error) {
      console.error("Error undoing task addition:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const undoSystem = new UndoSystem();
