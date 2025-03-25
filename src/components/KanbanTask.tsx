
import { Clock, Tag, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./KanbanColumn";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface KanbanTaskProps {
  task: Task;
  onUpdateNotes?: (taskId: string, notes: string) => void;
}

export function KanbanTask({ task, onUpdateNotes }: KanbanTaskProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const saveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(task.id, notes);
      toast("Anotações salvas", {
        description: "Suas anotações foram salvas com sucesso."
      });
    }
  };

  return (
    <div 
      className="kanban-task animate-scale-in bg-background/90 backdrop-blur-sm dark:bg-background/50 dark:border dark:border-border p-4 rounded-lg shadow-sm"
      draggable
      onDragStart={handleDragStart}
    >
      <h4 className="font-medium mb-2">{task.title}</h4>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {task.description}
      </p>
      
      {task.tags && task.tags.length > 0 && (
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
        
        {task.assignee && (
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
              {task.assignee.name.charAt(0)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-border">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowNotes(!showNotes);
          }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="h-3 w-3" />
          <span>{showNotes ? "Ocultar anotações" : "Mostrar anotações"}</span>
        </button>

        {showNotes && (
          <div className="mt-2 animate-fade-in">
            <Textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Adicione suas anotações aqui..."
              className="min-h-[80px] text-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  saveNotes();
                }}
                className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
