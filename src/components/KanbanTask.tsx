
import { Clock, Tag, Pencil, Users, Link, UserPlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "./KanbanColumn";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KanbanTaskProps {
  task: Task;
  onUpdateNotes?: (taskId: string, notes: string) => void;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function KanbanTask({ task, onUpdateNotes, onUpdateTask, onDeleteTask }: KanbanTaskProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  const [showOptions, setShowOptions] = useState(false);
  const [projects, setProjects] = useState<{id: string, title: string}[]>([]);
  const [linkedProjects, setLinkedProjects] = useState<string[]>(task.linkedProjects || []);
  const [collaborators, setCollaborators] = useState<string[]>(task.collaborators || []);
  const [newCollaborator, setNewCollaborator] = useState("");
  
  // Carregar projetos do localStorage para vincular
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects);
      setProjects(parsedProjects.map((p: any) => ({ id: p.id, title: p.title })));
    }
  }, []);
  
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

  const toggleProjectLink = (projectId: string) => {
    let updatedLinks;
    if (linkedProjects.includes(projectId)) {
      updatedLinks = linkedProjects.filter(id => id !== projectId);
    } else {
      updatedLinks = [...linkedProjects, projectId];
    }
    
    setLinkedProjects(updatedLinks);
    
    if (onUpdateTask) {
      onUpdateTask(task.id, { linkedProjects: updatedLinks });
      toast(
        linkedProjects.includes(projectId) 
          ? "Vínculo removido" 
          : "Projeto vinculado",
        {
          description: linkedProjects.includes(projectId) 
            ? "Vínculo com o projeto removido com sucesso" 
            : "Projeto vinculado com sucesso"
        }
      );
    }
  };

  const addCollaborator = () => {
    if (!newCollaborator.trim()) return;
    
    if (collaborators.includes(newCollaborator)) {
      toast.error("Este colaborador já foi adicionado");
      return;
    }
    
    const updatedCollaborators = [...collaborators, newCollaborator];
    setCollaborators(updatedCollaborators);
    
    if (onUpdateTask) {
      onUpdateTask(task.id, { collaborators: updatedCollaborators });
      toast("Colaborador adicionado", {
        description: `${newCollaborator} foi adicionado à tarefa`
      });
    }
    
    setNewCollaborator("");
  };

  const removeCollaborator = (name: string) => {
    const updatedCollaborators = collaborators.filter(c => c !== name);
    setCollaborators(updatedCollaborators);
    
    if (onUpdateTask) {
      onUpdateTask(task.id, { collaborators: updatedCollaborators });
      toast("Colaborador removido", {
        description: `${name} foi removido da tarefa`
      });
    }
  };

  const handleDeleteTask = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
      toast("Tarefa excluída", {
        description: "A tarefa foi excluída com sucesso"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div 
      className="kanban-task animate-scale-in bg-background/90 backdrop-blur-sm dark:bg-background/50 dark:border dark:border-border p-4 rounded-lg shadow-sm"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{task.title}</h4>
        
        <div className="flex items-center gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
          </span>
          
          <Popover open={showOptions} onOpenChange={setShowOptions}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <span className="sr-only">Mais opções</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" fillRule="evenodd" d="M3.625 7.5a1.125 1.125 0 1 1-2.25 0a1.125 1.125 0 0 1 2.25 0Zm5 0a1.125 1.125 0 1 1-2.25 0a1.125 1.125 0 0 1 2.25 0ZM13.5 7.5a1.125 1.125 0 1 1-2.25 0a1.125 1.125 0 0 1 2.25 0Z" clipRule="evenodd"/></svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="grid gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Link className="mr-2 h-4 w-4" />
                      <span>Vincular projeto</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid gap-1 max-h-48 overflow-y-auto">
                      {projects.length > 0 ? (
                        projects.map(project => (
                          <div 
                            key={project.id} 
                            className="flex items-center justify-between p-1 hover:bg-secondary rounded"
                          >
                            <span className="text-sm truncate max-w-36">{project.title}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleProjectLink(project.id)}
                              className={linkedProjects.includes(project.id) ? "bg-primary/20" : ""}
                            >
                              {linkedProjects.includes(project.id) ? "Desvincular" : "Vincular"}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-2">
                          Nenhum projeto disponível
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>Colaboradores</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <Input 
                          value={newCollaborator}
                          onChange={(e) => setNewCollaborator(e.target.value)}
                          placeholder="Nome do colaborador"
                          className="h-8 text-sm"
                          onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                        />
                        <Button size="sm" onClick={addCollaborator} className="h-8">+</Button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {collaborators.length > 0 ? (
                          collaborators.map(name => (
                            <div 
                              key={name} 
                              className="flex items-center justify-between bg-secondary/50 p-1.5 rounded text-sm"
                            >
                              <span>{name}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => removeCollaborator(name)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground p-1">
                            Nenhum colaborador
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-destructive"
                  onClick={handleDeleteTask}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir tarefa</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
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

      {collaborators.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{collaborators.length} colaborador{collaborators.length > 1 ? 'es' : ''}</span>
        </div>
      )}

      {linkedProjects.length > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Link className="h-3 w-3" />
          <span>{linkedProjects.length} projeto{linkedProjects.length > 1 ? 's' : ''} vinculado{linkedProjects.length > 1 ? 's' : ''}</span>
        </div>
      )}

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
