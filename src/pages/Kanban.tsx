
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectOverview } from "@/components/ProjectOverview";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Kanban() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<{id: string; title: string; description: string} | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    progress: 0
  });
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    
    if (projectId) {
      // Get projects from local storage to match Dashboard behavior
      const storedProjects = localStorage.getItem('projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      const foundProject = projects.find((p: any) => p.id === projectId);
      
      if (foundProject) {
        setProject(foundProject);
        updateTaskStats(projectId);
        
        // Verifica se é a primeira vez que o usuário acessa o Kanban
        const hasSeenTutorial = localStorage.getItem('hasSeenKanbanTutorial');
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        }
      } else {
        toast.error("Projeto não encontrado");
        navigate('/dashboard'); // Redireciona para o dashboard se o projeto não existir
      }
    } else {
      toast.error("Nenhum ID de projeto fornecido");
      navigate('/dashboard'); // Redireciona para o dashboard
    }
  }, [searchParams, navigate]);

  // Função para atualizar as estatísticas de tarefas do projeto atual
  const updateTaskStats = (projectId: string) => {
    const projectTasks = localStorage.getItem(`tasks-${projectId}`);
    if (projectTasks) {
      const tasks = JSON.parse(projectTasks);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task: any) => task.status === "completed").length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      setTaskStats({
        total: totalTasks,
        completed: completedTasks,
        progress: progress
      });
      
      // Atualiza o progresso do projeto na lista de projetos
      updateProjectProgress(projectId, completedTasks, totalTasks, progress);
    } else {
      setTaskStats({
        total: 0,
        completed: 0,
        progress: 0
      });
      
      // Redefinir o progresso na lista de projetos
      updateProjectProgress(projectId, 0, 0, 0);
    }
  };
  
  // Atualizar o progresso do projeto no localStorage
  const updateProjectProgress = (
    projectId: string, 
    completed: number, 
    total: number, 
    progress: number
  ) => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projects = JSON.parse(storedProjects);
      const updatedProjects = projects.map((p: any) => {
        if (p.id === projectId) {
          return {
            ...p,
            tasksCompleted: completed,
            totalTasks: total,
            progress: progress
          };
        }
        return p;
      });
      
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };
  
  // Atualiza as estatísticas de tarefas quando as tarefas são modificadas no componente KanbanBoard
  const handleTasksChanged = () => {
    if (project) {
      updateTaskStats(project.id);
    }
  };
  
  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenKanbanTutorial', 'true');
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container px-6 py-8 mx-auto pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Projeto Não Encontrado</h1>
            <p className="text-muted-foreground">Por favor, selecione um projeto do painel.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 mx-auto md:ml-72">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progresso: {taskStats.progress}%</span>
              <span>{taskStats.completed}/{taskStats.total} tarefas concluídas</span>
            </div>
            <Progress value={taskStats.progress} className="h-2" />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tasks">Quadro de Tarefas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <ProjectOverview 
              projectId={project.id} 
              projectTitle={project.title} 
              projectDescription={project.description} 
            />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <KanbanBoard 
              projectId={project.id} 
              onTasksChanged={handleTasksChanged}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Bem-vindo ao Kanban!</h2>
            <div className="space-y-4">
              <p>Aqui você pode gerenciar as tarefas do seu projeto de forma visual e intuitiva.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Arraste as tarefas entre as colunas para atualizar seu status</li>
                <li>Clique no ícone de mensagem em uma tarefa para adicionar anotações</li>
                <li>Acompanhe o progresso do projeto pela barra no topo</li>
                <li>Use a barra lateral para navegar entre as seções do aplicativo</li>
              </ul>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={skipTutorial}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Pular Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
