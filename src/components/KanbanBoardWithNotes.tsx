
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn, Task } from "./KanbanColumn";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Status types for the Kanban columns
type StatusType = "pending" | "in_progress" | "in_review" | "completed";

// Kanban column configuration
const columns = [
  { id: "pending", title: "Pendente" },
  { id: "in_progress", title: "Em Progresso" },
  { id: "in_review", title: "Em Revisão" },
  { id: "completed", title: "Concluído" }
];

// Props for the KanbanBoard component
interface KanbanBoardProps {
  projectId: string;
  onTasksChanged?: () => void;
}

export function KanbanBoardWithNotes({ projectId, onTasksChanged }: KanbanBoardProps) {
  // State for the tasks in the board
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
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
  
  // Initial load of tasks
  useEffect(() => {
    loadTasks();
  }, [projectId]);
  
  // Load tasks from localStorage
  const loadTasks = () => {
    const storedTasks = localStorage.getItem(`tasks-${projectId}`);
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // Initialize with some example tasks if none exist
      const exampleTasks = [
        {
          id: "task-1",
          title: "Pesquisar mercado",
          description: "Analisar concorrentes e identificar oportunidades para o produto",
          priority: "high" as const,
          status: "pending" as StatusType,
          dueDate: "30/11/2023",
          tags: ["Pesquisa", "Marketing"]
        },
        {
          id: "task-2",
          title: "Criar wireframes",
          description: "Desenvolver wireframes de alta fidelidade para a página inicial",
          priority: "medium" as const,
          status: "in_progress" as StatusType,
          dueDate: "05/12/2023",
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
          dueDate: "10/12/2023",
          tags: ["Estratégia", "Marketing"]
        },
        {
          id: "task-4",
          title: "Desenvolver protótipo",
          description: "Criar um protótipo funcional da solução",
          priority: "low" as const,
          status: "completed" as StatusType,
          dueDate: "15/12/2023",
          tags: ["Desenvolvimento"],
          assignee: {
            name: "João"
          }
        }
      ];
      
      setTasks(exampleTasks);
      localStorage.setItem(`tasks-${projectId}`, JSON.stringify(exampleTasks));
    }
  };
  
  // Save tasks to localStorage and trigger callback
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
    
    // Notify parent component of tasks change
    if (onTasksChanged) {
      onTasksChanged();
    }
  };
  
  // Handle task drag and drop
  const handleDrop = (taskId: string, targetColumnId: string) => {
    // Find the task
    const taskToUpdate = tasks.find(task => task.id === taskId);
    
    if (!taskToUpdate) return;
    
    // If task is already in the target column, do nothing
    if (taskToUpdate.status === targetColumnId) return;
    
    // Create a new array with the updated task
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: targetColumnId as StatusType } 
        : task
    );
    
    saveTasks(updatedTasks);
    
    toast("Tarefa atualizada", {
      description: `Tarefa movida para "${columns.find(col => col.id === targetColumnId)?.title}"`,
    });
  };
  
  // Handle task click - Currently a stub but could be used for task details view
  const handleTaskClick = (task: Task) => {
    // To be implemented: show task details, edit task, etc.
    console.log("Task clicked:", task);
  };

  // Handle task notes update
  const handleUpdateNotes = (taskId: string, notes: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, notes } 
        : task
    );
    
    saveTasks(updatedTasks);
  };

  // Handle task update (for collaborators, linked projects, etc)
  const handleUpdateTask = (taskId: string, updatedFields: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updatedFields } 
        : task
    );
    
    saveTasks(updatedTasks);
  };

  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  // Add new task
  const addNewTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Título da tarefa é obrigatório");
      return;
    }

    const newTaskItem: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      tags: [],
      assignee: newTask.assignee.name ? { name: newTask.assignee.name } : undefined,
      linkedProjects: [],
      collaborators: []
    };
    
    const updatedTasks = [...tasks, newTaskItem];
    saveTasks(updatedTasks);
    
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

    toast.success("Tarefa adicionada com sucesso");
  };
  
  // Group tasks by status
  const tasksByStatus = columns.reduce<Record<string, Task[]>>((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {});
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Quadro de Tarefas</h2>
        <Button onClick={() => setNewTaskOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Adicionar Tarefa</span>
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8">
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

      {/* Nova Tarefa Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
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
            
            <div className="grid grid-cols-2 gap-4">
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
              <Input 
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addNewTask}>
              Adicionar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
