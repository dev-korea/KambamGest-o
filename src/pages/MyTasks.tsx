import { useEffect, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { KanbanTask } from "@/components/KanbanTask";
import { Task } from "@/components/KanbanColumn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    // Carregar todos os projetos
    const storedProjects = localStorage.getItem('projects');
    const projectsList = storedProjects ? JSON.parse(storedProjects) : [];
    setProjects(projectsList);
    
    // Buscar todas as tarefas de todos os projetos
    const allTasks: Task[] = [];
    const username = localStorage.getItem('username') || '';
    
    projectsList.forEach((project: any) => {
      const projectTasks = localStorage.getItem(`tasks-${project.id}`);
      if (projectTasks) {
        const parsedTasks = JSON.parse(projectTasks);
        parsedTasks.forEach((task: any) => {
          // Só adiciona tarefas que estejam atribuídas ao usuário atual
          if (task.assignee && task.assignee.name === username) {
            allTasks.push({
              ...task,
              projectId: project.id
            });
          }
        });
      }
    });
    
    setTasks(allTasks);
  }, []);
  
  const getTasksByStatus = (status: "todo" | "in-progress" | "review" | "completed") => {
    return tasks.filter(task => task.status === status);
  };
  
  const getTasksByPriority = (priority: "high" | "medium" | "low") => {
    return tasks.filter(task => task.priority === priority);
  };
  
  const handleCompleteTask = (taskId: string, projectId: string) => {
    // Buscar as tarefas do projeto
    const projectTasks = localStorage.getItem(`tasks-${projectId}`);
    if (projectTasks) {
      const parsedTasks = JSON.parse(projectTasks);
      const updatedTasks = parsedTasks.map((task: any) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: "completed"
          };
        }
        return task;
      });
      
      // Atualizar no localStorage
      localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
      
      // Atualizar o estado local
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              status: "completed" as "completed" | "todo" | "in-progress" | "review"
            };
          }
          return task;
        })
      );
      
      // Atualizar o progresso do projeto
      updateProjectProgress(projectId);
      
      toast.success("Tarefa concluída com sucesso!");
    }
  };
  
  const updateProjectProgress = (projectId: string) => {
    const projectTasks = localStorage.getItem(`tasks-${projectId}`);
    if (projectTasks) {
      const parsedTasks = JSON.parse(projectTasks);
      const totalTasks = parsedTasks.length;
      const completedTasks = parsedTasks.filter((task: any) => task.status === "completed").length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Atualizar projeto no localStorage
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const updatedProjects = projects.map((p: any) => {
          if (p.id === projectId) {
            return {
              ...p,
              tasksCompleted: completedTasks,
              totalTasks: totalTasks,
              progress: progress
            };
          }
          return p;
        });
        
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }
    }
  };
  
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : "Projeto Desconhecido";
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 mx-auto">
        <h1 className="text-2xl font-medium mb-6">Minhas Tarefas</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="todo">A Fazer</TabsTrigger>
            <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
            <TabsTrigger value="review">Em Revisão</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="priority">Por Prioridade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {task.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Projeto: {getProjectName(task.projectId)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <KanbanTask task={task} />
                      </div>
                      {task.status !== "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleCompleteTask(task.id, task.projectId)}
                        >
                          Marcar como concluída
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Você não tem nenhuma tarefa atribuída.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="todo">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {getTasksByStatus("todo").length > 0 ? (
                getTasksByStatus("todo").map(task => (
                  <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {task.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Projeto: {getProjectName(task.projectId)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <KanbanTask task={task} />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCompleteTask(task.id, task.projectId)}
                      >
                        Marcar como concluída
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Você não tem tarefas a fazer.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="in-progress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {getTasksByStatus("in-progress").length > 0 ? (
                getTasksByStatus("in-progress").map(task => (
                  <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {task.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Projeto: {getProjectName(task.projectId)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <KanbanTask task={task} />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCompleteTask(task.id, task.projectId)}
                      >
                        Marcar como concluída
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Você não tem tarefas em andamento.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="review">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {getTasksByStatus("review").length > 0 ? (
                getTasksByStatus("review").map(task => (
                  <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {task.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Projeto: {getProjectName(task.projectId)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <KanbanTask task={task} />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCompleteTask(task.id, task.projectId)}
                      >
                        Marcar como concluída
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Você não tem tarefas em revisão.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {getTasksByStatus("completed").length > 0 ? (
                getTasksByStatus("completed").map(task => (
                  <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {task.title}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Projeto: {getProjectName(task.projectId)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <KanbanTask task={task} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Você não tem tarefas concluídas.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="priority">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {getTasksByPriority("high").length > 0 && (
                <>
                  <h4 className="col-span-full text-lg font-medium mb-4">Alta Prioridade</h4>
                  {getTasksByPriority("high").map(task => (
                    <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {task.title}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          Projeto: {getProjectName(task.projectId)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <KanbanTask task={task} />
                        </div>
                        {task.status !== "completed" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleCompleteTask(task.id, task.projectId)}
                          >
                            Marcar como concluída
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {getTasksByPriority("medium").length > 0 && (
                <>
                  <h4 className="col-span-full text-lg font-medium mb-4">Média Prioridade</h4>
                  {getTasksByPriority("medium").map(task => (
                    <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {task.title}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          Projeto: {getProjectName(task.projectId)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <KanbanTask task={task} />
                        </div>
                        {task.status !== "completed" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleCompleteTask(task.id, task.projectId)}
                          >
                            Marcar como concluída
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {getTasksByPriority("low").length > 0 && (
                <>
                  <h4 className="col-span-full text-lg font-medium mb-4">Baixa Prioridade</h4>
                  {getTasksByPriority("low").map(task => (
                    <Card key={task.id} className="overflow-hidden border-border shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {task.title}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                          Projeto: {getProjectName(task.projectId)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <KanbanTask task={task} />
                        </div>
                        {task.status !== "completed" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleCompleteTask(task.id, task.projectId)}
                          >
                            Marcar como concluída
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
              
              {getTasksByPriority("high").length === 0 &&
                getTasksByPriority("medium").length === 0 &&
                getTasksByPriority("low").length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Você não tem nenhuma tarefa por prioridade.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
