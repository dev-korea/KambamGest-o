
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import MyTasks from "./pages/MyTasks";
import TaskTemplates from "./pages/TaskTemplates";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Tutorial from "./components/Tutorial";
import { SidebarProvider } from "./components/ui/sidebar";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(isLoggedIn);
    
    if (isLoggedIn) {
      // Check if this is the first login
      const hasCompletedTutorial = localStorage.getItem('hasCompletedTutorial') === 'true';
      if (!hasCompletedTutorial) {
        setShowTutorial(true);
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const completeTutorial = () => {
    localStorage.setItem('hasCompletedTutorial', 'true');
    setShowTutorial(false);
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return isAuthenticated ? (
    <>
      {children}
      {showTutorial && <Tutorial onComplete={completeTutorial} />}
    </>
  ) : (
    <Navigate to="/auth" replace />
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/kanban" element={
                  <ProtectedRoute>
                    <Kanban />
                  </ProtectedRoute>
                } />
                
                <Route path="/task-templates" element={
                  <ProtectedRoute>
                    <TaskTemplates />
                  </ProtectedRoute>
                } />
                
                <Route path="/my-tasks" element={
                  <ProtectedRoute>
                    <MyTasks />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
