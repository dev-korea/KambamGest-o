
import { Clock, BarChart, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  tasksCompleted: number;
  totalTasks: number;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export function ProjectCard({
  id,
  title,
  description,
  progress,
  dueDate,
  tasksCompleted,
  totalTasks,
  onClick,
  onDelete,
}: ProjectCardProps) {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="glass-card card-hover rounded-xl p-6 flex flex-col gap-4 cursor-pointer relative group"
    >
      {onDelete && (
        <Button
          variant="ghost" 
          size="icon"
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete project</span>
        </Button>
      )}
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">Project</span>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-in-out",
              progress < 25 ? "bg-red-400" : 
              progress < 75 ? "bg-amber-400" : 
              "bg-emerald-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BarChart className="h-3.5 w-3.5" />
          <span>{tasksCompleted}/{totalTasks} tasks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{dueDate}</span>
        </div>
      </div>
    </div>
  );
}
