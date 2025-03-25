import { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { Plus, ListTodo, User, Calendar, ClipboardCheck, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface KanbanBoardProps {
  projectId: string;
  onTasksChanged?: () => void;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  tags: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export function KanbanBoard({ projectId, onTasksChanged }: KanbanBoardProps) {
  // Check if there's a template to apply
  useEffect(() => {
    const templateToAdd = localStorage.getItem('templateToAdd');
    if (templateToAdd) {
      const template = JSON.parse(templateToAdd);
      // Add template as a new task
      const newTaskItem: Task = {
        id: `task-${Date.now()}`,
        title: template.title,
        description: template.description || "",
        status: "todo",
        priority: template.priority || "medium",
        dueDate: template.dueDate || format(new Date(), 'yyyy-MM-dd'),
        tags: template.tags || [],
        assignee: template.assignee || undefined,
        subtasks: template.subtasks || [],
      };
      
      const currentTasks = JSON.parse(localStorage.getItem(`tasks-${projectId}`) || '[]');
      const updatedTasks = [...currentTasks, newTaskItem];
      localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
      
      // Clear template from localStorage
      localStorage.removeItem('templateToAdd');
      
      // Show success message
      toast.success("Template task added successfully");
      
      // Update tasks state
      setTasks(updatedTasks);
    }
  }, [projectId]);

  // Get tasks from localStorage or use empty array if none exist
  const getTasksFromStorage = () => {
    const storedTasks = localStorage.getItem(`tasks-${projectId}`);
    return storedTasks ? JSON.parse(storedTasks) : [];
  };

  const [tasks, setTasks] = useState<Task[]>(getTasksFromStorage());
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSubtask, setNewSubtask] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  const [teammatesList, setTeammatesList] = useState<string[]>([]);
  
  // Get usernames from localStorage to show as teammate suggestions
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const names = users.map((user: any) => user.name);
      setTeammatesList(names);
    }
  }, []);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    tags: [] as string[],
    assignee: {
      name: ""
    },
    subtasks: [] as {id: string; title: string; completed: boolean}[]
  });

  const handleDrop = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
    toast.success(`Task updated to ${newStatus.replace('-', ' ')}`);
  };
  
  const addNewTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const newTaskItem: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      tags: newTask.tags,
      assignee: newTask.assignee.name ? newTask.assignee : undefined,
      subtasks: newTask.subtasks.length > 0 ? newTask.subtasks : undefined,
    };
    
    const updatedTasks = [...tasks, newTaskItem];
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
    
    setNewTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      tags: [],
      assignee: { name: "" },
      subtasks: []
    });

    toast.success("Task added successfully");
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
  };

  const updateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
    closeTaskDetail();
    toast.success("Task updated successfully");
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
    closeTaskDetail();
    toast.success("Task deleted successfully");
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    setNewTask({
      ...newTask,
      subtasks: [
        ...newTask.subtasks,
        { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
      ]
    });
    
    setNewSubtask("");
  };
  
  const addTag = () => {
    if (!newTaskTag.trim()) return;
    if (newTask.tags.includes(newTaskTag)) {
      toast.error("Tag already exists");
      return;
    }
    
    setNewTask({
      ...newTask,
      tags: [...newTask.tags, newTaskTag]
    });
    
    setNewTaskTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const removeSubtask = (subtaskId: string) => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.filter(subtask => subtask.id !== subtaskId)
    });
  };

  const toggleSubtaskInTask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && task.subtasks) {
        return {
          ...task,
          subtasks: task.subtasks.map(subtask => 
            subtask.id === subtaskId ? 
              { ...subtask, completed: !subtask.completed } : 
              subtask
          )
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Function to get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  useEffect(() => {
    if (onTasksChanged) {
      onTasksChanged();
    }
  }, [tasks, onTasksChanged]);

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
          onTaskClick={openTaskDetail}
        />
        
        <KanbanColumn 
          title="In Progress" 
          tasks={tasks.filter(task => task.status === "in-progress")}
          columnId="in-progress"
          onDrop={handleDrop}
          onTaskClick={openTaskDetail}
        />
        
        <KanbanColumn 
          title="Review" 
          tasks={tasks.filter(task => task.status === "review")}
          columnId="review"
          onDrop={handleDrop}
          onTaskClick={openTaskDetail}
        />
        
        <KanbanColumn 
          title="Completed" 
          tasks={tasks.filter(task => task.status === "completed")}
          columnId="completed"
          onDrop={handleDrop}
          onTaskClick={openTaskDetail}
        />
      </div>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
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
                <label htmlFor="assignee" className="text-sm font-medium block mb-1">
                  Assignee
                </label>
                <div className="relative">
                  <Input 
                    id="assignee"
                    value={newTask.assignee.name}
                    onChange={(e) => setNewTask({...newTask, assignee: { name: e.target.value }})}
                    placeholder="Assignee name"
                    list="teammates-list"
                  />
                  <datalist id="teammates-list">
                    {teammatesList.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
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
                <label className="text-sm font-medium block mb-1">
                  Due Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setNewTask({...newTask, dueDate: format(date, 'yyyy-MM-dd')});
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask"
                  onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                />
                <Button onClick={addSubtask} type="button" size="sm">Add</Button>
              </div>
              
              {newTask.subtasks.length > 0 ? (
                <div className="space-y-2">
                  {newTask.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Checkbox id={subtask.id} checked={subtask.completed} />
                        <label htmlFor={subtask.id} className="text-sm">{subtask.title}</label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSubtask(subtask.id)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subtasks added yet</p>
              )}
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} type="button" size="sm">Add</Button>
              </div>
              
              {newTask.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {newTask.tags.map((tag) => (
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
                <p className="text-sm text-muted-foreground">No tags added yet</p>
              )}
            </TabsContent>
          </Tabs>
          
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

      {/* Task Detail Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={closeTaskDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <p className="text-sm">{selectedTask.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Status</h3>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => setSelectedTask({
                        ...selectedTask, 
                        status: e.target.value as Task["status"]
                      })}
                      className="w-full border border-input px-3 py-2 rounded-md bg-background"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Priority</h3>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => setSelectedTask({
                        ...selectedTask, 
                        priority: e.target.value as Task["priority"]
                      })}
                      className="w-full border border-input px-3 py-2 rounded-md bg-background"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Assignee</h3>
                  <div className="relative">
                    <Input 
                      value={selectedTask.assignee?.name || ""}
                      onChange={(e) => setSelectedTask({
                        ...selectedTask,
                        assignee: { ...selectedTask.assignee, name: e.target.value }
                      })}
                      placeholder="Assign to someone"
                      list="teammates-list"
                    />
                    <datalist id="teammates-list">
                      {teammatesList.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Due Date</h3>
                  <Input
                    type="date"
                    value={selectedTask.dueDate}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask,
                      dueDate: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Team Members</h3>
                  <div className="p-3 bg-secondary/20 rounded-md flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Assigned to</span>
                    </div>
                    
                    {selectedTask.assignee?.name ? (
                      <div className="flex gap-2 items-center p-2 bg-secondary rounded-md">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{getInitial(selectedTask.assignee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{selectedTask.assignee.name}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">
                        No one assigned yet
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSubtask.trim()) {
                        const updatedTask = {
                          ...selectedTask,
                          subtasks: [
                            ...(selectedTask.subtasks || []),
                            { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
                          ]
                        };
                        setSelectedTask(updatedTask);
                        setNewSubtask("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newSubtask.trim()) {
                        const updatedTask = {
                          ...selectedTask,
                          subtasks: [
                            ...(selectedTask.subtasks || []),
                            { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
                          ]
                        };
                        setSelectedTask(updatedTask);
                        setNewSubtask("");
                      }
                    }} 
                    type="button" 
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={subtask.id} 
                            checked={subtask.completed}
                            onCheckedChange={() => {
                              const updatedTask = {
                                ...selectedTask,
                                subtasks: selectedTask.subtasks?.map(st => 
                                  st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                )
                              };
                              setSelectedTask(updatedTask);
                            }}
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
                          onClick={() => {
                            const updatedTask = {
                              ...selectedTask,
                              subtasks: selectedTask.subtasks?.filter(st => st.id !== subtask.id)
                            };
                            setSelectedTask(updatedTask);
                          }}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No subtasks added yet</p>
                )}
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newTaskTag}
                    onChange={(e) => setNewTaskTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskTag.trim()) {
                        if (selectedTask.tags && selectedTask.tags.includes(newTaskTag)) {
                          toast.error("Tag already exists");
                          return;
                        }
                        const updatedTask = {
                          ...selectedTask,
                          tags: [...(selectedTask.tags || []), newTaskTag]
                        };
                        setSelectedTask(updatedTask);
                        setNewTaskTag("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newTaskTag.trim()) {
                        if (selectedTask.tags && selectedTask.tags.includes(newTaskTag)) {
                          toast.error("Tag already exists");
                          return;
                        }
                        const updatedTask = {
                          ...selectedTask,
                          tags: [...(selectedTask.tags || []), newTaskTag]
                        };
                        setSelectedTask(updatedTask);
                        setNewTaskTag("");
                      }
                    }} 
                    type="button" 
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                
                {selectedTask.tags && selectedTask.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full">
                        <span className="text-xs">{tag}</span>
                        <button 
                          onClick={() => {
                            const updatedTask = {
                              ...selectedTask,
                              tags: selectedTask.tags?.filter(t => t !== tag)
                            };
                            setSelectedTask(updatedTask);
                          }}
                          className="text-xs text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags added yet</p>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteTask(selectedTask.id)}
              >
                Delete Task
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeTaskDetail}>
                  Cancel
                </Button>
                <Button onClick={() => updateTask(selectedTask)}>
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
