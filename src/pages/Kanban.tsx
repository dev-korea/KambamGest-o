
import { NavBar } from "@/components/NavBar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ArrowLeft, CalendarDays, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Kanban() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-16 animate-fade-in">
      <NavBar />
      
      <main className="container px-0 py-8 mx-auto">
        <div className="px-6 mb-8">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">Website Redesign</h1>
              <p className="text-muted-foreground">Project Kanban Board</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>Due: Nov 15, 2023</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>15/20 tasks</span>
              </div>
              
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-white ring-2 ring-background">
                  AC
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-medium text-white ring-2 ring-background">
                  JS
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-medium text-white ring-2 ring-background">
                  RJ
                </div>
                <button className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium ring-2 ring-background">
                  <Users className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}
