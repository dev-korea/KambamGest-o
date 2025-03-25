
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn, Task } from "./KanbanColumn";

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
  
  // Group tasks by status
  const tasksByStatus = columns.reduce<Record<string, Task[]>>((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {});
  
  return (
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
        />
      ))}
    </div>
  );
}
