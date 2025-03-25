
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectOverview } from "@/components/ProjectOverview";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      } else {
        toast.error("Project not found");
        navigate('/dashboard'); // Redirect to dashboard if project doesn't exist
      }
    } else {
      toast.error("No project ID provided");
      navigate('/dashboard'); // Redirect to dashboard
    }
  }, [searchParams, navigate]);

  // Function to update task statistics for the current project
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
      
      // Update project progress in projects list
      updateProjectProgress(projectId, completedTasks, totalTasks, progress);
    } else {
      setTaskStats({
        total: 0,
        completed: 0,
        progress: 0
      });
      
      // Reset progress in project list
      updateProjectProgress(projectId, 0, 0, 0);
    }
  };
  
  // Update project progress in localStorage
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
  
  // Update task stats when tasks are modified in KanbanBoard component
  const handleTasksChanged = () => {
    if (project) {
      updateTaskStats(project.id);
    }
  };

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
      
      <main className="container px-6 pt-24 mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Progress: {taskStats.progress}%</span>
            <span>•</span>
            <span>{taskStats.completed}/{taskStats.total} tasks completed</span>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Task Board</TabsTrigger>
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
    </div>
  );
}
