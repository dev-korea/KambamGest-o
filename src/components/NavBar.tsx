
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Kanban, Settings, User, LogOut, Moon, Sun, CheckSquare, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Kanban", path: "/kanban", icon: Kanban },
    { name: "My Tasks", path: "/my-tasks", icon: CheckSquare },
    { name: "Templates", path: "/task-templates", icon: FileText },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <nav className="container px-6 h-16 mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div 
            className="font-semibold text-xl cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            Flowspace
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "nav-link flex items-center gap-2",
                location.pathname.includes(item.path) && "nav-link-active"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* User Menu & Dark Mode (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="h-4 w-4 hidden dark:block" />
            <Switch 
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-secondary transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(username)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/my-tasks')}>
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>My Tasks</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-md animate-slide-down">
          <div className="container px-6 py-4 flex flex-col space-y-2">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(username)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{username}</div>
                <div className="text-xs text-muted-foreground">Logged in</div>
              </div>
            </div>
            
            <div className="h-px bg-border my-1"></div>
            
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "nav-link flex items-center gap-2 py-3",
                  location.pathname.includes(item.path) && "nav-link-active"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}

            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">Dark Mode</span>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
                <Switch 
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
            
            <div className="h-px bg-border my-1"></div>
            
            <button 
              className="nav-link flex items-center gap-2 py-3"
              onClick={() => {
                navigate('/settings');
                setIsMenuOpen(false);
              }}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button className="nav-link flex items-center gap-2 py-3 text-destructive" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
