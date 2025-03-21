
import { Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./KanbanColumn";

interface KanbanTaskProps {
  task: Task;
}

export function KanbanTask({ task }: KanbanTaskProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  return (
    <div 
      className="kanban-task animate-scale-in bg-white/80 backdrop-blur-sm"
      draggable
      onDragStart={handleDragStart}
    >
      <h4 className="font-medium mb-2">{task.title}</h4>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {task.description}
      </p>
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{task.dueDate}</span>
        </div>
        
        {task.assigned && (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
              {task.assigned.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
