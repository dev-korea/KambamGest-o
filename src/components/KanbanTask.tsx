
import { Clock, Tag, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Task } from "./KanbanColumn";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface KanbanTaskProps {
  task: Task;
  onNotesChange?: (taskId: string, notes: string) => void;
}

export function KanbanTask({ task, onNotesChange }: KanbanTaskProps) {
  const [notes, setNotes] = useState(task.notes || "");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const saveNotes = () => {
    if (onNotesChange) {
      onNotesChange(task.id, notes);
    }
    setIsNotesOpen(false);
  };
  
  // Calcular progresso das subtarefas se existirem
  const calculateProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / task.subtasks.length) * 100;
  };
  
  const subtasksProgress = calculateProgress();

  return (
    <div 
      className="kanban-task animate-scale-in bg-background/90 backdrop-blur-sm dark:bg-background/50 dark:border dark:border-border"
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
      
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Subtarefas:</span>
            <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
          </div>
          <Progress value={subtasksProgress} className="h-1.5" />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{task.dueDate}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Anotações da Tarefa</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Adicione suas anotações aqui..."
                  className="min-h-[150px]"
                />
                <Button onClick={saveNotes}>Salvar Anotações</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {task.assignee && (
            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
              {task.assignee.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
