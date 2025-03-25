import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Task } from "@/components/KanbanColumn";
import { undoSystem } from "@/utils/undoSystem";
import { mapStatusToBoardFormat, mapStatusToColumnFormat } from "@/utils/taskStatusMapper";

interface Project {
  id: string;
  title: string;
  description: string;
}

type TaskWithProject = Task & { projectId: string };

export default function MyTasks() {
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState<TaskWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || "Guest User";
  });
  
  useEffect(() => {
    // Setup undo system listener
    const handleUndoEvent = () => {
      // Reload all tasks when an undo action happens
      loadUserTasks();
    };
    
    window.addEventListener('kanban-data-update', handleUndoEvent as EventListener);
    
    // Load tasks on init
    loadUserTasks();
    
    return () => {
      window.removeEventListener('kanban-data-update', handleUndoEvent as EventListener);
    };
  }, [username]);
  
  // Load all user tasks
  const loadUserTasks = () => {
    // Get all projects
    const storedProjects = localStorage.getItem('projects');
    const allProjects = storedProjects ? JSON.parse(storedProjects) : [];
    setProjects(allProjects);
    
    // Collect tasks assigned to current user from all projects
    const assignedTasks: TaskWithProject[] = [];
    
    allProjects.forEach((project: Project) => {
      const projectTasks = localStorage.getItem(`tasks-${project.id}`);
      if (projectTasks) {
        try {
          const tasks: Task[] = JSON.parse(projectTasks);
          
          // Filter tasks where the current user is assigned
          const userTasks = tasks
            .filter(task => {
              // Case insensitive comparison for both assignee and collaborators
              const isAssignee = task.assignee?.name?.toLowerCase() === username.toLowerCase();
              const isCollaborator = task.collaborators?.some(
                collaborator => collaborator.toLowerCase() === username.toLowerCase()
              );
              
              return isAssignee || isCollaborator;
            })
            .map(task => ({
              ...task,
              projectId: project.id
            }));
          
          assignedTasks.push(...userTasks);
        } catch (error) {
          console.error(`Error parsing tasks for project ${project.id}:`, error);
        }
      }
    });
    
    setMyTasks(assignedTasks);
  };

  const getTasksByStatus = (status: string | string[]) => {
    if (status === "all") {
      return myTasks;
    }
    
    if (Array.isArray(status)) {
      return myTasks.filter(task => status.includes(task.status));
    }
    
    return myTasks.filter(task => task.status === status);
  };

  const getProjectTitle = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : "Unknown Project";
  };

  const getTaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return task.status === "completed" ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };
  
  const markTaskComplete = (task: TaskWithProject) => {
    // Get original task for undo
    const projectTasks = localStorage.getItem(`tasks-${task.projectId}`);
    if (projectTasks) {
      const tasks: Task[] = JSON.parse(projectTasks);
      const originalTask = tasks.find(t => t.id === task.id);
      
      if (originalTask) {
        // Save for undo
        undoSystem.addAction({
          type: 'UPDATE_TASK',
          projectId: task.projectId,
          payload: { ...originalTask },
          timestamp: Date.now()
        });
      }
      
      const updatedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, status: "completed" } : t
      );
      
      localStorage.setItem(`tasks-${task.projectId}`, JSON.stringify(updatedTasks));
      
      // Update in myTasks state
      const updatedMyTasks = myTasks.map(t => 
        t.id === task.id ? { ...t, status: "completed" } : t
      );
      
      setMyTasks(updatedMyTasks);
      toast.success("Task marked as completed", {
        description: "Pressione Ctrl+Z para desfazer"
      });
    }
  };
  
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    // Find the task
    const taskIndex = myTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || !myTasks[taskIndex].subtasks) return;
    
    // Get original task for undo
    const originalTask = { ...myTasks[taskIndex] };
    
    // Save for undo
    undoSystem.addAction({
      type: 'UPDATE_TASK',
      projectId: originalTask.projectId,
      payload: originalTask,
      timestamp: Date.now()
    });
    
    // Create updated task
    const updatedTask = { ...myTasks[taskIndex] };
    updatedTask.subtasks = updatedTask.subtasks?.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    
    // Update in the tasks storage
    const projectTasks = localStorage.getItem(`tasks-${updatedTask.projectId}`);
    if (projectTasks) {
      const tasks: Task[] = JSON.parse(projectTasks);
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? updatedTask : t
      );
      
      localStorage.setItem(`tasks-${updatedTask.projectId}`, JSON.stringify(updatedTasks));
    }
    
    // Update in myTasks state
    const updatedMyTasks = [...myTasks];
    updatedMyTasks[taskIndex] = updatedTask;
    setMyTasks(updatedMyTasks);
  };
  
  const saveUsername = () => {
    localStorage.setItem('username', username);
    toast.success("Username saved successfully");
    // Refresh tasks with new username
    loadUserTasks();
  };
  
  const filteredTasks = myTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProjectTitle(task.projectId).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displayTasks = searchQuery ? filteredTasks : getTasksByStatus(selectedTab);
  
  const handleTaskClick = (task: TaskWithProject) => {
    setSelectedTask(task);
  };
  
  const closeTaskDetail = () => {
    setSelectedTask(null);
  };
  
  const updateTask = (updatedTask: TaskWithProject) => {
    // Update the task in the project's tasks
    const projectTasks = localStorage.getItem(`tasks-${updatedTask.projectId}`);
    if (projectTasks) {
      const tasks: Task[] = JSON.parse(projectTasks);
      const updatedTasks = tasks.map(t => 
        t.id === updatedTask.id ? updatedTask : t
      );
      
      localStorage.setItem(`tasks-${updatedTask.projectId}`, JSON.stringify(updatedTasks));
      
      // Update in myTasks state
      const updatedMyTasks = myTasks.map(t => 
        t.id === updatedTask.id ? updatedTask : t
      );
      
      setMyTasks(updatedMyTasks);
      toast.success("Task updated successfully");
      closeTaskDetail();
    }
  };
  
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(t => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const upcomingDeadlines = myTasks.filter(t => 
    t.status !== "completed" && 
    t.dueDate && 
    new Date(t.dueDate) > new Date() && 
    new Date(t.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 pb-8 mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">My Tasks</h1>
              <p className="text-muted-foreground">View and manage all your assigned tasks</p>
            </div>
            
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-auto max-w-[200px]"
                  placeholder="Your name"
                />
              </div>
              <Button size="sm" onClick={saveUsername}>Save</Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 animate-scale-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tasks Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2 mb-4" />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold">{totalTasks}</div>
                  <div className="text-xs text-muted-foreground">Total Tasks</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{completedTasks}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 animate-scale-in" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Due Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-24">
                {upcomingDeadlines > 0 ? (
                  <div className="text-center">
                    <div className="text-3xl font-semibold">{upcomingDeadlines}</div>
                    <div className="text-sm text-muted-foreground">tasks due this week</div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                    <div className="text-sm">No upcoming deadlines</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 animate-scale-in" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-24">
                <div className="text-center">
                  <div className="text-3xl font-semibold">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">active projects</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-slide-up">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">To Do</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {displayTasks.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No tasks found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery 
                ? "Try a different search term or filter" 
                : selectedTab === "all" 
                  ? "You don't have any assigned tasks yet" 
                  : `You don't have any ${selectedTab.replace('_', ' ')} tasks`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTasks.map((task, index) => (
              <Card 
                key={task.id} 
                className="hover:shadow-md transition-all border border-border animate-scale-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleTaskClick(task)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium line-clamp-1">{task.title}</CardTitle>
                    <Badge 
                      variant={
                        task.priority === "high" ? "destructive" : 
                        task.priority === "medium" ? "default" : 
                        "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{getProjectTitle(task.projectId)}</p>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {task.description || "No description provided"}
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
                  
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>
                          {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                        </span>
                      </div>
                      <Progress value={getTaskProgress(task)} className="h-1" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{task.dueDate || "No deadline"}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          task.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                          task.status === "in_progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                          task.status === "in_review" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Task Detail Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={closeTaskDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-start gap-2">
                <span>{selectedTask.title}</span>
                <Badge 
                  variant={
                    selectedTask.priority === "high" ? "destructive" : 
                    selectedTask.priority === "medium" ? "default" : 
                    "secondary"
                  }
                >
                  {selectedTask.priority}
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getProjectTitle(selectedTask.projectId)}
              </p>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm">{selectedTask.description || "No description provided"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Status</h3>
                  <Badge className="w-full justify-center py-1" 
                    variant={
                      selectedTask.status === "completed" ? "outline" :
                      selectedTask.status === "in_progress" ? "default" :
                      selectedTask.status === "in_review" ? "secondary" :
                      "outline"
                    }
                  >
                    {selectedTask.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Due Date</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedTask.dueDate || "No deadline"}</span>
                  </div>
                </div>
              </div>
              
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Subtasks</h3>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                        <Checkbox 
                          id={subtask.id} 
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtask(selectedTask.id, subtask.id)}
                        />
                        <label 
                          htmlFor={subtask.id} 
                          className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {subtask.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.collaborators && selectedTask.collaborators.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Collaborators</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.collaborators.map((collaborator) => (
                      <Badge key={collaborator} variant="outline" className="px-2 py-1">
                        {collaborator}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => navigate(`/kanban?projectId=${selectedTask.projectId}`)}
              >
                Go to Project
              </Button>
              
              {selectedTask.status !== "completed" && (
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => markTaskComplete(selectedTask)}
                >
                  Mark as Complete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
