import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn, Task } from "./KanbanColumn";
import { Plus, Calendar as CalendarIcon, ListTodo, Search, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { undoSystem } from "@/utils/undoSystem";
import { mapStatusToBoardFormat, normalizeStatus, normalizeDate } from "@/utils/taskStatusMapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type StatusType = "pending" | "in_progress" | "in_review" | "completed";

const columns = [
  { id: "pending", title: "Pendente" },
  { id: "in_progress", title: "Em Progresso" },
  { id: "in_review", title: "Em Revisão" },
  { id: "completed", title: "Concluído" }
];

interface KanbanBoardProps {
  projectId: string;
  onTasksChanged?: () => void;
}

export function KanbanBoardWithNotes({ projectId, onTasksChanged }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "pending" as StatusType,
    dueDate: "",
    tags: [] as string[],
    assignee: {
      name: ""
    },
    linkedProjects: [] as string[],
    collaborators: [] as string[]
  });

  const [templates, setTemplates] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
    loadTemplates();
    
    const handleUndoEvent = (event: CustomEvent) => {
      if (event.detail?.projectId === projectId) {
        loadTasks();
      }
    };
    
    const handleTaskUpdate = () => {
      console.log("Task update detected, reloading tasks");
      loadTasks();
    };
    
    const handleDateChange = () => {
      console.log("Detected task date change event, reloading tasks");
      loadTasks();
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
      }, 300);
    };
    
    window.addEventListener('kanban-data-update', handleUndoEvent as EventListener);
    window.addEventListener('taskUpdated', handleTaskUpdate);
    window.addEventListener('taskDateChanged', handleDateChange);
    window.addEventListener('dailyTasksRefresh', handleDateChange);
    
    return () => {
      window.removeEventListener('kanban-data-update', handleUndoEvent as EventListener);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      window.removeEventListener('taskDateChanged', handleDateChange);
      window.removeEventListener('dailyTasksRefresh', handleDateChange);
    };
  }, [projectId]);
  
  const loadTemplates = () => {
    const storedTemplates = localStorage.getItem('taskTemplates');
    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates);
        setTemplates(parsedTemplates);
      } catch (error) {
        console.error("Error parsing templates:", error);
        setTemplates([]);
      }
    } else {
      setTemplates([]);
    }
  };
  
  const loadTasks = () => {
    const storedTasks = localStorage.getItem(`tasks-${projectId}`);
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        const normalizedTasks = parsedTasks.map((task: Task) => ({
          ...task,
          status: normalizeStatus(task.status)
        }));
        setTasks(normalizedTasks);
      } catch (error) {
        console.error("Error parsing tasks:", error);
        setTasks([]);
      }
    } else {
      const exampleTasks = [
        {
          id: "task-1",
          title: "Pesquisar mercado",
          description: "Analisar concorrentes e identificar oportunidades para o produto",
          priority: "high" as const,
          status: "pending" as StatusType,
          dueDate: format(new Date(), 'yyyy-MM-dd'),
          tags: ["Pesquisa", "Marketing"]
        },
        {
          id: "task-2",
          title: "Criar wireframes",
          description: "Desenvolver wireframes de alta fidelidade para a página inicial",
          priority: "medium" as const,
          status: "in_progress" as StatusType,
          dueDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          tags: ["Design", "UI/UX"],
          assignee: {
            name: "Maria"
          }
        },
        {
          id: "task-3",
          title: "Definir estratégia",
          description: "Criar estratégia de lançamento para o novo produto",
          priority: "medium" as const,
          status: "pending" as StatusType,
          dueDate: format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          tags: ["Estratégia", "Marketing"]
        },
        {
          id: "task-4",
          title: "Desenvolver protótipo",
          description: "Criar um protótipo funcional da solução",
          priority: "low" as const,
          status: "completed" as StatusType,
          dueDate: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          tags: ["Desenvolvimento"],
          assignee: {
            name: "João"
          },
          completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setTasks(exampleTasks);
      localStorage.setItem(`tasks-${projectId}`, JSON.stringify(exampleTasks));
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
    
    if (onTasksChanged) {
      onTasksChanged();
    }
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    }, 100);
  };

  const handleDrop = (taskId: string, targetColumnId: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    
    if (!taskToUpdate) return;
    
    if (taskToUpdate.status === targetColumnId) return;
    
    undoSystem.addAction({
      type: 'MOVE_TASK',
      projectId,
      payload: {
        taskId,
        previousStatus: taskToUpdate.status
      },
      timestamp: Date.now()
    });
    
    let taskUpdates: Partial<Task> = { status: targetColumnId as any };
    if (targetColumnId === "completed") {
      taskUpdates.completedDate = new Date().toISOString();
    } else if (taskToUpdate.status === "completed") {
      taskUpdates.completedDate = undefined;
    }
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...taskUpdates } 
        : task
    );
    
    saveTasks(updatedTasks);
    
    toast("Tarefa atualizada", {
      description: `Tarefa movida para "${columns.find(col => col.id === targetColumnId)?.title}"`,
    });
  };

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
  };

  const handleUpdateNotes = (taskId: string, notes: string) => {
    const originalTask = tasks.find(task => task.id === taskId);
    if (!originalTask) return;
    
    undoSystem.addAction({
      type: 'UPDATE_TASK',
      projectId,
      payload: { ...originalTask },
      timestamp: Date.now()
    });
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, notes } 
        : task
    );
    
    saveTasks(updatedTasks);
  };

  const handleUpdateTask = (taskId: string, updatedFields: Partial<Task>) => {
    const originalTask = tasks.find(task => task.id === taskId);
    if (!originalTask) return;
    
    const isDateChange = 'dueDate' in updatedFields && originalTask.dueDate !== updatedFields.dueDate;
    
    undoSystem.addAction({
      type: 'UPDATE_TASK',
      projectId,
      payload: { ...originalTask },
      timestamp: Date.now()
    });
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updatedFields } 
        : task
    );
    
    saveTasks(updatedTasks);
    
    if (isDateChange) {
      console.log("Date change detected in handleUpdateTask:", originalTask.dueDate, "->", updatedFields.dueDate);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('taskDateChanged'));
      }, 100);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
      }, 200);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
      }, 500);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) return;
    
    undoSystem.addAction({
      type: 'DELETE_TASK',
      projectId,
      payload: { ...taskToDelete },
      timestamp: Date.now()
    });
    
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    
    toast.success("Tarefa excluída", {
      description: "Pressione Ctrl+Z para desfazer esta ação"
    });
  };

  const resetNewTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      tags: [],
      assignee: { name: "" },
      linkedProjects: [],
      collaborators: []
    });
    setSelectedDate(undefined);
  };

  const addNewTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Título da tarefa é obrigatório");
      return;
    }
    
    const normalizedDueDate = selectedDate ? normalizeDate(selectedDate) : "";

    const newTaskItem: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status as Task["status"],
      priority: newTask.priority,
      dueDate: normalizedDueDate,
      tags: newTask.tags || [],
      assignee: newTask.assignee.name ? { name: newTask.assignee.name } : undefined,
      linkedProjects: newTask.linkedProjects || [],
      collaborators: newTask.collaborators || [],
      completedDate: newTask.status === "completed" ? new Date().toISOString() : undefined
    };
    
    const updatedTasks = [...tasks, newTaskItem];
    saveTasks(updatedTasks);
    
    undoSystem.addAction({
      type: 'ADD_TASK',
      projectId,
      payload: newTaskItem.id,
      timestamp: Date.now()
    });
    
    setNewTaskOpen(false);
    resetNewTaskForm();
    
    if (normalizedDueDate) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('taskDateChanged'));
      }, 100);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
      }, 200);
    }

    toast.success("Tarefa adicionada com sucesso");
  };

  const handleCloseNewTaskDialog = () => {
    setNewTaskOpen(false);
    resetNewTaskForm();
  };

  const handleUseExistingTemplate = () => {
    setTemplateSelectorOpen(true);
    loadTemplates();
  };

  const useTemplate = (template: Task) => {
    const newTaskFromTemplate: Task = {
      ...template,
      id: `task-${Date.now()}`,
      status: "pending" as StatusType,
      completedDate: undefined
    };
    
    const updatedTasks = [...tasks, newTaskFromTemplate];
    saveTasks(updatedTasks);
    
    undoSystem.addAction({
      type: 'ADD_TASK',
      projectId,
      payload: newTaskFromTemplate.id,
      timestamp: Date.now()
    });
    
    setTemplateSelectorOpen(false);
    
    if (newTaskFromTemplate.dueDate) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('taskDateChanged'));
      }, 100);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
      }, 200);
    }

    toast.success("Tarefa adicionada com sucesso a partir do template");
  };

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tasksByStatus = columns.reduce<Record<string, Task[]>>((acc, column) => {
    acc[column.id] = tasks.filter(task => {
      const normalizedStatus = normalizeStatus(task.status);
      return normalizedStatus === column.id || 
             (column.id === "pending" && normalizedStatus === "todo") ||
             (column.id === "in_progress" && normalizedStatus === "in-progress") ||
             (column.id === "in_review" && normalizedStatus === "review");
    });
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <h2 className="text-lg md:text-xl font-medium">Quadro de Tarefas</h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm">
              <Plus className="h-3 w-3 md:h-4 md:w-4" />
              <span>Adicionar Tarefa</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setNewTaskOpen(true)} className="flex items-center gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>Criar Nova Tarefa</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUseExistingTemplate} className="flex items-center gap-2 cursor-pointer">
              <ListTodo className="h-4 w-4" />
              <span>Usar Tarefa Existente</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 md:gap-6 ${isMobile ? '' : 'overflow-x-auto'} pb-4 md:pb-8`}>
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            columnId={column.id}
            tasks={tasksByStatus[column.id] || []}
            onDrop={handleDrop}
            onTaskClick={handleTaskClick}
            onUpdateNotes={handleUpdateNotes}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background w-[95%] md:w-full">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar uma nova tarefa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                Título
              </label>
              <Input 
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Título da tarefa"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1">
                Descrição
              </label>
              <Textarea 
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Descrição da tarefa"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="text-sm font-medium block mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value as StatusType})}
                  className="w-full border border-input px-3 py-2 rounded-md bg-background"
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="in_review">Em Revisão</option>
                  <option value="completed">Concluído</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="text-sm font-medium block mb-1">
                  Prioridade
                </label>
                <select
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as "low" | "medium" | "high"})}
                  className="w-full border border-input px-3 py-2 rounded-md bg-background"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="assignee" className="text-sm font-medium block mb-1">
                Responsável
              </label>
              <Input 
                id="assignee"
                value={newTask.assignee.name}
                onChange={(e) => setNewTask({...newTask, assignee: { name: e.target.value }})}
                placeholder="Nome do responsável"
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="text-sm font-medium block mb-1">
                Data de Entrega
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setNewTask({...newTask, dueDate: format(date, 'yyyy-MM-dd')});
                      } else {
                        setNewTask({...newTask, dueDate: ""});
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={handleCloseNewTaskDialog} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={addNewTask} className="w-full sm:w-auto">
              Adicionar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-background w-[95%] md:w-full">
          <DialogHeader>
            <DialogTitle>Selecionar Template de Tarefa</DialogTitle>
            <DialogDescription>
              Escolha um template para criar uma nova tarefa rapidamente
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[50vh] pr-4">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">Nenhum template disponível</h3>
                <p className="text-muted-foreground">
                  Crie templates na aba de Templates para utilizá-los aqui
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="border border-border rounded-lg p-4 hover:border-primary cursor-pointer transition-all"
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.title}</h3>
                      <Badge 
                        variant={
                          template.priority === "high" ? "destructive" : 
                          template.priority === "medium" ? "default" : 
                          "secondary"
                        }
                      >
                        {template.priority === "high" ? "Alta" : 
                        template.priority === "medium" ? "Média" : "Baixa"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.tags.map((tag) => (
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
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      {template.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(template.dueDate), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                      
                      {template.subtasks && template.subtasks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ListTodo className="h-3 w-3" />
                          <span>{template.subtasks.length} subtarefas</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setTemplateSelectorOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

