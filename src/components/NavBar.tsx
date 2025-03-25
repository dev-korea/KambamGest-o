
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Kanban, Settings, User, LogOut, Moon, Sun, FileCheck, CheckSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger 
} from "@/components/ui/sidebar";

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState("Usuário");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { name: "Painel", path: "/dashboard", icon: LayoutDashboard },
    { name: "Kanban", path: "/kanban", icon: Kanban },
    { name: "Modelos de Tarefas", path: "/task-templates", icon: FileCheck },
    { name: "Minhas Tarefas", path: "/my-tasks", icon: CheckSquare },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    navigate('/auth');
    toast.success('Desconectado com sucesso');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mobile NavBar
  if (isMobile) {
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

          {/* User Menu & Dark Mode (Desktop) */}
          <div className="flex items-center gap-4">
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
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/my-tasks')}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>Minhas Tarefas</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Painel</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="p-2 rounded-md hover:bg-secondary"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-md animate-slide-down">
            <div className="container px-6 py-4 flex flex-col space-y-2">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(username)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{username}</div>
                  <div className="text-xs text-muted-foreground">Conectado</div>
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
                <span className="text-sm font-medium">Modo Escuro</span>
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
              
              <button className="nav-link flex items-center gap-2 py-3">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </button>
              <button className="nav-link flex items-center gap-2 py-3 text-destructive" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Desktop Sidebar
  return (
    <div className="flex h-full w-full">
      <Sidebar side="left" className="shadow-md">
        <SidebarHeader className="p-4 border-b">
          <div 
            className="font-semibold text-xl cursor-pointer flex items-center justify-center" 
            onClick={() => navigate('/dashboard')}
          >
            Flowspace
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname.includes(item.path)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Preferências</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm">Modo Escuro</span>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 dark:hidden" />
                  <Moon className="h-4 w-4 hidden dark:block" />
                  <Switch 
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t mt-auto">
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between w-full p-2 rounded-md hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(username)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{username}</span>
                  </div>
                  <Settings className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/my-tasks')}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>Minhas Tarefas</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
        
        <SidebarTrigger className="absolute top-4 right-2" />
      </Sidebar>
    </div>
  );
}
