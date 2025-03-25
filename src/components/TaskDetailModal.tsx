
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task } from "./KanbanColumn";
import { toast } from "sonner";

interface TaskDetailModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdateTask,
  onDeleteTask
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [users, setUsers] = useState<{name: string, email: string}[]>([]);

  // Load registered users for assignee dropdown
  useState(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  });

  const handleSave = () => {
    if (onUpdateTask) {
      onUpdateTask(task.id, editedTask);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (onDeleteTask) {
      try {
        onOpenChange(false); // Close modal first
        
        // Small delay to ensure modal closes before deletion
        setTimeout(() => {
          onDeleteTask(task.id);
          toast.success("Tarefa excluída com sucesso");
        }, 100);
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Erro ao excluir tarefa");
      }
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    setEditedTask({
      ...editedTask,
      subtasks: [
        ...(editedTask.subtasks || []),
        { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
      ]
    });
    
    setNewSubtask("");
  };

  const removeSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks?.filter(st => st.id !== subtaskId)
    });
  };

  const toggleSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    });
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (editedTask.tags?.includes(newTag)) {
      toast.error("Esta tag já existe");
      return;
    }
    
    setEditedTask({
      ...editedTask,
      tags: [...(editedTask.tags || []), newTag]
    });
    
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags?.filter(t => t !== tag)
    });
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="subtasks">Subtarefas</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <Input 
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição</label>
              <Textarea 
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task["status"] })}
                  className="w-full border border-input px-3 py-2 rounded-md bg-background"
                >
                  <option value="todo">A fazer</option>
                  <option value="in-progress">Em progresso</option>
                  <option value="review">Em revisão</option>
                  <option value="completed">Concluído</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Prioridade</label>
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as "low" | "medium" | "high" })}
                  className="w-full border border-input px-3 py-2 rounded-md bg-background"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Responsável</label>
              <select
                value={editedTask.assignee?.name || ""}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  if (selectedName) {
                    setEditedTask({
                      ...editedTask,
                      assignee: { name: selectedName }
                    });
                  } else {
                    const newTask = { ...editedTask };
                    delete newTask.assignee;
                    setEditedTask(newTask);
                  }
                }}
                className="w-full border border-input px-3 py-2 rounded-md bg-background"
              >
                <option value="">Sem responsável</option>
                {users.map(user => (
                  <option key={user.email} value={user.name}>{user.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Data de vencimento</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setEditedTask({
                          ...editedTask,
                          dueDate: format(date, 'yyyy-MM-dd')
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {editedTask.assignee?.name && (
              <div className="p-3 bg-secondary/20 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Responsável</span>
                </div>
                <div className="flex gap-2 items-center p-2 bg-secondary rounded-md">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>{getInitial(editedTask.assignee.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{editedTask.assignee.name}</span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="subtasks" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input 
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Adicionar subtarefa"
                onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              />
              <Button onClick={addSubtask} type="button" size="sm">Adicionar</Button>
            </div>
            
            {editedTask.subtasks && editedTask.subtasks.length > 0 ? (
              <div className="space-y-2">
                {editedTask.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={subtask.id} 
                        checked={subtask.completed} 
                        onCheckedChange={() => toggleSubtask(subtask.id)}
                      />
                      <label 
                        htmlFor={subtask.id} 
                        className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {subtask.title}
                      </label>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeSubtask(subtask.id)}
                      className="h-7 w-7 p-0 text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma subtarefa adicionada</p>
            )}
          </TabsContent>
          
          <TabsContent value="tags" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag"
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} type="button" size="sm">Adicionar</Button>
            </div>
            
            {editedTask.tags && editedTask.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full">
                    <span className="text-xs">{tag}</span>
                    <button 
                      onClick={() => removeTag(tag)}
                      className="text-xs text-destructive hover:text-destructive/80"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4">
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="w-full mb-4"
          >
            Excluir tarefa
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
