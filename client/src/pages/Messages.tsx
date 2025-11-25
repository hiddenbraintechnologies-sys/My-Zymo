import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Sparkles, Phone, Video, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import type { DirectMessage, User } from "@shared/schema";
import { useWebRTC } from "@/hooks/useWebRTC";
import { IncomingCallModal } from "@/components/IncomingCallModal";
import { ActiveCallDialog } from "@/components/ActiveCallDialog";

type ConversationListItem = {
  userId: string;
  user: User;
  lastMessage: DirectMessage | null;
  unreadCount: number;
};

type DirectMessageWithUser = DirectMessage & {
  sender: User;
  recipient: User;
};

export default function Messages() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute("/messages/:userId");
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(params?.userId || null);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<DirectMessageWithUser[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebRTC for video/audio calls
  const {
    callState,
    callType,
    incomingCall,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    rejectCall,
    endCall,
  } = useWebRTC({
    ws: wsRef.current,
    currentUserId: currentUser?.id,
    recipientId: selectedUserId,
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationListItem[]>({
    queryKey: ["/api/direct-messages/conversations"],
  });

  // Update selectedUserId when URL parameter changes
  useEffect(() => {
    if (params?.userId) {
      setSelectedUserId(params.userId);
      // Clear AI suggestions when switching conversations
      setShowSuggestions(false);
      setAiSuggestions([]);
    }
  }, [params?.userId]);

  const { data: selectedMessages = [], isLoading: messagesLoading } = useQuery<DirectMessageWithUser[]>({
    queryKey: ["/api/direct-messages", selectedUserId],
    enabled: !!selectedUserId,
  });

  useEffect(() => {
    if (selectedMessages.length > 0) {
      setMessages(selectedMessages);
    }
  }, [selectedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when selecting a conversation
  const markAsReadMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      return apiRequest(`/api/direct-messages/${otherUserId}/read`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/conversations"] });
    },
  });

  useEffect(() => {
    if (selectedUserId) {
      markAsReadMutation.mutate(selectedUserId);
    }
  }, [selectedUserId]);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected for direct messages");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "direct-message") {
        const newMessage = data.message as DirectMessageWithUser;
        
        // If this message is part of the currently selected conversation
        if (
          selectedUserId &&
          (newMessage.senderId === selectedUserId || newMessage.recipientId === selectedUserId)
        ) {
          setMessages((prev) => [...prev, newMessage]);
          
          // Mark as read if we received it
          if (newMessage.recipientId === currentUser?.id) {
            markAsReadMutation.mutate(selectedUserId);
          }
        }
        
        // Refresh conversations list to update unread counts
        queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/conversations"] });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [selectedUserId, currentUser]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedUserId || !wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "direct-message",
        recipientId: selectedUserId,
        content: messageContent.trim(),
      })
    );

    setMessageContent("");
    setShowSuggestions(false);
    setAiSuggestions([]);
  };

  const getSuggestionsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest(`/api/direct-messages/${userId}/suggestions`, "POST");
      return await res.json() as { suggestions: string[] };
    },
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions);
      setShowSuggestions(true);
    },
  });

  const handleGetSuggestions = () => {
    if (!selectedUserId) return;
    getSuggestionsMutation.mutate(selectedUserId);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setMessageContent(suggestion);
    setShowSuggestions(false);
  };

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4">
        {/* Compact Hero Banner */}
        <div className="mb-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10 flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-heading font-bold">Messages</h1>
              <p className="text-white/90 text-sm">Connect with event participants and friends</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="md:col-span-1 p-4">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No conversations yet. Start chatting with event participants!
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => {
                      setSelectedUserId(conv.userId);
                      setLocation(`/messages/${conv.userId}`);
                    }}
                    className={`w-full p-3 rounded-md text-left transition-colors hover-elevate active-elevate-2 ${
                      selectedUserId === conv.userId
                        ? "bg-accent"
                        : "bg-transparent"
                    }`}
                    data-testid={`button-conversation-${conv.userId}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {conv.user.firstName} {conv.user.lastName}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="ml-auto" data-testid={`badge-unread-${conv.userId}`}>
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 p-4 flex flex-col h-[600px]">
            {!selectedUserId ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start messaging
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation?.user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {selectedConversation?.user.firstName?.[0]}
                        {selectedConversation?.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid="text-chat-recipient-name">
                        {selectedConversation?.user.firstName} {selectedConversation?.user.lastName}
                      </h3>
                      {selectedConversation?.user.profession && (
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.user.profession}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startCall("audio")}
                        variant="ghost"
                        size="icon"
                        disabled={callState !== "idle"}
                        title="Audio call"
                        data-testid="button-audio-call"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() => startCall("video")}
                        variant="ghost"
                        size="icon"
                        disabled={callState !== "idle"}
                        title="Video call"
                        data-testid="button-video-call"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurrentUser = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm break-words">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* AI Suggestions */}
                {showSuggestions && aiSuggestions.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-muted-foreground">AI Suggested Replies:</p>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover-elevate active-elevate-2 px-3 py-1"
                          onClick={() => handleUseSuggestion(suggestion)}
                          data-testid={`badge-ai-suggestion-${index}`}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleGetSuggestions}
                    disabled={getSuggestionsMutation.isPending}
                    size="icon"
                    variant="ghost"
                    title="Get AI suggestions"
                    data-testid="button-ai-suggestions"
                  >
                    {getSuggestionsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                  <Input
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    size="icon"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          open={callState === "ringing"}
          caller={incomingCall.caller}
          callType={incomingCall.callType}
          onAccept={answerCall}
          onReject={rejectCall}
        />
      )}

      {/* Active Call Dialog */}
      {(callState === "calling" || callState === "active") && selectedConversation && (
        <ActiveCallDialog
          open={true}
          callState={callState}
          callType={callType}
          localStream={localStream}
          remoteStream={remoteStream}
          remoteName={`${selectedConversation.user.firstName} ${selectedConversation.user.lastName}`}
          onEndCall={endCall}
        />
      )}
    </div>
  );
}
