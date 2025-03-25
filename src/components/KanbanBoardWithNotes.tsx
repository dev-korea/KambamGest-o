
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn, Task } from "./KanbanColumn";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { undoSystem } from "@/utils/undoSystem";
import { mapStatusToBoardFormat, normalizeStatus, formatDateForDisplay, normalizeDate } from "@/utils/taskStatusMapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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

  useEffect(() => {
    loadTasks();
    
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
      
      // Force a reload for the daily overview by dispatching a custom event
      window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
    };
    
    window.addEventListener('kanban-data-update', handleUndoEvent as EventListener);
    window.addEventListener('taskUpdated', handleTaskUpdate);
    window.addEventListener('taskDateChanged', handleDateChange);
    
    return () => {
      window.removeEventListener('kanban-data-update', handleUndoEvent as EventListener);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      window.removeEventListener('taskDateChanged', handleDateChange);
    };
  }, [projectId]);
  
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
    
    window.dispatchEvent(new CustomEvent('taskUpdated'));
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
      window.dispatchEvent(new CustomEvent('taskDateChanged'));
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

  const addNewTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Título da tarefa é obrigatório");
      return;
    }
    
    const normalizedDueDate = newTask.dueDate ? normalizeDate(new Date(newTask.dueDate)) : "";

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
    
    if (normalizedDueDate) {
      window.dispatchEvent(new CustomEvent('taskDateChanged'));
      window.dispatchEvent(new CustomEvent('dailyTasksRefresh'));
    }

    toast.success("Tarefa adicionada com sucesso");
  };

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
        <Button onClick={() => setNewTaskOpen(true)} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm">
          <Plus className="h-3 w-3 md:h-4 md:w-4" />
          <span>Adicionar Tarefa</span>
        </Button>
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
        <DialogContent className={`max-w-md max-h-[90vh] ${isMobile ? 'w-[95%] p-4' : ''} overflow-y-auto`}>
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
            
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
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
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
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
          
          <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)} className={isMobile ? "w-full" : ""}>
              Cancelar
            </Button>
            <Button onClick={addNewTask} className={isMobile ? "w-full" : ""}>
              Adicionar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
