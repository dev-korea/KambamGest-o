
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { toast } from "sonner";

// Sample project data - in a real app would fetch this from Supabase
const projects = [
  {
    id: "project-1",
    title: "Website Redesign",
    description: "Complete overhaul of client's e-commerce website with new branding and improved UX."
  },
  {
    id: "project-2",
    title: "Social Media Campaign",
    description: "Develop and execute a comprehensive social media campaign for product launch."
  },
  {
    id: "project-3",
    title: "Email Marketing",
    description: "Create a series of email newsletters to promote upcoming events and webinars."
  },
  {
    id: "project-4",
    title: "Content Strategy",
    description: "Develop comprehensive content plan for Q4 including blog posts, videos, and social content."
  },
  {
    id: "project-5",
    title: "Brand Refresh",
    description: "Update visual identity including logo, color palette, and brand guidelines."
  },
  {
    id: "project-6",
    title: "SEO Optimization",
    description: "Improve search engine rankings through keyword research and on-page optimization."
  }
];

export default function Kanban() {
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<typeof projects[0] | null>(null);
  
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    
    if (projectId) {
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast.error("Project not found");
      }
    } else {
      toast.error("No project ID provided");
    }
  }, [searchParams]);

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
