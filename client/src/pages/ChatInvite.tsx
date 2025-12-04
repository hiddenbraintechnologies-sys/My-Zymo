import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MessageCircle, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

type InvitePreview = {
  inviteCode: string;
  inviteType: "direct" | "group";
  message: string | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
  groupChatId: string | null;
};

export default function ChatInvite() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/chat-invite/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const inviteCode = params?.code;

  const { data: invite, isLoading, error } = useQuery<InvitePreview>({
    queryKey: ["/api/chat-invites", inviteCode],
    enabled: !!inviteCode,
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest(`/api/chat-invites/${code}/accept`, "POST");
      return await res.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Invite accepted!",
        description: result.type === "direct" 
          ? "You can now start chatting" 
          : "You've joined the group chat",
      });
      
      if (result.type === "direct") {
        setLocation(`/messages/${result.userId}`);
      } else if (result.type === "group") {
        setLocation("/messages");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept invite",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleAcceptInvite = () => {
    if (inviteCode) {
      acceptInviteMutation.mutate(inviteCode);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <CardTitle>Chat Invitation</CardTitle>
              <CardDescription>
                You need to log in to accept this chat invitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setLocation("/login")} 
                className="w-full"
                data-testid="button-login-to-accept"
              >
                Log in to continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>
                This invitation link is invalid, expired, or has already been used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation("/messages")} 
                variant="outline" 
                className="w-full"
                data-testid="button-go-to-messages"
              >
                Go to Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            {invite.inviteType === "direct" ? (
              <MessageCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            ) : (
              <Users className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            )}
            <CardTitle>
              {invite.inviteType === "direct" ? "Chat Invitation" : "Group Chat Invitation"}
            </CardTitle>
            <CardDescription>
              {invite.inviteType === "direct" 
                ? `${invite.creator.firstName} ${invite.creator.lastName} wants to chat with you`
                : `${invite.creator.firstName} ${invite.creator.lastName} invited you to join a group chat`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={invite.creator.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {invite.creator.firstName?.[0]}{invite.creator.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-lg">
                  {invite.creator.firstName} {invite.creator.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Invited you to chat
                </p>
              </div>
            </div>

            {invite.message && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm italic">"{invite.message}"</p>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleAcceptInvite}
                disabled={acceptInviteMutation.isPending}
                className="w-full"
                data-testid="button-accept-invite"
              >
                {acceptInviteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {invite.inviteType === "direct" ? "Start Chatting" : "Join Group"}
              </Button>
              <Button 
                onClick={() => setLocation("/messages")}
                variant="outline"
                className="w-full"
                data-testid="button-decline-invite"
              >
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
