
import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ClipboardCheck, CheckSquare, Clock, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/components/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function MyTasks() {
  const [isLoading, setIsLoading] = useState(true);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get current username
    const username = localStorage.getItem('username') || '';
    
    // Get all projects
    const storedProjects = localStorage.getItem('projects');
    const allProjects = storedProjects ? JSON.parse(storedProjects) : [];
    setProjects(allProjects);
    
    // Collect tasks from all projects that are assigned to the current user
    const userTasks: Task[] = [];
    
    allProjects.forEach((project: any) => {
      const projectId = project.id;
      const storedTasks = localStorage.getItem(`tasks-${projectId}`);
      
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const assignedTasks = tasks.filter((task: any) => 
          task.assignee && task.assignee.name.toLowerCase() === username.toLowerCase()
        ).map((task: any) => ({
          ...task,
          projectId: projectId,
          projectTitle: project.title
        }));
        
        userTasks.push(...assignedTasks);
      }
    });
    
    setMyTasks(userTasks as Task[]);
    setIsLoading(false);
  }, []);
  
  // Count tasks by status
  const tasksByStatus = {
    todo: myTasks.filter(task => task.status === "todo").length,
    inProgress: myTasks.filter(task => task.status === "in-progress").length,
    review: myTasks.filter(task => task.status === "review").length,
    completed: myTasks.filter(task => task.status === "completed").length,
  };
  
  const totalTasks = myTasks.length;
  const completedPercentage = totalTasks > 0 
    ? Math.round((tasksByStatus.completed / totalTasks) * 100) 
    : 0;
  
  // Group tasks by project
  const tasksByProject = myTasks.reduce((acc: {[key: string]: Task[]}, task: Task & {projectId: string}) => {
    if (!acc[task.projectId]) {
      acc[task.projectId] = [];
    }
    acc[task.projectId].push(task);
    return acc;
  }, {});
  
  // Sort tasks by status: todo, in-progress, review, completed
  const sortedTasks = [...myTasks].sort((a, b) => {
    const order = { "todo": 0, "in-progress": 1, "review": 2, "completed": 3 };
    return order[a.status as keyof typeof order] - order[b.status as keyof typeof order];
  });
  
  // Function to get human-readable status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "todo": return "To Do";
      case "in-progress": return "In Progress";
      case "review": return "Review";
      case "completed": return "Completed";
      default: return status;
    }
  };
  
  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-500";
      case "in-progress": return "bg-blue-500";
      case "review": return "bg-amber-500";
      case "completed": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };
  
  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
    }
  };
  
  // Handle task click to navigate to the project's kanban board
  const handleTaskClick = (projectId: string) => {
    navigate(`/kanban?projectId=${projectId}`);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 pb-10 mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">My Tasks</h1>
          <p className="text-muted-foreground">View and manage all tasks assigned to you</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : myTasks.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">No tasks assigned to you yet</h2>
            <p className="text-muted-foreground mb-6">
              Tasks assigned to you from any project will appear here.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <Progress value={completedPercentage} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedPercentage}% completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">To Do</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasksByStatus.todo}</div>
                  <div className="text-xs text-muted-foreground">
                    {((tasksByStatus.todo / totalTasks) * 100).toFixed(0)}% of all tasks
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasksByStatus.inProgress}</div>
                  <div className="text-xs text-muted-foreground">
                    {((tasksByStatus.inProgress / totalTasks) * 100).toFixed(0)}% of all tasks
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasksByStatus.completed}</div>
                  <div className="text-xs text-muted-foreground">
                    {((tasksByStatus.completed / totalTasks) * 100).toFixed(0)}% of all tasks
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="byProject">By Project</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {sortedTasks.map((task) => (
                  <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task.projectId)}>
                    <div className={`h-1.5 w-full ${getStatusColor(task.status)}`}></div>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {task.description || "No description"}
                            </p>
                          </div>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                            <span>{getStatusDisplay(task.status)}</span>
                          </div>
                          
                          {task.projectTitle && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <CheckSquare className="h-3.5 w-3.5 mr-1" />
                              <span>{task.projectTitle}</span>
                            </div>
                          )}
                          
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Subtasks</span>
                              <span>
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                              </span>
                            </div>
                            <Progress 
                              value={(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100} 
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="byProject">
                {Object.keys(tasksByProject).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No tasks found</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(tasksByProject).map(([projectId, tasks]) => {
                      const project = projects.find(p => p.id === projectId);
                      return (
                        <div key={projectId} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">{project?.title || "Unknown Project"}</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/kanban?projectId=${projectId}`)}
                            >
                              View Project
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.map((task) => (
                              <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task.projectId)}>
                                <div className={`h-1.5 w-full ${getStatusColor(task.status)}`}></div>
                                <CardContent className="p-4">
                                  <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium">{task.title}</h4>
                                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {task.description || "No description"}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                                        <span>{getStatusDisplay(task.status)}</span>
                                      </div>
                                      
                                      {task.dueDate && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          <Calendar className="h-3.5 w-3.5 mr-1" />
                                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
