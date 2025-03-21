
import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Kanban() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This would normally fetch project data from a database
  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    
    // Simulate API call to get project data
    setTimeout(() => {
      // If no project ID is provided or it's invalid, use default project
      if (!projectId) {
        setProject({
          id: "default-project",
          title: "Default Project",
          description: "This is a default project view.",
        });
      } else {
        // In a real app, we would fetch the specific project data
        // For now, we'll just create mock data based on the ID
        setProject({
          id: projectId,
          title: `Project ${projectId.split('-')[1]}`,
          description: "This is the project description.",
        });
      }
      
      setIsLoading(false);
    }, 500);
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <NavBar />
        <main className="container px-6 py-8 mx-auto">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-pulse text-xl">Loading project...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <NavBar />
      <main className="container px-6 py-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-medium">{project?.title || "Kanban Board"}</h1>
            <p className="text-muted-foreground">{project?.description || "Manage your tasks with drag and drop"}</p>
          </div>
        </div>
        
        <KanbanBoard projectId={projectId || "default"} />
      </main>
    </div>
  );
}
