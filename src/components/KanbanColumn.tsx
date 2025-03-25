
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanTask } from "./KanbanTask";

// Export the Task interface so it can be imported properly
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  onDrop: (taskId: string, columnId: string) => void;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ 
  title, 
  tasks, 
  columnId, 
  onDrop,
  onTaskClick
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  
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
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  return (
    <div 
      className={cn(
        "kanban-column min-w-[280px] p-4 rounded-lg bg-background border border-border transition-colors animate-fade-in",
        isOver && "bg-secondary/80 border border-primary/20"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{title}</h3>
        <div className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
          {tasks.length}
        </div>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onClick={() => onTaskClick && onTaskClick(task)}
            className="cursor-pointer"
          >
            <KanbanTask task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}
