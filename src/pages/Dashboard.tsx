
import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserInvitations } from "@/components/UserInvitations";

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Load projects from localStorage
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      window.location.href = '/auth';
      return;
    }
    
    // Get projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    const loadedProjects = storedProjects ? JSON.parse(storedProjects) : [];
    setProjects(loadedProjects);
    
    // Count completed tasks across all projects
    let completedCount = 0;
    let totalCount = 0;
    
    loadedProjects.forEach((project: any) => {
      const projectId = project.id;
      const storedTasks = localStorage.getItem(`tasks-${projectId}`);
      
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        totalCount += tasks.length;
        completedCount += tasks.filter((task: any) => task.status === "completed").length;
      }
    });
    
    setCompletedTasks(completedCount);
    setTotalTasks(totalCount);
    setIsLoading(false);
  }, []);
  
  // Create a new project
  const handleCreateProject = (project: any) => {
    const newProjects = [...projects, project];
    setProjects(newProjects);
    localStorage.setItem('projects', JSON.stringify(newProjects));
  };
  
  // Delete a project
  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Also remove tasks for this project
    localStorage.removeItem(`tasks-${projectId}`);
  };

  // Clear all projects
  const handleClearAllProjects = () => {
    // Clear projects
    setProjects([]);
    localStorage.setItem('projects', JSON.stringify([]));
    
    // Clear tasks for all projects
    projects.forEach(project => {
      localStorage.removeItem(`tasks-${project.id}`);
    });
    
    // Reset task counters
    setCompletedTasks(0);
    setTotalTasks(0);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 pb-12 mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects and view overall progress</p>
        </div>
        
        {/* Display any pending invitations at the top */}
        <div className="mb-8">
          <UserInvitations />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-medium">Projects</h2>
            <p className="text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''} · 
              {totalTasks > 0 ? ` ${completedTasks} of ${totalTasks} tasks completed` : ' No tasks yet'}
            </p>
          </div>
          <div className="flex gap-2">
            {projects.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAllProjects}
              >
                Clear All Projects
              </Button>
            )}
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg border-muted-foreground/20">
            <div className="text-center max-w-md">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first project to start organizing your tasks.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>
      
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
