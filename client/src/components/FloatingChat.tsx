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
import { Send, MessageSquare, Smile, Users, Circle, Minimize2, Maximize2, X, Calendar } from "lucide-react";
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

export default function FloatingChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showEventList, setShowEventList] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
          
          // If closed, increment unread count
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
          
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
  }, [selectedEventId, user, isOpen]);

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

  // Clear unread count when opened or event selected
  useEffect(() => {
    if (isOpen || selectedEventId) {
      setUnreadCount(0);
    }
  }, [isOpen, selectedEventId]);

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

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowEventList(false);
    setUnreadCount(0);
  };

  const handleBackToList = () => {
    setShowEventList(true);
    setSelectedEventId(null);
  };

  // Use messages from selectedEvent query - WebSocket just triggers refetch
  const allMessages = selectedEvent?.messages || [];

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      data-testid="floating-chat"
    >
      {!isOpen ? (
        // Closed State - Small Square Box
        <Card 
          className="cursor-pointer hover-elevate shadow-2xl p-4 bg-gradient-to-r from-orange-300 to-amber-300 text-white relative transition-all duration-200 hover:scale-105 border-2 border-orange-200 dark:border-orange-800"
          onClick={handleToggle}
          data-testid="floating-chat-closed"
          style={{ width: '64px', height: '64px' }}
        >
          <div className="flex items-center justify-center h-full">
            <MessageSquare className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold border-2 border-orange-300">
                {unreadCount}
              </span>
            )}
          </div>
        </Card>
      ) : (
        // Open State - Compact Chat Window
        <Card 
          className="flex flex-col shadow-2xl border-2 border-orange-200 dark:border-orange-800 animate-in slide-in-from-bottom-4 duration-300" 
          style={{ width: '380px', maxHeight: '600px', height: '500px' }}
          data-testid="floating-chat-open"
        >
          <CardHeader className="border-b flex-row items-center justify-between space-y-0 py-3 bg-gradient-to-r from-orange-300 to-amber-300 text-white">
            <CardTitle className="flex items-center gap-2 text-base">
              {selectedEventId && !showEventList ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20 mr-1"
                  onClick={handleBackToList}
                  data-testid="button-back-to-list"
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              <span className="truncate">
                {selectedEventId && !showEventList 
                  ? selectedEvent?.title || 'Event Chat'
                  : 'Event Chats'
                }
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={handleToggle}
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <div className="flex-1 overflow-hidden">
            {showEventList ? (
              // Events List View
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
                        className="p-3 rounded-md cursor-pointer hover-elevate border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
                        onClick={() => handleSelectEvent(event.id)}
                        data-testid={`chat-event-${event.id}`}
                      >
                        <div className="font-medium text-sm line-clamp-1">{event.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {event.location}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No events yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : selectedEventId ? (
              // Chat View
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full p-3" ref={scrollRef}>
                    {allMessages.length > 0 ? (
                      <div className="space-y-3">
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
                              className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                              data-testid={`chat-message-${msg.id}`}
                            >
                              {!isCurrentUser && (
                                <Avatar className="w-7 h-7 flex-shrink-0">
                                  {msg.sender?.profileImageUrl ? (
                                    <AvatarImage src={msg.sender.profileImageUrl} />
                                  ) : null}
                                  <AvatarFallback className="text-xs">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`flex flex-col ${isCurrentUser ? 'items-end' : ''} max-w-[75%]`}>
                                {!isCurrentUser && (
                                  <span className="text-xs font-medium mb-0.5 px-1">
                                    {senderName}
                                  </span>
                                )}
                                <div
                                  className={`rounded-lg px-3 py-2 ${
                                    isCurrentUser
                                      ? 'bg-gradient-to-r from-orange-300 to-amber-300 text-white'
                                      : 'bg-muted'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs">Start the conversation!</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0"
                          type="button"
                          data-testid="button-emoji-picker"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border-0" align="start" side="top">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width={300}
                          height={350}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 text-sm"
                      data-testid="input-chat-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      size="icon"
                      className="bg-gradient-to-r from-orange-300 to-amber-300 hover:from-orange-400 hover:to-amber-400 text-white h-9 w-9 flex-shrink-0"
                      data-testid="button-send-chat-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      )}
    </div>
  );
}
