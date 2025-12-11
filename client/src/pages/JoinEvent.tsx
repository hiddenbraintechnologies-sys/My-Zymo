import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, Users, ArrowRight, Loader2, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function JoinEvent() {
  const [, params] = useRoute("/events/join/:code");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const [inviteCode, setInviteCode] = useState(params?.code || "");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (params?.code) {
      setInviteCode(params.code);
      validateAndJoin(params.code);
    }
  }, [params?.code]);

  const joinGroupMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest(`/api/groups/join/${code}`, "POST");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Joined successfully!",
        description: `You've joined the group "${data.name}"`,
      });
      navigate(`/groups/${data.id}`);
    },
    onError: (error: any) => {
      setError(error.message || "Invalid invite code. Please check and try again.");
      setIsValidating(false);
    },
  });

  const validateAndJoin = async (code: string) => {
    if (!code.trim()) {
      setError("Please enter an invite code");
      return;
    }

    if (!user && !authLoading) {
      navigate(`/login?redirect=/events/join/${code}`);
      return;
    }

    setIsValidating(true);
    setError(null);
    joinGroupMutation.mutate(code.trim().toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndJoin(inviteCode);
  };

  const handleTryAgain = () => {
    setError(null);
    setInviteCode("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center mb-2">
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <Users className="w-8 h-8 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {error ? "Invalid Invite Code" : "Join Event Group"}
          </CardTitle>
          <CardDescription>
            {error 
              ? "The invite code you entered is incorrect or has expired."
              : "Enter your invite code to join an event group"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300" data-testid="error-invalid-code">
                  {error}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-code">Try a different code</Label>
                  <Input
                    id="invite-code"
                    placeholder="Enter invite code (e.g., ABC123)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={10}
                    data-testid="input-invite-code"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/dashboard")}
                    data-testid="button-go-home"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!inviteCode.trim() || joinGroupMutation.isPending}
                    data-testid="button-try-again"
                  >
                    {joinGroupMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    Try Again
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  placeholder="Enter invite code (e.g., ABC123)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={10}
                  autoFocus
                  data-testid="input-invite-code"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={!inviteCode.trim() || isValidating || joinGroupMutation.isPending}
                data-testid="button-join-group"
              >
                {(isValidating || joinGroupMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join Group
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-muted-foreground"
                  onClick={() => navigate("/dashboard")}
                  data-testid="link-back-to-dashboard"
                >
                  Back to Dashboard
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
