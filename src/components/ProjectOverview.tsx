
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit2, Target, Users, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ProjectOverviewProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
}

export interface ProjectBriefing {
  objectives: string;
  targetAudience: string;
  keyDeliverables: string;
  teamMembers: string[];
  timeline: string;
  specialRequirements: string;
}

export function ProjectOverview({ projectId, projectTitle, projectDescription }: ProjectOverviewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState("");
  const [briefing, setBriefing] = useState<ProjectBriefing>({
    objectives: "",
    targetAudience: "",
    keyDeliverables: "",
    teamMembers: [],
    timeline: "",
    specialRequirements: ""
  });

  // Load briefing data from localStorage
  useEffect(() => {
    const storedBriefing = localStorage.getItem(`briefing-${projectId}`);
    if (storedBriefing) {
      setBriefing(JSON.parse(storedBriefing));
    }
  }, [projectId]);

  const saveBriefing = () => {
    localStorage.setItem(`briefing-${projectId}`, JSON.stringify(briefing));
    setIsEditOpen(false);
    toast.success("Project briefing updated");
  };

  const addTeamMember = () => {
    if (!newTeamMember.trim()) return;
    if (briefing.teamMembers.includes(newTeamMember)) {
      toast.error("Team member already added");
      return;
    }
    
    const updatedBriefing = {
      ...briefing,
      teamMembers: [...briefing.teamMembers, newTeamMember]
    };
    
    setBriefing(updatedBriefing);
    setNewTeamMember("");
  };

  const removeTeamMember = (member: string) => {
    setBriefing({
      ...briefing,
      teamMembers: briefing.teamMembers.filter(m => m !== member)
    });
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Project Overview</h2>
        <Button onClick={() => setIsEditOpen(true)} variant="outline" className="flex items-center gap-2">
          <Edit2 className="h-4 w-4" />
          <span>Edit Briefing</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Project Objectives
            </CardTitle>
            <CardDescription>The main goals of this project</CardDescription>
          </CardHeader>
          <CardContent>
            {briefing.objectives ? (
              <p className="text-sm whitespace-pre-line">{briefing.objectives}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No objectives defined yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Target Audience
            </CardTitle>
            <CardDescription>Who this project is aimed at</CardDescription>
          </CardHeader>
          <CardContent>
            {briefing.targetAudience ? (
              <p className="text-sm whitespace-pre-line">{briefing.targetAudience}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No target audience defined yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline & Deliverables
            </CardTitle>
            <CardDescription>Project schedule and key milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Timeline:</h4>
              {briefing.timeline ? (
                <p className="text-sm whitespace-pre-line">{briefing.timeline}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No timeline defined yet</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Key Deliverables:</h4>
              {briefing.keyDeliverables ? (
                <p className="text-sm whitespace-pre-line">{briefing.keyDeliverables}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No deliverables defined yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Members
            </CardTitle>
            <CardDescription>People involved in this project</CardDescription>
          </CardHeader>
          <CardContent>
            {briefing.teamMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {briefing.teamMembers.map((member) => (
                  <div key={member} className="px-3 py-1 bg-secondary rounded-full text-sm">
                    {member}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No team members assigned yet</p>
            )}
          </CardContent>
        </Card>

        {briefing.specialRequirements && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Special Requirements
              </CardTitle>
              <CardDescription>Additional notes and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{briefing.specialRequirements}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Briefing Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Project Briefing</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
            <div>
              <label className="text-sm font-medium block mb-1">
                Project Objectives
              </label>
              <Textarea 
                value={briefing.objectives}
                onChange={(e) => setBriefing({...briefing, objectives: e.target.value})}
                placeholder="What are the main goals of this project?"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Target Audience
              </label>
              <Textarea 
                value={briefing.targetAudience}
                onChange={(e) => setBriefing({...briefing, targetAudience: e.target.value})}
                placeholder="Who is this project aimed at?"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Key Deliverables
              </label>
              <Textarea 
                value={briefing.keyDeliverables}
                onChange={(e) => setBriefing({...briefing, keyDeliverables: e.target.value})}
                placeholder="What are the main deliverables for this project?"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Timeline
              </label>
              <Textarea 
                value={briefing.timeline}
                onChange={(e) => setBriefing({...briefing, timeline: e.target.value})}
                placeholder="What's the timeline for this project?"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Special Requirements
              </label>
              <Textarea 
                value={briefing.specialRequirements}
                onChange={(e) => setBriefing({...briefing, specialRequirements: e.target.value})}
                placeholder="Any special requirements or additional notes?"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">
                Team Members
              </label>
              <div className="flex items-center gap-2 mb-3">
                <Input 
                  value={newTeamMember}
                  onChange={(e) => setNewTeamMember(e.target.value)}
                  placeholder="Add team member"
                  onKeyDown={(e) => e.key === 'Enter' && addTeamMember()}
                />
                <Button onClick={addTeamMember} type="button" size="sm">Add</Button>
              </div>
              
              {briefing.teamMembers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {briefing.teamMembers.map((member) => (
                    <div key={member} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full">
                      <span className="text-xs">{member}</span>
                      <button 
                        onClick={() => removeTeamMember(member)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No team members added yet</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBriefing}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
