import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, MessageSquare, Smile, Users, Circle } from "lucide-react";
import type { Event } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

interface EventWithMessages extends Event {
  messages?: Message[];
  participants?: any[];
}

export default function DashboardChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const { data: selectedEvent } = useQuery<EventWithMessages>({
    queryKey: ["/api/events", selectedEventId],
    enabled: !!selectedEventId,
  });

  // WebSocket connection
  useEffect(() => {
    if (!selectedEventId || !user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      ws.send(JSON.stringify({ type: 'join', eventId: selectedEventId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          // Invalidate queries to refresh message list from server
          queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId] });
          // Scroll to bottom
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 100);
        } else if (data.type === 'presence') {
          // Update active users list
          setActiveUserIds(data.activeUsers || []);
        } else if (data.type === 'error') {
          toast({
            title: "Chat Error",
            description: data.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [selectedEventId, user]);

  // Reset active users when changing events
  useEffect(() => {
    setActiveUserIds([]);
  }, [selectedEventId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedEvent?.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedEventId || !wsRef.current) return;
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: messageInput
      }));
      setMessageInput("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  // Use messages from selectedEvent query - WebSocket just triggers refetch
  const allMessages = selectedEvent?.messages || [];

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-lg border-2" data-testid="card-chat">
      <CardHeader className="border-b flex-row items-center justify-between space-y-0 py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          Event Chats
        </CardTitle>
      </CardHeader>
          <div className="flex-1 flex overflow-hidden">
        {/* Events List */}
        <div className="w-64 border-r">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-md cursor-pointer hover-elevate ${
                      selectedEventId === event.id ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      setSelectedEventId(event.id);
                    }}
                    data-testid={`chat-event-${event.id}`}
                  >
                    <div className="font-medium text-sm line-clamp-1">{event.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {event.location}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No events yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex">
          {selectedEventId ? (
            <>
              {/* Messages Column */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                  {allMessages.length > 0 ? (
                    <div className="space-y-4">
                      {allMessages.map((msg) => {
                        const isCurrentUser = msg.senderId === user?.id;
                        const senderName = msg.sender
                          ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim()
                          : 'Unknown';
                        const initials = msg.sender
                          ? getInitials(msg.sender.firstName, msg.sender.lastName)
                          : '?';

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                            data-testid={`chat-message-${msg.id}`}
                          >
                            {!isCurrentUser && (
                              <Avatar className="w-8 h-8">
                                {msg.sender?.profileImageUrl ? (
                                  <AvatarImage src={msg.sender.profileImageUrl} />
                                ) : null}
                                <AvatarFallback className="text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : ''}`}>
                              {!isCurrentUser && (
                                <span className="text-xs font-medium mb-1">
                                  {senderName}
                                </span>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 max-w-md ${
                                  isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                        <p className="text-xs">Be the first to start the conversation!</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        data-testid="button-emoji-picker"
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 border-0" align="start">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={350}
                        height={400}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    data-testid="button-send-chat-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              </div>

              {/* Participants Sidebar */}
              <div className="w-64 border-l">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">Participants</h3>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {activeUserIds.length} online
                    </span>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100%-57px)]">
                  <div className="p-2 space-y-1">
                    {selectedEvent?.participants && selectedEvent.participants.length > 0 ? (
                      selectedEvent.participants.map((participant: any) => {
                        const isActive = activeUserIds.includes(participant.userId);
                        const userName = participant.user
                          ? `${participant.user.firstName || ''} ${participant.user.lastName || ''}`.trim()
                          : 'Unknown User';
                        const initials = participant.user
                          ? getInitials(participant.user.firstName, participant.user.lastName)
                          : '?';
                        
                        return (
                          <div
                            key={participant.userId}
                            className="flex items-center gap-2 p-2 rounded-md"
                            data-testid={`participant-${participant.userId}`}
                          >
                            <div className="relative">
                              <Avatar className="w-8 h-8">
                                {participant.user?.profileImageUrl ? (
                                  <AvatarImage src={participant.user.profileImageUrl} />
                                ) : null}
                                <AvatarFallback className="text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <Circle
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                                  isActive ? 'fill-green-500 text-green-500' : 'fill-muted text-muted'
                                }`}
                                data-testid={`status-${participant.userId}-${isActive ? 'active' : 'inactive'}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {isActive ? 'Active' : 'Offline'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No participants
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select an event to view chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
