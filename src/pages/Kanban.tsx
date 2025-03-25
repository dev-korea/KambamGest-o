
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ProjectMembers } from "@/components/ProjectMembers";
import { UserInvitations } from "@/components/UserInvitations";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Kanban() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<{id: string; title: string; description: string} | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  
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
      
      <main className="container px-6 pt-24 pb-12 mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        
        {/* Display any pending invitations at the top */}
        <div className="mb-8">
          <UserInvitations />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task Board</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <ProjectOverview 
              projectId={project.id} 
              projectTitle={project.title} 
              projectDescription={project.description} 
            />
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <KanbanBoard projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="members" className="mt-6">
            <ProjectMembers 
              projectId={project.id} 
              projectTitle={project.title}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
