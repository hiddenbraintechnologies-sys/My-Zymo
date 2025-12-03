import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, MessageSquare, Plus, Send, Trash2, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { AiConversation, AiMessage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AIAssistant() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<AiConversation[]>({
    queryKey: ["/api/ai/conversations"],
    enabled: !!user,
  });

  const { data: conversationData, isLoading: messagesLoading } = useQuery<AiConversation & { messages: AiMessage[] }>({
    queryKey: ["/api/ai/conversations", selectedConversationId],
    enabled: !!selectedConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/ai/conversations", "POST", { title: "New Chat" });
      return await res.json() as AiConversation;
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setSelectedConversationId(newConversation.id);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest(`/api/ai/conversations/${conversationId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setSelectedConversationId(null);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      const res = await apiRequest("/api/ai/chat", "POST", { conversationId, message });
      return await res.json() as { userMessage: AiMessage; assistantMessage: AiMessage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations", selectedConversationId] });
      setInputMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationData?.messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      message: inputMessage.trim(),
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
              <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
              <span className="font-heading font-bold text-xl bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Myzymo</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard" data-testid="link-dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/events" data-testid="link-events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/vendors" data-testid="link-vendors">
              <Button variant="ghost">Vendors</Button>
            </Link>
            <Link href="/profile" data-testid="link-profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Banner */}
        <div className="mx-4 my-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-2">
              <MessageSquare className="w-8 h-8" />
              AI Assistant
            </h1>
            <p className="text-white/90 text-lg">Get help with event planning, vendor recommendations, and more</p>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden mx-4 mb-4">
        <aside className="w-72 border-r bg-muted/50 p-4 flex flex-col gap-4 rounded-l-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Conversations</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => createConversationMutation.mutate()}
              disabled={createConversationMutation.isPending}
              data-testid="button-new-conversation"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {conversationsLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 p-3 rounded-md cursor-pointer hover-elevate active-elevate-2 ${
                      selectedConversationId === conv.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedConversationId(conv.id)}
                    data-testid={`conversation-item-${conv.id}`}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{conv.title}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversationMutation.mutate(conv.id);
                      }}
                      data-testid={`button-delete-conversation-${conv.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet. Create one to get started!
                </p>
              )}
            </div>
          </ScrollArea>
        </aside>

        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <>
              {conversationData?.isOnboarding && (
                <div className="p-4 border-b">
                  <Alert className="border-primary/50 bg-primary/5" data-testid="alert-onboarding-profile">
                    <UserCircle className="h-4 w-4 text-primary" />
                    <AlertTitle>Complete Your Profile</AlertTitle>
                    <AlertDescription className="flex items-start justify-between gap-4">
                      <p className="flex-1">
                        Ready to save your information? Head to your Profile page to review and complete all your details.
                      </p>
                      <Button
                        onClick={() => setLocation("/profile")}
                        size="sm"
                        data-testid="button-go-to-profile"
                      >
                        Go to Profile
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6" ref={scrollRef}>
                  {messagesLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-3/4" />
                      <Skeleton className="h-16 w-2/3 ml-auto" />
                      <Skeleton className="h-16 w-3/4" />
                    </div>
                  ) : conversationData?.messages && conversationData.messages.length > 0 ? (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {conversationData.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                            <CardContent className="p-4">
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                      {sendMessageMutation.isPending && (
                        <div className="flex justify-start">
                          <Card className="max-w-[80%]">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-75" />
                                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-150" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Start a conversation with your AI assistant</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className="border-t p-4">
                <div className="max-w-4xl mx-auto flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageSquare className="w-24 h-24 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Welcome to AI Assistant</h3>
                  <p className="text-muted-foreground mb-4">
                    Get help with event planning, vendor recommendations, and more
                  </p>
                  <Button
                    onClick={() => createConversationMutation.mutate()}
                    disabled={createConversationMutation.isPending}
                    data-testid="button-start-first-conversation"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
