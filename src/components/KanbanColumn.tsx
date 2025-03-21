
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanTask } from "./KanbanTask";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  tags: string[];
  assigned?: {
    name: string;
    avatar: string;
  };
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  columnId: string;
  onDrop: (taskId: string, columnId: string) => void;
}

export function KanbanColumn({ title, tasks, columnId, onDrop }: KanbanColumnProps) {
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

  return (
    <div 
      className={cn(
        "kanban-column transition-colors animate-fade-in",
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
          <KanbanTask key={task.id} task={task} />
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 flex items-center justify-center gap-1 rounded-md border border-dashed border-muted-foreground/30 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors">
        <Plus className="h-4 w-4" />
        <span>Add Task</span>
      </button>
    </div>
  );
}
