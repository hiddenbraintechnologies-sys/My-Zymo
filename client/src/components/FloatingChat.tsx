import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Send, MessageSquare, Smile, Users, ArrowLeft, Phone, Video, Mail, Calendar, X } from "lucide-react";
import type { Event, User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { IncomingCallModal } from "@/components/IncomingCallModal";
import { ActiveCallDialog } from "@/components/ActiveCallDialog";

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
  participants?: Array<{
    id: string;
    userId: string;
    status: string;
    user: User;
  }>;
}

type ChatView = 'event-list' | 'chat';

export default function FloatingChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ChatView>('event-list');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // WebRTC for calling participants
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
    currentUserId: user?.id,
    recipientId: selectedParticipantId,
  });

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
          queryClient.invalidateQueries({ queryKey: ["/api/events", selectedEventId] });
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 100);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedEvent?.messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    } else {
      setCurrentView('event-list');
      setSelectedEventId(null);
      setSelectedParticipantId(null);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('chat');
    setUnreadCount(0);
  };

  const handleBackToEvents = () => {
    setCurrentView('event-list');
    setSelectedEventId(null);
    setSelectedParticipantId(null);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !wsRef.current || !selectedEventId) return;

    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: messageInput.trim(),
    }));

    setMessageInput("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const handleStartDirectMessage = (participantId: string) => {
    setIsOpen(false);
    setLocation(`/messages/${participantId}`);
  };

  const handleCallParticipant = (participantId: string, type: 'audio' | 'video') => {
    setSelectedParticipantId(participantId);
    setTimeout(() => {
      startCall(type);
    }, 100);
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const allMessages = selectedEvent?.messages || [];
  const participants = selectedEvent?.participants || [];

  // Filter out current user from participants list
  const otherParticipants = participants.filter(p => p.userId !== user?.id);

  // Find selected participant for call dialog
  const selectedParticipant = participants.find(p => p.userId === selectedParticipantId);

  if (!user) return null;

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
              {currentView === 'chat' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20 mr-1"
                  onClick={handleBackToEvents}
                  data-testid="button-back-to-events"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              <span className="truncate">
                {currentView === 'chat' 
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
            {currentView === 'event-list' ? (
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
            ) : (
              // Chat View with Tabs for Messages and Participants
              <Tabs defaultValue="messages" className="flex flex-col h-full">
                <TabsList className="grid grid-cols-2 mx-3 mt-2">
                  <TabsTrigger value="messages" data-testid="tab-messages">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="participants" data-testid="tab-participants">
                    <Users className="w-4 h-4 mr-1" />
                    People ({otherParticipants.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="flex-1 flex flex-col mt-0 overflow-hidden">
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
                </TabsContent>

                <TabsContent value="participants" className="flex-1 mt-0 overflow-hidden">
                  <ScrollArea className="h-full p-3">
                    {otherParticipants.length > 0 ? (
                      <div className="space-y-2">
                        {otherParticipants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center gap-3 p-2 rounded-md hover-elevate border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
                            data-testid={`participant-${participant.userId}`}
                          >
                            <Avatar className="w-10 h-10">
                              {participant.user.profileImageUrl ? (
                                <AvatarImage src={participant.user.profileImageUrl} />
                              ) : null}
                              <AvatarFallback>
                                {getInitials(participant.user.firstName, participant.user.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {participant.user.firstName} {participant.user.lastName}
                              </p>
                              {participant.user.profession && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {participant.user.profession}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleStartDirectMessage(participant.userId)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Send message"
                                data-testid={`button-message-${participant.userId}`}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleCallParticipant(participant.userId, 'audio')}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Audio call"
                                data-testid={`button-audio-call-${participant.userId}`}
                                disabled={callState !== 'idle'}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleCallParticipant(participant.userId, 'video')}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Video call"
                                data-testid={`button-video-call-${participant.userId}`}
                                disabled={callState !== 'idle'}
                              >
                                <Video className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No other participants yet</p>
                          <p className="text-xs">Invite people to join!</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </Card>
      )}

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
      {(callState === "calling" || callState === "active") && selectedParticipant && (
        <ActiveCallDialog
          open={true}
          callState={callState}
          callType={callType}
          localStream={localStream}
          remoteStream={remoteStream}
          remoteName={`${selectedParticipant.user.firstName} ${selectedParticipant.user.lastName}`}
          onEndCall={endCall}
        />
      )}
    </div>
  );
}
