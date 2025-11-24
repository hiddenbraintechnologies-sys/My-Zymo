import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import type { DirectMessage, User } from "@shared/schema";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationListItem[]>({
    queryKey: ["/api/direct-messages/conversations"],
  });

  // Update selectedUserId when URL parameter changes
  useEffect(() => {
    if (params?.userId) {
      setSelectedUserId(params.userId);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
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
                    <div>
                      <h3 className="font-semibold" data-testid="text-chat-recipient-name">
                        {selectedConversation?.user.firstName} {selectedConversation?.user.lastName}
                      </h3>
                      {selectedConversation?.user.profession && (
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.user.profession}
                        </p>
                      )}
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

                {/* Input */}
                <div className="flex gap-2">
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
    </div>
  );
}
