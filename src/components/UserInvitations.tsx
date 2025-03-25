
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Invitation {
  projectId: string;
  projectTitle: string;
  invitedBy: string;
  invitedAt: string;
}

export function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const navigate = useNavigate();
  
  // Load user invitations from localStorage
  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (!userEmail) return;
    
    const storedInvitations = localStorage.getItem(`user-invitations-${userEmail}`);
    if (storedInvitations) {
      setInvitations(JSON.parse(storedInvitations));
    }
  }, []);
  
  // Accept invitation
  const handleAcceptInvitation = (invitation: Invitation) => {
    const userEmail = localStorage.getItem('email') || '';
    const username = localStorage.getItem('username') || 'User';
    
    if (!userEmail) {
      toast.error("You need to be logged in to accept invitations");
      return;
    }
    
    // Update project members
    const storedMembers = localStorage.getItem(`project-members-${invitation.projectId}`);
    const members = storedMembers ? JSON.parse(storedMembers) : [];
    
    // Find the invitation in the members list
    const memberIndex = members.findIndex((member: any) => member.email === userEmail);
    
    if (memberIndex >= 0) {
      // Update member status to active
      members[memberIndex].status = "active";
      members[memberIndex].joinedAt = new Date().toISOString();
    } else {
      // Add user as a new member
      members.push({
        email: userEmail,
        name: username,
        status: "active",
        joinedAt: new Date().toISOString()
      });
    }
    
    // Save updated members to localStorage
    localStorage.setItem(`project-members-${invitation.projectId}`, JSON.stringify(members));
    
    // Remove invitation
    const updatedInvitations = invitations.filter(
      inv => !(inv.projectId === invitation.projectId && inv.invitedBy === invitation.invitedBy)
    );
    
    // Update state and localStorage
    setInvitations(updatedInvitations);
    localStorage.setItem(`user-invitations-${userEmail}`, JSON.stringify(updatedInvitations));
    
    toast.success(`You have joined ${invitation.projectTitle}`);
    
    // Navigate to the project
    navigate(`/kanban?projectId=${invitation.projectId}`);
  };
  
  // Decline invitation
  const handleDeclineInvitation = (invitation: Invitation) => {
    const userEmail = localStorage.getItem('email') || '';
    
    if (!userEmail) return;
    
    // Remove from project members if exists
    const storedMembers = localStorage.getItem(`project-members-${invitation.projectId}`);
    if (storedMembers) {
      const members = JSON.parse(storedMembers);
      const updatedMembers = members.filter((member: any) => member.email !== userEmail);
      localStorage.setItem(`project-members-${invitation.projectId}`, JSON.stringify(updatedMembers));
    }
    
    // Remove invitation
    const updatedInvitations = invitations.filter(
      inv => !(inv.projectId === invitation.projectId && inv.invitedBy === invitation.invitedBy)
    );
    
    // Update state and localStorage
    setInvitations(updatedInvitations);
    localStorage.setItem(`user-invitations-${userEmail}`, JSON.stringify(updatedInvitations));
    
    toast.success(`Invitation to ${invitation.projectTitle} declined`);
  };
  
  if (invitations.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Invitations</CardTitle>
        <CardDescription>
          You have been invited to collaborate on these projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation, index) => (
            <div key={`${invitation.projectId}-${index}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
              <div>
                <h4 className="font-medium">{invitation.projectTitle}</h4>
                <div className="text-sm text-muted-foreground">
                  <p>Invited by: {invitation.invitedBy}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{format(new Date(invitation.invitedAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleDeclineInvitation(invitation)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleAcceptInvitation(invitation)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
