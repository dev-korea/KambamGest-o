
import { useState } from "react";
import { cn } from "@/lib/utils";
import { KanbanTask } from "./KanbanTask";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskDetailModal } from "./TaskDetailModal";
import { mapStatusToBoardFormat, mapStatusToColumnFormat, normalizeStatus } from "@/utils/taskStatusMapper";
import { useIsMobile } from "@/hooks/use-mobile";

// Export the Task interface so it can be imported properly
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "completed" | "pending" | "in_progress" | "in_review";
  dueDate: string;
  tags?: string[];
  notes?: string;
  projectId?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  linkedProjects?: string[];
  collaborators?: string[];
  completedDate?: string;
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  onDrop: (taskId: string, columnId: string) => void;
  onTaskClick?: (task: Task) => void;
  onUpdateNotes?: (taskId: string, notes: string) => void;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function KanbanColumn({ 
  title, 
  tasks, 
  columnId, 
  onDrop,
  onTaskClick,
  onUpdateNotes,
  onUpdateTask,
  onDeleteTask
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    onDrop(taskId, columnId);
    
    // Dispatch a custom event to inform other components about the task update
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const handleDetailModalOpenChange = (open: boolean) => {
    setIsDetailModalOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedTask(null);
      }, 300);
    }
  };

  const handleUpdateTask = (taskId: string, updatedTask: Partial<Task>) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, updatedTask);
      
      // Dispatch a custom event to inform other components about the task update
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      
      // If date is included, dispatch a date change event
      if ('dueDate' in updatedTask) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('taskDateChanged'));
        }, 100);
      }
    }
  };

  return (
    <>
      <div 
        className={cn(
          "kanban-column min-w-[250px] w-full md:min-w-[280px] md:w-[300px] p-3 md:p-4 rounded-lg bg-background border border-border transition-colors animate-fade-in",
          isOver && "bg-secondary/80 border border-primary/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="font-medium text-sm md:text-base">{title}</h3>
          <div className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
            {tasks.length}
          </div>
        </div>
        
        <div className="space-y-2 md:space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onClick={() => handleTaskCardClick(task)}
              className="cursor-pointer"
            >
              <KanbanTask 
                task={{
                  ...task,
                  status: normalizeStatus(task.status) as Task["status"]
                }} 
                onUpdateNotes={onUpdateNotes}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          open={isDetailModalOpen}
          onOpenChange={handleDetailModalOpenChange}
          task={selectedTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </>
  );
}
