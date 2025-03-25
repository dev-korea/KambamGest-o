
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { isTaskOverdue, isTaskDueToday, wasCompletedYesterday, normalizeStatus } from "@/utils/taskStatusMapper";

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
  
  useEffect(() => {
    loadAllTasks();
    
    // Add event listener to reload tasks when localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Add custom event listener for task updates
    window.addEventListener('taskUpdated', loadAllTasks);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('taskUpdated', loadAllTasks);
    };
  }, []);
  
  const handleStorageChange = (e: StorageEvent) => {
    // Reload tasks when localStorage changes and key starts with 'tasks-'
    if (e.key && e.key.startsWith('tasks-')) {
      loadAllTasks();
    }
  };
  
  const loadAllTasks = () => {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      
      const allTasksWithProject: TaskWithProject[] = [];
      const today: TaskWithProject[] = [];
      const overdue: TaskWithProject[] = [];
      const yesterdayCompleted: TaskWithProject[] = [];
      
      // Loop through all projects and their tasks
      projects.forEach((project: any) => {
        const projectTasks = JSON.parse(localStorage.getItem(`tasks-${project.id}`) || '[]');
        
        projectTasks.forEach((task: any) => {
          const taskWithProject = {
            ...task,
            projectName: project.title,
            status: normalizeStatus(task.status)
          };
          
          allTasksWithProject.push(taskWithProject);
          
          // Parse the date properly regardless of format
          const normalizedDueDate = task.dueDate ? 
            (task.dueDate.includes('/') ? task.dueDate : 
             new Date(task.dueDate).toLocaleDateString('pt-BR')) : '';
          
          if (isTaskDueToday(normalizedDueDate)) {
            today.push(taskWithProject);
          }
          
          if (isTaskOverdue(normalizedDueDate)) {
            overdue.push(taskWithProject);
          }
          
          if (wasCompletedYesterday(task)) {
            yesterdayCompleted.push(taskWithProject);
          }
        });
      });
      
      setTodayTasks(today);
      setOverdueTasks(overdue);
      setYesterdayCompletedTasks(yesterdayCompleted);
      
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };
  
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
        <span>Entrega: {task.dueDate}</span>
        {task.assignee && <span>Responsável: {task.assignee.name}</span>}
      </div>
    </div>
  );
}
