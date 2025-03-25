
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    // Carregar projetos do localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);
  
  const handleCreateProject = (project: any) => {
    const newProjects = [...projects, project];
    setProjects(newProjects);
    
    // Salvar projetos atualizados no localStorage
    localStorage.setItem('projects', JSON.stringify(newProjects));
    setIsCreateModalOpen(false);
  };
  
  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter((project: any) => project.id !== projectId);
    setProjects(updatedProjects);
    
    // Atualizar localStorage
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Também remover tarefas associadas ao projeto
    localStorage.removeItem(`tasks-${projectId}`);
  };
  
  const getFilteredProjects = () => {
    switch (activeTab) {
      case "active":
        return projects.filter((project: any) => project.progress < 100);
      case "completed":
        return projects.filter((project: any) => project.progress === 100);
      default:
        return projects;
    }
  };
  
  const goToProject = (projectId: string) => {
    navigate(`/kanban?projectId=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 mx-auto md:ml-72">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-medium">Painel de Projetos</h1>
            <p className="text-muted-foreground">Gerencie seus projetos e acompanhe seu progresso</p>
          </div>
          
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Novo Projeto</span>
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Em Andamento</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <ProjectsGrid 
              projects={getFilteredProjects()}
              onDelete={handleDeleteProject}
              onClick={goToProject}
            />
          </TabsContent>
          
          <TabsContent value="active" className="mt-6">
            <ProjectsGrid 
              projects={getFilteredProjects()}
              onDelete={handleDeleteProject}
              onClick={goToProject}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            <ProjectsGrid 
              projects={getFilteredProjects()}
              onDelete={handleDeleteProject}
              onClick={goToProject}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

interface ProjectsGridProps {
  projects: any[];
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

function ProjectsGrid({ projects, onDelete, onClick }: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Nenhum projeto encontrado</h3>
        <p className="text-muted-foreground">Crie seu primeiro projeto para começar</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: any) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={() => onDelete(project.id)}
          onClick={() => onClick(project.id)}
        />
      ))}
    </div>
  );
}
