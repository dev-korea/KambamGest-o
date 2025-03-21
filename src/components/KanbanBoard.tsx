
import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanTask } from "./KanbanTask";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface KanbanBoardProps {
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  tags: string[]; // Added tags to match KanbanColumn's Task interface
  assigned?: {
    name: string;
    avatar: string;
  };
}

// Sample data - in a real app would fetch this based on projectId from database
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Research competitors",
    description: "Analyze top 5 competitors' websites and identify strengths and weaknesses",
    status: "completed",
    priority: "high",
    dueDate: "2023-10-28",
    tags: ["research"],
  },
  {
    id: "task-2",
    title: "Create wireframes",
    description: "Design wireframes for homepage, product pages, and checkout flow",
    status: "completed",
    priority: "high",
    dueDate: "2023-11-05",
    tags: ["design"],
  },
  {
    id: "task-3",
    title: "Develop homepage",
    description: "Code the homepage based on approved wireframes and design",
    status: "in-progress",
    priority: "medium",
    dueDate: "2023-11-15",
    tags: ["development"],
  },
  {
    id: "task-4",
    title: "Implement product filters",
    description: "Add category, price, and attribute filters to product listing pages",
    status: "todo",
    priority: "medium",
    dueDate: "2023-11-20",
    tags: ["development"],
  },
  {
    id: "task-5",
    title: "Design shopping cart",
    description: "Create a user-friendly shopping cart interface with thumbnail previews",
    status: "review",
    priority: "medium",
    dueDate: "2023-11-10",
    tags: ["design"],
  },
  {
    id: "task-6",
    title: "Optimize for mobile",
    description: "Ensure responsive design functions correctly on various mobile devices",
    status: "todo",
    priority: "high",
    dueDate: "2023-11-25",
    tags: ["development"],
  },
  {
    id: "task-7",
    title: "Integrate payment gateway",
    description: "Connect Stripe API for secure payment processing",
    status: "todo",
    priority: "high",
    dueDate: "2023-11-30",
    tags: ["integration"],
  },
  {
    id: "task-8",
    title: "User testing",
    description: "Conduct usability testing with 5-7 participants and gather feedback",
    status: "todo",
    priority: "medium",
    dueDate: "2023-12-05",
    tags: ["testing"],
  },
  {
    id: "task-9",
    title: "SEO optimization",
    description: "Implement meta tags, structured data, and optimize for core web vitals",
    status: "todo",
    priority: "low",
    dueDate: "2023-12-10",
    tags: ["seo"],
  },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high", // Fix type issue
    dueDate: new Date().toISOString().split("T")[0],
  });

  const handleDrop = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };
  
  const addNewTask = () => {
    const newTaskItem: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      tags: [], // Add empty tags array for new tasks
    };
    
    setTasks([...tasks, newTaskItem]);
    setNewTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Task Board</h2>
        <Button onClick={() => setNewTaskOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-4">
        <KanbanColumn 
          title="To Do" 
          tasks={tasks.filter(task => task.status === "todo")}
          columnId="todo"
          onDrop={handleDrop}
        />
        
        <KanbanColumn 
          title="In Progress" 
          tasks={tasks.filter(task => task.status === "in-progress")}
          columnId="in-progress"
          onDrop={handleDrop}
        />
        
        <KanbanColumn 
          title="Review" 
          tasks={tasks.filter(task => task.status === "review")}
          columnId="review"
          onDrop={handleDrop}
        />
        
        <KanbanColumn 
          title="Completed" 
          tasks={tasks.filter(task => task.status === "completed")}
          columnId="completed"
          onDrop={handleDrop}
        />
      </div>

      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                Title
              </label>
              <Input 
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1">
                Description
              </label>
              <Textarea 
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="priority" className="text-sm font-medium block mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value as "low" | "medium" | "high"})}
                className="w-full border border-input px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="text-sm font-medium block mb-1">
                Due Date
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
              Cancel
            </Button>
            <Button onClick={addNewTask} disabled={!newTask.title}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
