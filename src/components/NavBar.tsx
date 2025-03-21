
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, LayoutDashboard, Kanban, Settings, User, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Kanban", path: "/kanban", icon: Kanban },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <nav className="container px-6 h-16 mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-xl">Flowspace</div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "nav-link flex items-center gap-2",
                location.pathname === item.path && "nav-link-active"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* User Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <button className="nav-link rounded-full p-2 aspect-square">
            <User className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-secondary"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-border shadow-md animate-slide-down">
          <div className="container px-6 py-4 flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "nav-link flex items-center gap-2 py-3",
                  location.pathname === item.path && "nav-link-active"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
            <hr className="my-2" />
            <button className="nav-link flex items-center gap-2 py-3">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button className="nav-link flex items-center gap-2 py-3">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button className="nav-link flex items-center gap-2 py-3 text-destructive">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
