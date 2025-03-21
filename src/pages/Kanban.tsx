
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { toast } from "sonner";

export default function Kanban() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<{id: string; title: string; description: string} | null>(null);
  
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    
    if (projectId) {
      // Get projects from local storage to match Dashboard behavior
      const storedProjects = localStorage.getItem('projects');
      const projects = storedProjects ? JSON.parse(storedProjects) : [];
      
      const foundProject = projects.find((p: any) => p.id === projectId);
      
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast.error("Project not found");
        navigate('/dashboard'); // Redirect to dashboard if project doesn't exist
      }
    } else {
      toast.error("No project ID provided");
      navigate('/dashboard'); // Redirect to dashboard
    }
  }, [searchParams, navigate]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container px-6 py-8 mx-auto pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">Please select a project from the dashboard.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 mx-auto overflow-x-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        
        <KanbanBoard projectId={project.id} />
      </main>
    </div>
  );
}
