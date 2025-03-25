
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "./KanbanColumn";
import { toast } from "sonner";
import { 
  Calendar, 
  Check, 
  ListCheck, 
  Pencil, 
  Users, 
  Link, 
  FileText
} from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskDetailModal({ 
  open, 
  onOpenChange, 
  task, 
  onUpdateTask, 
  onDeleteTask 
}: TaskDetailModalProps) {
  const [currentTask, setCurrentTask] = useState<Task>(task);
  const [notes, setNotes] = useState(task.notes || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<{name: string, email: string}[]>([]);
  
  // Load registered users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      setRegisteredUsers(JSON.parse(storedUsers));
    } else {
      // Create a default entry if none exists
      const defaultUsers = [
        { name: localStorage.getItem('username') || "Guest User", email: "user@example.com" }
      ];
      localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
      setRegisteredUsers(defaultUsers);
    }
  }, []);
  
  // Carregar projetos do localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects);
      setProjects(parsedProjects.map((p: any) => ({ id: p.id, title: p.title })));
    }
  }, []);

  // Atualizar estado local quando a tarefa externa mudar
  useEffect(() => {
    setCurrentTask(task);
    setNotes(task.notes || "");
  }, [task]);

  const updateTask = (updates: Partial<Task>) => {
    const updatedTask = { ...currentTask, ...updates };
    setCurrentTask(updatedTask);
    
    if (onUpdateTask) {
      onUpdateTask(task.id, updates);
    }
  };

  const handleSaveNotes = () => {
    updateTask({ notes });
    toast.success("Anotações salvas com sucesso");
  };

  const handleDueDateChange = (date: string) => {
    updateTask({ dueDate: date });
    toast.success("Data de entrega atualizada");
  };

  const handleDeleteTask = () => {
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
    
    if (onDeleteTask) {
      onDeleteTask(task.id);
      toast.success("Tarefa excluída com sucesso");
    }
  };

  const toggleProjectLink = (projectId: string) => {
    const linkedProjects = currentTask.linkedProjects || [];
    let updatedLinks;
    
    if (linkedProjects.includes(projectId)) {
      updatedLinks = linkedProjects.filter(id => id !== projectId);
      toast.success("Projeto desvinculado");
    } else {
      updatedLinks = [...linkedProjects, projectId];
      toast.success("Projeto vinculado");
    }
    
    updateTask({ linkedProjects: updatedLinks });
  };

  const addCollaborator = () => {
    if (!collaboratorEmail.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    
    // Check if email exists in registered users
    const foundUser = registeredUsers.find(user => 
      user.email.toLowerCase() === collaboratorEmail.toLowerCase()
    );
    
    if (!foundUser) {
      toast.error("Email não encontrado entre usuários registrados");
      return;
    }
    
    const collaborators = currentTask.collaborators || [];
    if (collaborators.includes(foundUser.name)) {
      toast.error("Este colaborador já foi adicionado");
      return;
    }
    
    const updatedCollaborators = [...collaborators, foundUser.name];
    updateTask({ collaborators: updatedCollaborators });
    setCollaboratorEmail("");
    toast.success(`${foundUser.name} adicionado como colaborador`);
  };

  const removeCollaborator = (name: string) => {
    const collaborators = currentTask.collaborators || [];
    const updatedCollaborators = collaborators.filter(c => c !== name);
    updateTask({ collaborators: updatedCollaborators });
    toast.success(`${name} removido dos colaboradores`);
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const subtasks = currentTask.subtasks || [];
    const newSubtaskItem = {
      id: `subtask-${Date.now()}`,
      title: newSubtask,
      completed: false
    };
    
    const updatedSubtasks = [...subtasks, newSubtaskItem];
    updateTask({ subtasks: updatedSubtasks });
    setNewSubtask("");
    toast.success("Item de checklist adicionado");
  };

  const toggleSubtask = (subtaskId: string) => {
    const subtasks = currentTask.subtasks || [];
    const updatedSubtasks = subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed } 
        : subtask
    );
    
    updateTask({ subtasks: updatedSubtasks });
  };

  const removeSubtask = (subtaskId: string) => {
    const subtasks = currentTask.subtasks || [];
    const updatedSubtasks = subtasks.filter(subtask => subtask.id !== subtaskId);
    updateTask({ subtasks: updatedSubtasks });
    toast.success("Item removido do checklist");
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Progresso';
      case 'in_review': return 'Em Revisão';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="flex gap-2 items-center mb-2">
                    <Input 
                      value={currentTask.title}
                      onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                      className="text-xl font-medium"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateTask({ title: currentTask.title });
                        setIsEditingTitle(false);
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-xl font-medium flex items-center gap-2 cursor-pointer hover:text-primary transition-colors mb-2"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <span>{currentTask.title}</span>
                    <Pencil className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(currentTask.priority)}`}>
                    {currentTask.priority === 'high' ? 'Alta' : currentTask.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  <span>•</span>
                  <span>{getStatusText(currentTask.status)}</span>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-6 mt-4">
            <div className="col-span-2 space-y-6">
              {/* Descrição */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-medium">Descrição</h3>
                </div>
                
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea 
                      value={currentTask.description || ""}
                      onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                      className="min-h-20"
                      placeholder="Adicione uma descrição detalhada..."
                    />
                    <Button 
                      size="sm" 
                      onClick={() => {
                        updateTask({ description: currentTask.description });
                        setIsEditingDescription(false);
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="p-3 bg-muted/50 rounded-md min-h-20 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {currentTask.description ? 
                      <p className="text-sm whitespace-pre-wrap">{currentTask.description}</p> : 
                      <p className="text-sm text-muted-foreground">Adicione uma descrição...</p>
                    }
                  </div>
                )}
              </div>
              
              {/* Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListCheck className="h-4 w-4" />
                    <h3 className="font-medium">Checklist</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentTask.subtasks?.filter(s => s.completed).length || 0}/
                    {currentTask.subtasks?.length || 0} concluídos
                  </div>
                </div>
                
                <div className="space-y-2">
                  {currentTask.subtasks && currentTask.subtasks.length > 0 ? (
                    <div className="space-y-2">
                      {currentTask.subtasks.map(subtask => (
                        <div 
                          key={subtask.id} 
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              checked={subtask.completed}
                              onCheckedChange={() => toggleSubtask(subtask.id)}
                              id={`check-${subtask.id}`}
                            />
                            <label 
                              htmlFor={`check-${subtask.id}`}
                              className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {subtask.title}
                            </label>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => removeSubtask(subtask.id)}
                          >
                            <span className="sr-only">Remover</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" fillRule="evenodd" d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5l3.469-3.468Z" clipRule="evenodd"/></svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum item no checklist</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Input 
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Adicionar novo item ao checklist"
                      className="text-sm"
                      onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    />
                    <Button size="sm" onClick={addSubtask}>Adicionar</Button>
                  </div>
                </div>
              </div>
              
              {/* Anotações */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Pencil className="h-4 w-4" />
                  <h3 className="font-medium">Anotações</h3>
                </div>
                
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-28"
                  placeholder="Adicione anotações sobre esta tarefa..."
                />
                
                <Button size="sm" onClick={handleSaveNotes}>
                  Salvar anotações
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Data de entrega */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-medium">Data de entrega</h3>
                </div>
                
                <Input 
                  type="date" 
                  value={currentTask.dueDate || ""} 
                  onChange={(e) => handleDueDateChange(e.target.value)}
                />
              </div>
              
              {/* Responsável */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <h3 className="font-medium">Responsável</h3>
                </div>
                
                <Input 
                  value={currentTask.assignee?.name || ""}
                  onChange={(e) => updateTask({ assignee: { name: e.target.value } })}
                  placeholder="Nome do responsável"
                />
              </div>
              
              {/* Colaboradores */}
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => setActiveSection(activeSection === "collaborators" ? null : "collaborators")}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <h3 className="font-medium">Colaboradores</h3>
                  </div>
                  <div className="text-xs bg-muted rounded-full px-2 py-0.5">
                    {currentTask.collaborators?.length || 0}
                  </div>
                </div>
                
                <Sheet open={activeSection === "collaborators"} onOpenChange={(open) => setActiveSection(open ? "collaborators" : null)}>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Gerenciar Colaboradores</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email do colaborador</label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={collaboratorEmail}
                            onChange={(e) => setCollaboratorEmail(e.target.value)}
                            placeholder="Email do colaborador"
                            type="email"
                            onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                          />
                          <Button onClick={addCollaborator}>Adicionar</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          O colaborador deve estar registrado na plataforma com este email
                        </p>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium">Usuários registrados disponíveis:</h4>
                        <div className="max-h-20 overflow-y-auto space-y-1 p-2 bg-muted/30 rounded-md">
                          {registeredUsers.map((user) => (
                            <div key={user.email} className="text-xs text-muted-foreground flex justify-between">
                              <span>{user.name}</span>
                              <span>{user.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-medium">Colaboradores atuais:</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {currentTask.collaborators && currentTask.collaborators.length > 0 ? (
                            currentTask.collaborators.map(name => (
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
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" fillRule="evenodd" d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5l3.469-3.468Z" clipRule="evenodd"/></svg>
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground p-1">
                              Nenhum colaborador adicionado
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <SheetFooter>
                      <Button onClick={() => setActiveSection(null)}>Concluído</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Projetos vinculados */}
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => setActiveSection(activeSection === "projects" ? null : "projects")}
                >
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <h3 className="font-medium">Projetos vinculados</h3>
                  </div>
                  <div className="text-xs bg-muted rounded-full px-2 py-0.5">
                    {currentTask.linkedProjects?.length || 0}
                  </div>
                </div>
                
                <Sheet open={activeSection === "projects"} onOpenChange={(open) => setActiveSection(open ? "projects" : null)}>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Vincular Projetos</SheetTitle>
                    </SheetHeader>
                    
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                      {projects.length > 0 ? (
                        projects.map(project => {
                          const isLinked = currentTask.linkedProjects?.includes(project.id);
                          return (
                            <div 
                              key={project.id} 
                              className={`flex items-center justify-between p-3 rounded-md border ${isLinked ? 'border-primary bg-primary/5' : 'border-border'}`}
                            >
                              <span className="font-medium">{project.title}</span>
                              <Button 
                                variant={isLinked ? "default" : "outline"} 
                                size="sm"
                                onClick={() => toggleProjectLink(project.id)}
                              >
                                {isLinked ? "Desvincular" : "Vincular"}
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum projeto disponível
                        </p>
                      )}
                    </div>
                    
                    <SheetFooter>
                      <Button onClick={() => setActiveSection(null)}>Concluído</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Tags */}
              {currentTask.tags && currentTask.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {currentTask.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 15 15"><path fill="currentColor" fillRule="evenodd" d="M1.8 2.467a.667.667 0 0 1 .666-.667h5a.667.667 0 0 1 .472.195l5.334 5.333a.667.667 0 0 1 0 .944l-5 5a.667.667 0 0 1-.944 0l-5.333-5.333a.667.667 0 0 1-.195-.472v-5Zm1.333.666v4.726l4.833 4.834l4.53-4.531l-4.834-4.834H3.133v-.195Zm1.834 2a.833.833 0 1 1 1.666 0a.833.833 0 0 1-1.666 0Z" clipRule="evenodd"/></svg>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Delete button moved to bottom */}
              <div className="pt-6 border-t border-border mt-6">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <img 
                    src="/lovable-uploads/a77a518b-858d-4fda-adbf-979be87b9644.png" 
                    alt="Excluir"
                    className="w-6 h-6 mr-2"
                  />
                  Excluir tarefa
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
