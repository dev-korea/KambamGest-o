
import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, ShieldAlert } from "lucide-react";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<{name: string, email: string}[]>([]);

  // Carregar dados do usuário do localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Buscar email do usuário atual
    const usersData = localStorage.getItem('registeredUsers');
    if (usersData) {
      const users = JSON.parse(usersData);
      setRegisteredUsers(users);
      
      // Tentar encontrar o email do usuário atual
      const currentUser = users.find((user: {name: string, email: string}) => 
        user.name === storedUsername
      );
      
      if (currentUser) {
        setEmail(currentUser.email);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    if (!username.trim()) {
      toast.error("O nome de usuário é obrigatório");
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error("Digite um email válido");
      return;
    }

    setIsSaving(true);

    try {
      // Atualizar nome de usuário
      localStorage.setItem('username', username);
      
      // Atualizar o email na lista de usuários registrados
      const updatedUsers = registeredUsers.map(user => {
        // Se encontrar o usuário atual pelo nome anterior, atualiza nome e email
        if (user.name === localStorage.getItem('username')) {
          return { name: username, email: email };
        }
        return user;
      });
      
      // Se não encontrou um usuário existente, adiciona um novo
      if (!updatedUsers.some(user => user.name === username)) {
        updatedUsers.push({ name: username, email: email });
      }
      
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      setRegisteredUsers(updatedUsers);
      
      toast.success("Perfil atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Ocorreu um erro ao salvar o perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 py-8 mx-auto pt-24">
        <h1 className="text-2xl font-medium mb-6">Configurações</h1>
        
        <Tabs defaultValue="profile" className="w-full max-w-3xl">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Conta</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais. Estas informações serão exibidas para outros usuários.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este email será usado para vincular tarefas e colaboradores.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Conta</CardTitle>
                <CardDescription>
                  Gerencie suas configurações de conta e preferências.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Usuários registrados</h3>
                  <div className="border rounded-md p-4 bg-muted/30">
                    <div className="grid grid-cols-2 gap-2 font-medium text-sm mb-2">
                      <div>Nome</div>
                      <div>Email</div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {registeredUsers.map((user, index) => (
                        <div key={index} className="grid grid-cols-2 gap-2 text-sm">
                          <div>{user.name}</div>
                          <div>{user.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
