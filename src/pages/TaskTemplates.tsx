
import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Copy, Tag, Clock, CheckSquare, ListTodo, Search, Filter, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Task } from "@/components/KanbanColumn";

export default function TaskTemplates() {
  const [templates, setTemplates] = useState<Task[]>([]);
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newTemplate, setNewTemplate] = useState<Omit<Task, "id" | "status">>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    tags: [],
    subtasks: []
  });

  // Load templates from localStorage on mount
  useEffect(() => {
    const storedTemplates = localStorage.getItem('task-templates');
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('task-templates', JSON.stringify(templates));
  }, [templates]);

  const saveTemplate = () => {
    if (!newTemplate.title.trim()) {
      toast.error("Template title is required");
      return;
    }

    const templateToSave: Task = {
      id: editingTemplate ? editingTemplate.id : `template-${Date.now()}`,
      title: newTemplate.title,
      description: newTemplate.description,
      status: "todo",
      priority: newTemplate.priority,
      dueDate: newTemplate.dueDate,
      tags: newTemplate.tags,
      subtasks: newTemplate.subtasks
    };

    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => t.id === editingTemplate.id ? templateToSave : t));
      toast.success("Template updated successfully");
    } else {
      // Add new template
      setTemplates([...templates, templateToSave]);
      toast.success("Template created successfully");
    }

    resetForm();
  };

  const resetForm = () => {
    setNewTemplateOpen(false);
    setEditingTemplate(null);
    setNewTemplate({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      tags: [],
      subtasks: []
    });
    setNewSubtask("");
    setNewTaskTag("");
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
    if (newTemplate.tags && newTemplate.tags.includes(newTaskTag)) {
      toast.error("Tag already exists");
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

  const editTemplate = (template: Task) =>  {
    setEditingTemplate(template);
    setNewTemplate({
      title: template.title,
      description: template.description || "",
      priority: template.priority,
      dueDate: template.dueDate || "",
      tags: template.tags || [],
      subtasks: template.subtasks || []
    });
    setNewTemplateOpen(true);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    setConfirmDeleteId(null);
    toast.success("Template deleted successfully");
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || template.priority === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container px-6 py-8 mx-auto pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-medium">Task Templates</h1>
            <p className="text-muted-foreground">Create and manage reusable task templates</p>
          </div>
          
          <Button onClick={() => setNewTemplateOpen(true)} className="self-start">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="border border-input px-3 py-1.5 rounded-md bg-background"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group">
              <CardHeader>
                <CardTitle className="flex justify-between items-start gap-2">
                  <span className="line-clamp-2">{template.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => editTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setConfirmDeleteId(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    template.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    template.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)} Priority
                  </span>
                  
                  {template.dueDate && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {template.dueDate}
                    </span>
                  )}
                </div>
                
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
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
                
                {template.subtasks && template.subtasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <CheckSquare className="h-4 w-4" />
                      Subtasks
                    </h4>
                    <ul className="space-y-1">
                      {template.subtasks.map(subtask => (
                        <li key={subtask.id} className="text-sm text-muted-foreground">
                          • {subtask.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    // Save the template to local storage for the current project
                    const projectId = new URLSearchParams(window.location.search).get('projectId');
                    if (projectId) {
                      const storedTasks = localStorage.getItem(`tasks-${projectId}`);
                      const currentTasks = storedTasks ? JSON.parse(storedTasks) : [];
                      
                      const newTask: Task = {
                        ...template,
                        id: `task-${Date.now()}`,
                        status: "todo"
                      };
                      
                      const updatedTasks = [...currentTasks, newTask];
                      localStorage.setItem(`tasks-${projectId}`, JSON.stringify(updatedTasks));
                      
                      toast.success("Template added to project tasks");
                    } else {
                      toast.error("Please open this from a project to use templates");
                    }
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* New/Edit Template Dialog */}
        <Dialog open={newTemplateOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Template Title
                  </label>
                  <Input 
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                    placeholder="Enter template title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Description
                  </label>
                  <Textarea 
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Enter template description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Priority
                  </label>
                  <select
                    value={newTemplate.priority}
                    onChange={(e) => setNewTemplate({...newTemplate, priority: e.target.value as Task["priority"]})}
                    className="w-full border border-input px-3 py-2 rounded-md bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Default Due Date
                  </label>
                  <Input 
                    type="date"
                    value={newTemplate.dueDate}
                    onChange={(e) => setNewTemplate({...newTemplate, dueDate: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask"
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                  />
                  <Button onClick={addSubtask} type="button" size="sm">Add</Button>
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
                  <p className="text-sm text-muted-foreground">No subtasks added yet</p>
                )}
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newTaskTag}
                    onChange={(e) => setNewTaskTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} type="button" size="sm">Add</Button>
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
                  <p className="text-sm text-muted-foreground">No tags added yet</p>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={saveTemplate}>
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this template? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => confirmDeleteId && deleteTemplate(confirmDeleteId)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {templates.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ListTodo className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold">No templates yet</h2>
            <p className="text-muted-foreground mt-2 mb-8">
              Create your first task template to get started
            </p>
            <Button onClick={() => setNewTemplateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
