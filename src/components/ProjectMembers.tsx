
import { useState, useEffect } from "react";
import { Users, Plus, Mail, UserPlus, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Member types
interface ProjectMember {
  email: string;
  name: string;
  status: "active" | "invited" | "owner";
  joinedAt?: string;
}

interface ProjectMembersProps {
  projectId: string;
  projectTitle: string;
}

export function ProjectMembers({ projectId, projectTitle }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  
  // Load project members from localStorage
  useEffect(() => {
    const storedMembers = localStorage.getItem(`project-members-${projectId}`);
    let projectMembers: ProjectMember[] = storedMembers ? JSON.parse(storedMembers) : [];
    
    // If no members exist yet, initialize with current user as owner
    if (projectMembers.length === 0) {
      const currentUserEmail = localStorage.getItem('email') || '';
      const currentUsername = localStorage.getItem('username') || 'User';
      
      if (currentUserEmail) {
        projectMembers = [{
          email: currentUserEmail,
          name: currentUsername,
          status: "owner",
          joinedAt: new Date().toISOString()
        }];
        
        // Save to localStorage
        localStorage.setItem(`project-members-${projectId}`, JSON.stringify(projectMembers));
      }
    }
    
    setMembers(projectMembers);
  }, [projectId]);

  // Validate email input
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setInviteEmail(email);
    setIsEmailValid(validateEmail(email));
  };

  // Send invitation
  const handleSendInvite = () => {
    if (!isEmailValid) return;
    
    // Check if already a member or invited
    const isMember = members.some(member => member.email === inviteEmail);
    
    if (isMember) {
      toast.error("This email is already a member or has been invited");
      return;
    }
    
    // In a real app, this would send an actual email
    // For now, we'll just add to localStorage
    const newMember: ProjectMember = {
      email: inviteEmail,
      name: inviteEmail.split('@')[0], // Use part of email as name
      status: "invited",
      joinedAt: new Date().toISOString()
    };
    
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem(`project-members-${projectId}`, JSON.stringify(updatedMembers));
    
    // Create or update the invitations for this email
    const storedInvitations = localStorage.getItem(`user-invitations-${inviteEmail}`);
    const userInvitations = storedInvitations ? JSON.parse(storedInvitations) : [];
    
    const newInvitation = {
      projectId,
      projectTitle,
      invitedBy: localStorage.getItem('email') || 'Unknown',
      invitedAt: new Date().toISOString()
    };
    
    userInvitations.push(newInvitation);
    localStorage.setItem(`user-invitations-${inviteEmail}`, JSON.stringify(userInvitations));
    
    // Close dialog and show success toast
    setInviteDialogOpen(false);
    setInviteEmail("");
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  // Handle member removal
  const handleRemoveMember = (email: string) => {
    // Cannot remove the owner
    const memberToRemove = members.find(member => member.email === email);
    
    if (memberToRemove?.status === "owner") {
      toast.error("Cannot remove the project owner");
      return;
    }
    
    // Remove member
    const updatedMembers = members.filter(member => member.email !== email);
    setMembers(updatedMembers);
    localStorage.setItem(`project-members-${projectId}`, JSON.stringify(updatedMembers));
    
    toast.success("Member removed from project");
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Members</h3>
        <Button 
          onClick={() => setInviteDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
      </div>
      
      <Alert className="bg-primary/10 border-primary/20">
        <Users className="h-4 w-4" />
        <AlertTitle>Team Collaboration</AlertTitle>
        <AlertDescription>
          Members will have access to this project and can collaborate on tasks. 
          Invitations are sent via email. Members can accept by logging in with their email.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {members.length === 0 ? (
          <div className="text-center p-6 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No members in this project yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {members.map((member) => (
              <Card key={member.email} className="overflow-hidden">
                <div className={`h-1 w-full ${member.status === 'owner' ? 'bg-primary' : member.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={member.status === 'owner' ? 'default' : member.status === 'active' ? 'success' : 'outline'}>
                        {member.status === 'owner' ? 'Owner' : member.status === 'active' ? 'Member' : 'Invited'}
                      </Badge>
                      
                      {member.status !== 'owner' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveMember(member.email)}
                          className="h-8 w-8 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on "{projectTitle}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="colleague@example.com"
                    type="email"
                    value={inviteEmail}
                    onChange={handleEmailChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {inviteEmail && !isEmailValid && (
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                The invited user will receive an email with instructions to join this project.
                They need to sign up or sign in with this email address.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvite}
              disabled={!isEmailValid}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              <span>Send Invitation</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
