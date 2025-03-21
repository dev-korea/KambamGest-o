
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, BarChart2, PieChart, CalendarDays, Trash2, TabletSmartphone } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Sample project data - we'd fetch this from the database in a real app
const initialProjects = [
  {
    id: "project-1",
    title: "Website Redesign",
    description: "Complete overhaul of client's e-commerce website with new branding and improved UX.",
    progress: 75,
    dueDate: "Nov 15, 2023",
    tasksCompleted: 15,
    totalTasks: 20,
  },
  {
    id: "project-2",
    title: "Social Media Campaign",
    description: "Develop and execute a comprehensive social media campaign for product launch.",
    progress: 30,
    dueDate: "Dec 1, 2023",
    tasksCompleted: 6,
    totalTasks: 20,
  },
  {
    id: "project-3",
    title: "Email Marketing",
    description: "Create a series of email newsletters to promote upcoming events and webinars.",
    progress: 50,
    dueDate: "Nov 20, 2023",
    tasksCompleted: 5,
    totalTasks: 10,
  },
  {
    id: "project-4",
    title: "Content Strategy",
    description: "Develop comprehensive content plan for Q4 including blog posts, videos, and social content.",
    progress: 15,
    dueDate: "Dec 15, 2023",
    tasksCompleted: 3,
    totalTasks: 20,
  },
  {
    id: "project-5",
    title: "Brand Refresh",
    description: "Update visual identity including logo, color palette, and brand guidelines.",
    progress: 90,
    dueDate: "Oct 30, 2023",
    tasksCompleted: 18,
    totalTasks: 20,
  },
  {
    id: "project-6",
    title: "SEO Optimization",
    description: "Improve search engine rankings through keyword research and on-page optimization.",
    progress: 60,
    dueDate: "Nov 25, 2023",
    tasksCompleted: 12,
    totalTasks: 20,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedTab, setSelectedTab] = useState("all");
  
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectCreate = (newProject: any) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    toast("Project deleted successfully", {
      description: "The project has been permanently removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16 animate-fade-in">
      <NavBar />
      
      <main className="container px-6 py-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium">Projects Dashboard</h1>
            <p className="text-muted-foreground">Manage and track your marketing projects</p>
          </div>
          
          <button 
            className="btn-primary px-4 py-2 flex items-center gap-2 self-start"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
        
        <div className="mb-8">
          <div className="glass-card rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Active Projects"
                value={projects.length.toString()}
                icon={<BarChart2 className="h-5 w-5" />}
                trend="+2 this month"
                trendUp
              />
              
              <StatCard 
                title="Completed Tasks"
                value={projects.reduce((total, project) => total + project.tasksCompleted, 0).toString()}
                icon={<PieChart className="h-5 w-5" />}
                trend="12 this week"
                trendUp
              />
              
              <StatCard 
                title="Upcoming Deadlines"
                value="4"
                icon={<CalendarDays className="h-5 w-5" />}
                trend="Next: Nov 15"
              />
            </div>
          </div>
        </div>
        
        {/* Project Tabs */}
        <div className="mb-4">
          <ToggleGroup type="single" value={selectedTab} onValueChange={(value) => value && setSelectedTab(value)}>
            <ToggleGroupItem value="all" aria-label="All Projects">All Projects</ToggleGroupItem>
            <ToggleGroupItem value="active" aria-label="Active">Active</ToggleGroupItem>
            <ToggleGroupItem value="completed" aria-label="Completed">Completed</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-medium">
            {selectedTab === "all" ? "All Projects" : 
             selectedTab === "active" ? "Active Projects" : "Completed Projects"}
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
              <ToggleGroupItem value="grid" aria-label="Grid View">
                <div className="sr-only">Grid View</div>
                <TabletSmartphone className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List View">
                <div className="sr-only">List View</div>
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
              <div className="relative group">
                <ProjectCard
                  {...project}
                  onClick={() => navigate(`/kanban?projectId=${project.id}`)}
                />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/kanban?projectId=${project.id}`)}>
                      View Kanban
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectDelete(project.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
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
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
