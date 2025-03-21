
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { ProjectCard } from "@/components/ProjectCard";
import { Plus, Search, Filter, BarChart2, PieChart, CalendarDays } from "lucide-react";

// Sample project data
const projectsData = [
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
  
  const filteredProjects = projectsData.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-16 animate-fade-in">
      <NavBar />
      
      <main className="container px-6 py-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium">Projects Dashboard</h1>
            <p className="text-muted-foreground">Manage and track your marketing projects</p>
          </div>
          
          <button className="btn-primary px-4 py-2 flex items-center gap-2 self-start">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
        
        <div className="mb-8">
          <div className="glass-card rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Active Projects"
                value="6"
                icon={<BarChart2 className="h-5 w-5" />}
                trend="+2 this month"
                trendUp
              />
              
              <StatCard 
                title="Completed Tasks"
                value="59"
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-medium">All Projects</h2>
          
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
            
            <button className="btn-secondary p-2 rounded-md">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id} 
              className="animate-scale-in" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProjectCard
                {...project}
                onClick={() => navigate("/kanban")}
              />
            </div>
          ))}
        </div>
      </main>
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
