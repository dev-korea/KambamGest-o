
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { 
  isTaskOverdue, 
  isTaskDueToday, 
  wasCompletedYesterday, 
  normalizeStatus, 
  parseDateString,
  formatDateForDisplay 
} from "@/utils/taskStatusMapper";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: string;
  dueDate: string;
  projectId: string;
  tags?: string[];
  notes?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  completedDate?: string;
}

interface TaskWithProject extends Task {
  projectName: string;
}

interface DailyTaskOverviewProps {
  className?: string;
}

export function DailyTaskOverview({ className }: DailyTaskOverviewProps) {
  const [todayTasks, setTodayTasks] = useState<TaskWithProject[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithProject[]>([]);
  const [yesterdayCompletedTasks, setYesterdayCompletedTasks] = useState<TaskWithProject[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Create a memoized loadAllTasks function that doesn't change on every render
  const loadAllTasks = useCallback(() => {
    try {
      console.log("Loading all tasks for daily overview");
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      
      const allTasksWithProject: TaskWithProject[] = [];
      const today: TaskWithProject[] = [];
      const overdue: TaskWithProject[] = [];
      const yesterdayCompleted: TaskWithProject[] = [];
      
      // Loop through all projects and their tasks
      projects.forEach((project: any) => {
        if (!project || !project.id) return;
        
        const projectTasksKey = `tasks-${project.id}`;
        const projectTasks = localStorage.getItem(projectTasksKey);
        
        if (projectTasks) {
          try {
            const tasks = JSON.parse(projectTasks);
            
            tasks.forEach((task: any) => {
              // Skip tasks without proper data
              if (!task || !task.id) return;
              
              const taskWithProject = {
                ...task,
                projectId: project.id,
                projectName: project.title || 'Projeto sem nome',
                status: normalizeStatus(task.status)
              };
              
              allTasksWithProject.push(taskWithProject);
              
              // Check if task is due today
              if (isTaskDueToday(task.dueDate)) {
                today.push(taskWithProject);
              }
              
              // Check if task is overdue
              if (isTaskOverdue(task.dueDate)) {
                overdue.push(taskWithProject);
              }
              
              // Check if task was completed yesterday
              if (wasCompletedYesterday(task)) {
                yesterdayCompleted.push(taskWithProject);
              }
            });
          } catch (error) {
            console.error(`Error parsing tasks for project ${project.id}:`, error);
          }
        }
      });
      
      console.log("Daily tasks loaded:", {
        today: today.length,
        overdue: overdue.length,
        yesterdayCompleted: yesterdayCompleted.length
      });
      
      setTodayTasks(today);
      setOverdueTasks(overdue);
      setYesterdayCompletedTasks(yesterdayCompleted);
      
    } catch (error) {
      console.error("Error loading tasks:", error);
      // Force a refresh on error, but limit it to avoid infinite loops
      if (refreshCount < 3) {
        setTimeout(() => setRefreshCount(prev => prev + 1), 500);
      }
    }
  }, [refreshCount]);
  
  useEffect(() => {
    // Initial load
    loadAllTasks();
    
    // Add event listeners for task updates with properly named functions
    // to avoid anonymous function issues with event removal
    const handleStorageChange = (e: StorageEvent) => {
      // Reload tasks when localStorage changes and key starts with 'tasks-'
      if (e.key && e.key.startsWith('tasks-')) {
        console.log("Storage change detected for tasks, reloading daily overview");
        loadAllTasks();
      }
    };
    
    const handleTaskUpdated = () => {
      console.log("Task updated event detected, reloading daily overview");
      loadAllTasks();
    };
    
    const handleTaskDateChanged = () => {
      console.log("Task date changed event detected, reloading daily overview");
      loadAllTasks();
    };
    
    const handleDailyTasksRefresh = () => {
      console.log("Daily tasks refresh event detected");
      loadAllTasks();
    };
    
    // Add all event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('taskUpdated', handleTaskUpdated);
    window.addEventListener('taskDateChanged', handleTaskDateChanged);
    window.addEventListener('dailyTasksRefresh', handleDailyTasksRefresh);
    
    // Force refresh every time component mounts to ensure data is current
    const refreshInterval = setInterval(() => {
      loadAllTasks();
    }, 60000); // Refresh every minute
    
    return () => {
      // Remove all event listeners on cleanup
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('taskUpdated', handleTaskUpdated);
      window.removeEventListener('taskDateChanged', handleTaskDateChanged);
      window.removeEventListener('dailyTasksRefresh', handleDailyTasksRefresh);
      clearInterval(refreshInterval);
    };
  }, [loadAllTasks]);
  
  // Force refresh when component is visible by adding refreshCount as a dependency
  useEffect(() => {
    loadAllTasks();
  }, [refreshCount, loadAllTasks]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Visão Diária das Tarefas</CardTitle>
        <CardDescription>
          Visualize as tarefas para hoje, atrasadas e concluídas ontem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Hoje</span>
              {todayTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {todayTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Atrasadas</span>
              {overdueTasks.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {overdueTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="yesterday" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Ontem</span>
              {yesterdayCompletedTasks.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {yesterdayCompletedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="pt-4">
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    priorityColor={getPriorityColor(task.priority)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhuma tarefa programada para hoje</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="overdue" className="pt-4">
            {overdueTasks.length > 0 ? (
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    priorityColor={getPriorityColor(task.priority)} 
                    isOverdue 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Sem tarefas atrasadas. Bom trabalho!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="yesterday" className="pt-4">
            {yesterdayCompletedTasks.length > 0 ? (
              <div className="space-y-2">
                {yesterdayCompletedTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    priorityColor={getPriorityColor(task.priority)} 
                    completed 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhuma tarefa foi concluída ontem</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  task: TaskWithProject;
  priorityColor: string;
  isOverdue?: boolean;
  completed?: boolean;
}

function TaskItem({ task, priorityColor, isOverdue, completed }: TaskItemProps) {
  return (
    <div className="p-3 border rounded-md bg-card">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{task.title}</h4>
          <Badge className={priorityColor}>
            {task.priority}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="ml-1">
              Atrasada
            </Badge>
          )}
          {completed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
              Concluída
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {task.projectName}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>Entrega: {formatDateForDisplay(task.dueDate)}</span>
        {task.assignee && <span>Responsável: {task.assignee.name}</span>}
      </div>
    </div>
  );
}
