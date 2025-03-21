
import { useState } from "react";
import { KanbanColumn, Task } from "./KanbanColumn";

// Sample data for the Kanban board
const initialTasks: Record<string, Task[]> = {
  todo: [
    {
      id: "task-1",
      title: "Website Redesign",
      description: "Update the client's website with new branding elements and improve mobile responsiveness.",
      dueDate: "Nov 15",
      tags: ["Design", "Frontend"],
      assigned: {
        name: "Alex Chen",
        avatar: "/avatars/alex.jpg",
      },
    },
    {
      id: "task-2",
      title: "Social Media Campaign",
      description: "Plan and create content for the upcoming product launch on Instagram and Facebook.",
      dueDate: "Nov 20",
      tags: ["Marketing", "Content"],
    },
  ],
  inProgress: [
    {
      id: "task-3",
      title: "SEO Optimization",
      description: "Improve search engine rankings by optimizing keywords and metadata.",
      dueDate: "Nov 10",
      tags: ["SEO", "Technical"],
      assigned: {
        name: "Jamie Smith",
        avatar: "/avatars/jamie.jpg",
      },
    },
  ],
  review: [
    {
      id: "task-4",
      title: "Email Newsletter",
      description: "Design and code the monthly newsletter template with the latest updates.",
      dueDate: "Nov 5",
      tags: ["Email", "Design"],
      assigned: {
        name: "Riley Johnson",
        avatar: "/avatars/riley.jpg",
      },
    },
  ],
  completed: [
    {
      id: "task-5",
      title: "Logo Design",
      description: "Create a new logo based on the client's requirements and brand guidelines.",
      dueDate: "Oct 30",
      tags: ["Design", "Branding"],
      assigned: {
        name: "Jordan Lee",
        avatar: "/avatars/jordan.jpg",
      },
    },
  ],
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  
  const handleDrop = (taskId: string, targetColumnId: string) => {
    // Find which column contains the task
    let sourceColumnId = "";
    const taskToMove = Object.entries(tasks).reduce((found: Task | null, [columnId, columnTasks]) => {
      if (found) return found;
      
      const task = columnTasks.find(t => t.id === taskId);
      if (task) {
        sourceColumnId = columnId;
        return task;
      }
      return null;
    }, null);
    
    if (!taskToMove || sourceColumnId === targetColumnId) return;
    
    // Remove from source column and add to target column
    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[sourceColumnId] = prev[sourceColumnId].filter(t => t.id !== taskId);
      newTasks[targetColumnId] = [...prev[targetColumnId], taskToMove];
      return newTasks;
    });
  };
  
  const columns = [
    { id: "todo", title: "To Do" },
    { id: "inProgress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "completed", title: "Completed" },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 px-6 min-h-[calc(100vh-10rem)]">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          columnId={column.id}
          title={column.title}
          tasks={tasks[column.id] || []}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
