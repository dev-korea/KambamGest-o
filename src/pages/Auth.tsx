
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<{name: string, email: string}[]>([]);

  useEffect(() => {
    // Load registered users
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      setRegisteredUsers(JSON.parse(storedUsers));
    }
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail.trim()) {
      toast.error("Por favor, insira seu email");
      return;
    }
    
    // Check if email exists
    const foundUser = registeredUsers.find(user => 
      user.email.toLowerCase() === loginEmail.toLowerCase()
    );
    
    if (!foundUser) {
      toast.error("Email não encontrado. Por favor, registre-se primeiro.");
      return;
    }
    
    // Set logged in state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', foundUser.name);
    
    toast.success(`Bem-vindo de volta, ${foundUser.name}!`);
    navigate('/dashboard');
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    // Check if email already exists
    if (registeredUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      toast.error("Este email já está registrado");
      return;
    }
    
    // Add new user
    const newUsers = [...registeredUsers, { name: username, email }];
    localStorage.setItem('registeredUsers', JSON.stringify(newUsers));
    setRegisteredUsers(newUsers);
    
    // Set logged in state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    
    toast.success("Registro concluído com sucesso!");
    navigate('/dashboard');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-md mx-4 animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">TaskFlow</CardTitle>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mx-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Seu email"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">Entrar</Button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <p>
                  Ainda não tem uma conta?{" "}
                  <button 
                    onClick={() => setActiveTab("register")} 
                    className="text-primary hover:underline focus:outline-none"
                  >
                    Registre-se
                  </button>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">Nome</label>
                  <Input 
                    id="username" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu email"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">Registrar</Button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <p>
                  Já possui uma conta?{" "}
                  <button 
                    onClick={() => setActiveTab("login")} 
                    className="text-primary hover:underline focus:outline-none"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TaskFlow. Todos os direitos reservados.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
