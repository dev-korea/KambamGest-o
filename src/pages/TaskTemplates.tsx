
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Plus, Search, Tag, Clock, Users, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Use o mesmo tipo Task que é usado no KanbanBoard
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags?: string[];
  assignee?: {
    name: string;
    avatar?: string;
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  status?: "todo" | "in-progress" | "review" | "completed";
}

export default function TaskTemplates() {
  const [templates, setTemplates] = useState<Task[]>(() => {
    const storedTemplates = localStorage.getItem('taskTemplates');
    return storedTemplates ? JSON.parse(storedTemplates) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSubtask, setNewSubtask] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  
  const [newTemplate, setNewTemplate] = useState<Task>({
    id: "",
    title: "",
    description: "",
    priority: "medium",
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    tags: [],
    assignee: { name: "" },
    subtasks: []
  });

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addNewTemplate = () => {
    if (!newTemplate.title.trim()) {
      toast.error("O título da tarefa é obrigatório");
      return;
    }

    const templateToAdd: Task = {
      ...newTemplate,
      id: `template-${Date.now()}`
    };
    
    const updatedTemplates = [...templates, templateToAdd];
    setTemplates(updatedTemplates);
    localStorage.setItem('taskTemplates', JSON.stringify(updatedTemplates));
    
    setNewTemplateOpen(false);
    setNewTemplate({
      id: "",
      title: "",
      description: "",
      priority: "medium",
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      tags: [],
      assignee: { name: "" },
      subtasks: []
    });

    toast.success("Template de tarefa adicionado com sucesso");
  };

  const addToProject = (template: Task) => {
    // Navega para a página do kanban com dados do template
    localStorage.setItem('templateToAdd', JSON.stringify(template));
    window.location.href = '/kanban';
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('taskTemplates', JSON.stringify(updatedTemplates));
    toast.success("Template excluído com sucesso");
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    setNewTemplate({
      ...newTemplate,
      subtasks: [
        ...(newTemplate.subtasks || []),
        { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
      ]
    });
    
    setNewSubtask("");
  };
  
  const addTag = () => {
    if (!newTaskTag.trim()) return;
    if (newTemplate.tags?.includes(newTaskTag)) {
      toast.error("Esta tag já existe");
      return;
    }
    
    setNewTemplate({
      ...newTemplate,
      tags: [...(newTemplate.tags || []), newTaskTag]
    });
    
    setNewTaskTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setNewTemplate({
      ...newTemplate,
      tags: newTemplate.tags?.filter(tag => tag !== tagToRemove)
    });
  };
  
  const removeSubtask = (subtaskId: string) => {
    setNewTemplate({
      ...newTemplate,
      subtasks: newTemplate.subtasks?.filter(subtask => subtask.id !== subtaskId)
    });
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask({...task});
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
  };

  const updateTemplate = (updatedTask: Task) => {
    const updatedTemplates = templates.map(template => 
      template.id === updatedTask.id ? updatedTask : template
    );
    
    setTemplates(updatedTemplates);
    localStorage.setItem('taskTemplates', JSON.stringify(updatedTemplates));
    closeTaskDetail();
    toast.success("Template atualizado com sucesso");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 pt-24 pb-8 mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-medium">Templates de Tarefas</h1>
          <p className="text-muted-foreground">Crie e gerencie templates de tarefas reutilizáveis para seus projetos</p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar templates..."
              className="pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring w-full md:w-auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => setNewTemplateOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Criar Template</span>
          </Button>
        </div>
        
        {templates.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="mb-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ListTodo className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold">Nenhum template ainda</h2>
            <p className="text-muted-foreground mt-2 mb-8 max-w-md mx-auto">
              Crie templates de tarefas para otimizar seu fluxo de trabalho. Os templates podem ser adicionados a qualquer projeto.
            </p>
            <Button onClick={() => setNewTemplateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <Card 
                key={template.id} 
                className="hover:shadow-md transition-all border border-border animate-scale-in" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex justify-between items-start">
                    <span>{template.title}</span>
                    <Badge 
                      variant={
                        template.priority === "high" ? "destructive" : 
                        template.priority === "medium" ? "default" : 
                        "secondary"
                      }
                      className="ml-2"
                    >
                      {template.priority === "high" ? "Alta" : 
                      template.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.dueDate ? format(new Date(template.dueDate), 'dd/MM/yyyy') : "Sem data"}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <ListTodo className="h-3 w-3" />
                      <span>{template.subtasks?.length || 0} subtarefas</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  <Button variant="outline" size="sm" onClick={() => openTaskDetail(template)}>
                    Editar
                  </Button>
                  <Button size="sm" onClick={() => addToProject(template)}>
                    Usar Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Modal de Novo Template */}
      <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Template de Tarefa</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="subtasks">Subtarefas</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium block mb-1">
                  Título
                </label>
                <Input 
                  id="title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                  placeholder="Título da tarefa"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="text-sm font-medium block mb-1">
                  Descrição
                </label>
                <Textarea 
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Descrição da tarefa"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="assignee" className="text-sm font-medium block mb-1">
                  Responsável Padrão
                </label>
                <Input 
                  id="assignee"
                  value={newTemplate.assignee?.name || ""}
                  onChange={(e) => setNewTemplate({...newTemplate, assignee: { name: e.target.value }})}
                  placeholder="Nome do responsável"
                />
              </div>
              
              <div>
                <label htmlFor="priority" className="text-sm font-medium block mb-1">
                  Prioridade
                </label>
                <select
                  id="priority"
                  value={newTemplate.priority}
                  onChange={(e) => setNewTemplate({...newTemplate, priority: e.target.value as "low" | "medium" | "high"})}
                  className="w-full border border-input px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">
                  Data de Vencimento
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Clock className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setNewTemplate({...newTemplate, dueDate: format(date, 'yyyy-MM-dd')});
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Adicionar subtarefa"
                  onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                />
                <Button onClick={addSubtask} type="button" size="sm">Adicionar</Button>
              </div>
              
              {newTemplate.subtasks && newTemplate.subtasks.length > 0 ? (
                <div className="space-y-2">
                  {newTemplate.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded-md">
                      <div className="flex items-center gap-2">
                        <Checkbox id={subtask.id} checked={subtask.completed} />
                        <label htmlFor={subtask.id} className="text-sm">{subtask.title}</label>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSubtask(subtask.id)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma subtarefa adicionada</p>
              )}
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  placeholder="Adicionar tag"
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} type="button" size="sm">Adicionar</Button>
              </div>
              
              {newTemplate.tags && newTemplate.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {newTemplate.tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full">
                      <span className="text-xs">{tag}</span>
                      <button 
                        onClick={() => removeTag(tag)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addNewTemplate} disabled={!newTemplate.title}>
              Criar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Tarefa */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={closeTaskDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Template</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="subtasks">Subtarefas</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="text-sm font-medium block mb-1">
                    Título
                  </label>
                  <Input 
                    id="edit-title"
                    value={selectedTask.title}
                    onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                    placeholder="Título da tarefa"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-description" className="text-sm font-medium block mb-1">
                    Descrição
                  </label>
                  <Textarea 
                    id="edit-description"
                    value={selectedTask.description}
                    onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                    placeholder="Descrição da tarefa"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-assignee" className="text-sm font-medium block mb-1">
                    Responsável Padrão
                  </label>
                  <Input 
                    id="edit-assignee"
                    value={selectedTask.assignee?.name || ""}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask,
                      assignee: { ...selectedTask.assignee, name: e.target.value }
                    })}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-priority" className="text-sm font-medium block mb-1">
                    Prioridade
                  </label>
                  <select
                    id="edit-priority"
                    value={selectedTask.priority}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask, 
                      priority: e.target.value as "low" | "medium" | "high"
                    })}
                    className="w-full border border-input px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Data de Vencimento
                  </label>
                  <Input
                    type="date"
                    value={selectedTask.dueDate}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask,
                      dueDate: e.target.value
                    })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Adicionar subtarefa"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSubtask.trim()) {
                        const updatedTask = {
                          ...selectedTask,
                          subtasks: [
                            ...(selectedTask.subtasks || []),
                            { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
                          ]
                        };
                        setSelectedTask(updatedTask);
                        setNewSubtask("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newSubtask.trim()) {
                        const updatedTask = {
                          ...selectedTask,
                          subtasks: [
                            ...(selectedTask.subtasks || []),
                            { id: `subtask-${Date.now()}`, title: newSubtask, completed: false }
                          ]
                        };
                        setSelectedTask(updatedTask);
                        setNewSubtask("");
                      }
                    }} 
                    type="button" 
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={subtask.id} 
                            checked={subtask.completed}
                            onCheckedChange={() => {
                              const updatedTask = {
                                ...selectedTask,
                                subtasks: selectedTask.subtasks?.map(st => 
                                  st.id === subtask.id ? { ...st, completed: !st.completed } : st
                                )
                              };
                              setSelectedTask(updatedTask);
                            }}
                          />
                          <label 
                            htmlFor={subtask.id} 
                            className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {subtask.title}
                          </label>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const updatedTask = {
                              ...selectedTask,
                              subtasks: selectedTask.subtasks?.filter(st => st.id !== subtask.id)
                            };
                            setSelectedTask(updatedTask);
                          }}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma subtarefa adicionada</p>
                )}
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newTaskTag}
                    onChange={(e) => setNewTaskTag(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskTag.trim()) {
                        if (selectedTask.tags && selectedTask.tags.includes(newTaskTag)) {
                          toast.error("Esta tag já existe");
                          return;
                        }
                        const updatedTask = {
                          ...selectedTask,
                          tags: [...(selectedTask.tags || []), newTaskTag]
                        };
                        setSelectedTask(updatedTask);
                        setNewTaskTag("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (newTaskTag.trim()) {
                        if (selectedTask.tags && selectedTask.tags.includes(newTaskTag)) {
                          toast.error("Esta tag já existe");
                          return;
                        }
                        const updatedTask = {
                          ...selectedTask,
                          tags: [...(selectedTask.tags || []), newTaskTag]
                        };
                        setSelectedTask(updatedTask);
                        setNewTaskTag("");
                      }
                    }} 
                    type="button" 
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {selectedTask.tags && selectedTask.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full">
                        <span className="text-xs">{tag}</span>
                        <button 
                          onClick={() => {
                            const updatedTask = {
                              ...selectedTask,
                              tags: selectedTask.tags?.filter(t => t !== tag)
                            };
                            setSelectedTask(updatedTask);
                          }}
                          className="text-xs text-destructive hover:text-destructive/80"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <Button variant="destructive" onClick={() => {
                deleteTemplate(selectedTask.id);
                closeTaskDetail();
              }}>
                Excluir
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeTaskDetail}>
                  Cancelar
                </Button>
                <Button onClick={() => updateTemplate(selectedTask)}>
                  Salvar Alterações
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
