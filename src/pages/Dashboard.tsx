import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { DailyTaskOverview } from "@/components/DailyTaskOverview";
import { Plus, Search, Filter, BarChart2, PieChart, CalendarDays, TabletSmartphone } from "lucide-react";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedTab, setSelectedTab] = useState("all");
  const [completedTasks, setCompletedTasks] = useState(0);
  
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const loadedProjects = JSON.parse(storedProjects);
      
      const projectsWithProgress = loadedProjects.map((project: any) => {
        const updatedProject = { ...project };
        const projectTasks = localStorage.getItem(`tasks-${project.id}`);
        
        if (projectTasks) {
          const tasks = JSON.parse(projectTasks);
          const totalTasks = tasks.length;
          const completedTasksCount = tasks.filter((task: any) => task.status === "completed").length;
          
          updatedProject.totalTasks = totalTasks;
          updatedProject.tasksCompleted = completedTasksCount;
          
          updatedProject.progress = totalTasks > 0 
            ? Math.round((completedTasksCount / totalTasks) * 100) 
            : 0;
        } else {
          updatedProject.totalTasks = 0;
          updatedProject.tasksCompleted = 0;
          updatedProject.progress = 0;
        }
        
        return updatedProject;
      });
      
      setProjects(projectsWithProgress);
    } else {
      setProjects([]);
      localStorage.setItem('projects', JSON.stringify([]));
    }

    countCompletedTasks();
  }, []);

  const countCompletedTasks = () => {
    let totalCompleted = 0;
    
    const storedProjects = localStorage.getItem('projects');
    const projects = storedProjects ? JSON.parse(storedProjects) : [];
    
    projects.forEach((project: any) => {
      const projectTasks = localStorage.getItem(`tasks-${project.id}`);
      if (projectTasks) {
        const tasks = JSON.parse(projectTasks);
        const completed = tasks.filter((task: any) => task.status === "completed").length;
        totalCompleted += completed;
      }
    });
    
    setCompletedTasks(totalCompleted);
  };
  
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectCreate = (newProject: any) => {
    const projectWithProgress = {
      ...newProject,
      progress: 0,
      tasksCompleted: 0,
      totalTasks: 0
    };
    
    const updatedProjects = [...projects, projectWithProgress];
    setProjects(updatedProjects);
  };

  const handleProjectDelete = (projectId: string) => {
    localStorage.removeItem(`tasks-${projectId}`);
    
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    toast("Projeto excluído com sucesso", {
      description: "O projeto foi removido permanentemente.",
    });
    
    setTimeout(() => {
      countCompletedTasks();
    }, 100);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/kanban?projectId=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background pt-16 animate-fade-in">
      <NavBar />
      
      <main className="container px-6 py-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium">Painel de Projetos</h1>
            <p className="text-muted-foreground">Gerencie e acompanhe seus projetos de marketing</p>
          </div>
          
          <button 
            className="btn-primary px-4 py-2 flex items-center gap-2 self-start"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
        
        {projects.length > 0 ? (
          <>
            <div className="mb-8">
              <div className="glass-card rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <StatCard 
                    title="Projetos Ativos"
                    value={projects.length.toString()}
                    icon={<BarChart2 className="h-5 w-5" />}
                    trend="+2 este mês"
                    trendUp
                  />
                  
                  <StatCard 
                    title="Tarefas Concluídas"
                    value={completedTasks.toString()}
                    icon={<PieChart className="h-5 w-5" />}
                    trend={`${completedTasks > 0 ? completedTasks : 'Sem'} tarefa${completedTasks !== 1 ? 's' : ''} esta semana`}
                    trendUp={completedTasks > 0}
                  />
                  
                  <StatCard 
                    title="Prazos Próximos"
                    value="4"
                    icon={<CalendarDays className="h-5 w-5" />}
                    trend="Próximo: 15 de nov"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <DailyTaskOverview className="glass-card" />
            </div>
            
            <div className="mb-4">
              <ToggleGroup type="single" value={selectedTab} onValueChange={(value) => value && setSelectedTab(value)}>
                <ToggleGroupItem value="all" aria-label="Todos os Projetos">Todos os Projetos</ToggleGroupItem>
                <ToggleGroupItem value="active" aria-label="Ativos">Ativos</ToggleGroupItem>
                <ToggleGroupItem value="completed" aria-label="Concluídos">Concluídos</ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-medium">
                {selectedTab === "all" ? "Todos os Projetos" : 
                selectedTab === "active" ? "Projetos Ativos" : "Projetos Concluídos"}
              </h2>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar projetos..."
                    className="pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
                  <ToggleGroupItem value="grid" aria-label="Visualização em Grade">
                    <div className="sr-only">Visualização em Grade</div>
                    <TabletSmartphone className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="Visualização em Lista">
                    <div className="sr-only">Visualização em Lista</div>
                    <Filter className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={viewMode === "grid" ? "animate-scale-in" : "animate-slide-up"}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    progress={project.progress || 0}
                    dueDate={project.dueDate || "Sem prazo"}
                    tasksCompleted={project.tasksCompleted || 0}
                    totalTasks={project.totalTasks || 0}
                    onClick={() => handleProjectClick(project.id)}
                    onDelete={handleProjectDelete}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <BarChart2 className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold">Nenhum projeto ainda</h2>
            <p className="text-muted-foreground mt-2 mb-8">
              Crie seu primeiro projeto para começar
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          </div>
        )}
      </main>
      
      <CreateProjectModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
        onProjectCreate={handleProjectCreate}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-medium">{value}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

