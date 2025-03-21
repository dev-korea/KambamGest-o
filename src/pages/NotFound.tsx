
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 animate-fade-in">
      <div className="glass-card rounded-xl p-10 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-secondary/70 mb-4">
            <span className="text-3xl font-medium">404</span>
          </div>
          <h1 className="text-2xl font-medium mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <button 
          onClick={() => navigate("/")}
          className="btn-primary px-4 py-2 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
