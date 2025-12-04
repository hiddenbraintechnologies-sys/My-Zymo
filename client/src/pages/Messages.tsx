import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2, Sparkles, Phone, Video, Mail, Users, Plus, UserPlus, LogOut, Settings, Paperclip, File, Image, Download, Calendar, Share2, Copy, Check, Link } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRoute, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import type { DirectMessage, User, GroupChat, GroupMessage, GroupChatMember, EventGroup, EventGroupMessage } from "@shared/schema";
import { useWebRTC } from "@/hooks/useWebRTC";
import { IncomingCallModal } from "@/components/IncomingCallModal";
import { ActiveCallDialog } from "@/components/ActiveCallDialog";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { GroupCallDialog } from "@/components/GroupCallDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { AvatarWithOnlineIndicator, OnlineIndicator } from "@/components/OnlineIndicator";

type ConversationListItem = {
  userId: string;
  user: User;
  lastMessage: DirectMessage | null;
  unreadCount: number;
};

type DirectMessageWithUser = DirectMessage & {
  sender: User;
  recipient: User;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
};

type GroupChatWithDetails = GroupChat & {
  memberCount: number;
  lastMessage: GroupMessage | null;
};

type GroupMessageWithUser = GroupMessage & {
  sender: User;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
};

type GroupMemberWithUser = GroupChatMember & {
  user: User;
};

type EventGroupWithDetails = EventGroup & {
  members: { userId: string; user: User }[];
  createdBy?: User;
};

type EventGroupMessageWithUser = EventGroupMessage & {
  sender: User;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
};

export default function Messages() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/messages/:userId");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"direct" | "groups" | "events">("direct");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(params?.userId || null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedEventGroupId, setSelectedEventGroupId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<DirectMessageWithUser[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessageWithUser[]>([]);
  const [eventGroupMessages, setEventGroupMessages] = useState<EventGroupMessageWithUser[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const selectedGroupIdRef = useRef<string | null>(null);
  const selectedEventGroupIdRef = useRef<string | null>(null);
  const markedAsReadRef = useRef<Set<string>>(new Set());
  
  // Group call state
  const [groupCallActive, setGroupCallActive] = useState(false);
  const [groupCallType, setGroupCallType] = useState<"audio" | "video">("audio");
  const [groupCallGroupId, setGroupCallGroupId] = useState<string | null>(null);
  const [groupCallIsEventGroup, setGroupCallIsEventGroup] = useState(false);
  
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  
  // Create group chat state
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Group settings state
  const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  
  // Chat invite state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteType, setInviteType] = useState<"direct" | "group">("direct");
  const [copiedInvite, setCopiedInvite] = useState(false);

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

  // Notifications for browser push notifications
  const { permission: notificationPermission, requestPermission, showMessageNotification } = useNotifications();

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationListItem[]>({
    queryKey: ["/api/direct-messages/conversations"],
  });

  const { data: groupChats = [], isLoading: groupChatsLoading } = useQuery<GroupChatWithDetails[]>({
    queryKey: ["/api/group-chats"],
  });

  const { data: eventGroups = [], isLoading: eventGroupsLoading } = useQuery<EventGroupWithDetails[]>({
    queryKey: ["/api/groups"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Get all user IDs for online presence tracking
  const conversationUserIds = conversations.map(c => c.userId);
  
  // Online presence tracking
  const { isUserOnline } = useOnlinePresence({
    userIds: conversationUserIds,
    wsRef,
  });

  // Request notification permission on mount
  useEffect(() => {
    if (notificationPermission === 'default') {
      requestPermission();
    }
  }, [notificationPermission, requestPermission]);

  // Update selectedUserId when URL parameter changes
  useEffect(() => {
    if (params?.userId) {
      setSelectedUserId(params.userId);
      setSelectedGroupId(null);
      setActiveTab("direct");
      setShowSuggestions(false);
      setAiSuggestions([]);
    }
  }, [params?.userId]);

  // Keep refs in sync with state for WebSocket handler
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    selectedGroupIdRef.current = selectedGroupId;
  }, [selectedGroupId]);

  useEffect(() => {
    selectedEventGroupIdRef.current = selectedEventGroupId;
  }, [selectedEventGroupId]);

  const { data: selectedMessages = [], isLoading: messagesLoading } = useQuery<DirectMessageWithUser[]>({
    queryKey: ["/api/direct-messages", selectedUserId],
    enabled: !!selectedUserId && activeTab === "direct",
  });

  const { data: selectedGroupMessages = [], isLoading: groupMessagesLoading } = useQuery<GroupMessageWithUser[]>({
    queryKey: ["/api/group-chats", selectedGroupId, "messages"],
    enabled: !!selectedGroupId && activeTab === "groups",
  });

  const { data: groupMembers = [] } = useQuery<GroupMemberWithUser[]>({
    queryKey: ["/api/group-chats", selectedGroupId, "members"],
    enabled: !!selectedGroupId && activeTab === "groups",
  });

  const { data: selectedEventGroupMessages = [], isLoading: eventGroupMessagesLoading } = useQuery<EventGroupMessageWithUser[]>({
    queryKey: ["/api/groups", selectedEventGroupId, "messages"],
    enabled: !!selectedEventGroupId && activeTab === "events",
  });

  const prevMessagesRef = useRef<string>("");
  const prevGroupMessagesRef = useRef<string>("");
  const prevEventGroupMessagesRef = useRef<string>("");

  useEffect(() => {
    const messagesKey = JSON.stringify(selectedMessages.map(m => m.id));
    if (messagesKey !== prevMessagesRef.current) {
      prevMessagesRef.current = messagesKey;
      setMessages(selectedMessages);
    }
  }, [selectedMessages]);

  useEffect(() => {
    const groupMessagesKey = JSON.stringify(selectedGroupMessages.map(m => m.id));
    if (groupMessagesKey !== prevGroupMessagesRef.current) {
      prevGroupMessagesRef.current = groupMessagesKey;
      setGroupMessages(selectedGroupMessages);
    }
  }, [selectedGroupMessages]);

  useEffect(() => {
    const eventGroupMessagesKey = JSON.stringify(selectedEventGroupMessages.map(m => m.id));
    if (eventGroupMessagesKey !== prevEventGroupMessagesRef.current) {
      prevEventGroupMessagesRef.current = eventGroupMessagesKey;
      setEventGroupMessages(selectedEventGroupMessages);
    }
  }, [selectedEventGroupMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, groupMessages.length, eventGroupMessages.length, scrollToBottom]);

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
    if (selectedUserId && activeTab === "direct") {
      if (!markedAsReadRef.current.has(selectedUserId)) {
        markedAsReadRef.current.add(selectedUserId);
        markAsReadMutation.mutate(selectedUserId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, activeTab]);

  // Create group chat mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; memberIds: string[] }) => {
      const res = await apiRequest("/api/group-chats", "POST", data);
      return await res.json();
    },
    onSuccess: (groupChat) => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chats"] });
      setCreateGroupOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setSelectedMembers([]);
      setSelectedGroupId(groupChat.id);
      setActiveTab("groups");
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
      return apiRequest(`/api/group-chats/${groupId}/members`, "POST", { memberId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chats", selectedGroupId, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/group-chats"] });
      setAddMemberOpen(false);
    },
  });

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return apiRequest(`/api/group-chats/${groupId}/members/${currentUser?.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chats"] });
      setSelectedGroupId(null);
      setGroupSettingsOpen(false);
    },
  });

  // Create chat invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async (data: { inviteType: "direct" | "group"; groupChatId?: string; message?: string; expiresIn?: number }) => {
      const res = await apiRequest("/api/chat-invites", "POST", data);
      return await res.json();
    },
    onSuccess: (invite) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/chat-invite/${invite.inviteCode}`;
      setInviteLink(link);
      setInviteDialogOpen(true);
      toast({
        title: "Invite link created",
        description: "Share this link to invite someone to chat",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create invite",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Handle creating a chat invite
  const handleCreateInvite = (type: "direct" | "group") => {
    setInviteType(type);
    if (type === "group" && selectedGroupId) {
      createInviteMutation.mutate({ inviteType: "group", groupChatId: selectedGroupId, expiresIn: 24 });
    } else {
      createInviteMutation.mutate({ inviteType: "direct", expiresIn: 24 });
    }
  };

  // Copy invite link to clipboard
  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInvite(true);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  // WebSocket connection - only depends on currentUser to prevent reconnections
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected for messages");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "direct-message") {
        const newMessage = data.message as DirectMessageWithUser;
        const currentSelectedUserId = selectedUserIdRef.current;
        
        if (
          currentSelectedUserId &&
          (newMessage.senderId === currentSelectedUserId || newMessage.recipientId === currentSelectedUserId)
        ) {
          setMessages((prev) => [...prev, newMessage]);
          
          if (newMessage.recipientId === currentUser?.id && currentSelectedUserId) {
            markAsReadMutation.mutate(currentSelectedUserId);
          }
        }
        
        // Show notification for incoming messages from others
        if (newMessage.senderId !== currentUser?.id) {
          const senderName = `${newMessage.sender?.firstName || ''} ${newMessage.sender?.lastName || ''}`.trim() || 'Someone';
          showMessageNotification(
            senderName,
            newMessage.content || 'Sent a file',
            'direct',
            undefined,
            () => setLocation(`/messages/${newMessage.senderId}`)
          );
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/direct-messages/conversations"] });
      } else if (data.type === "group-message") {
        const newMessage = data.message as GroupMessageWithUser;
        const currentSelectedGroupId = selectedGroupIdRef.current;
        
        if (currentSelectedGroupId === data.groupId) {
          setGroupMessages((prev) => [...prev, newMessage]);
        }
        
        // Show notification for group messages from others
        if (newMessage.senderId !== currentUser?.id) {
          const senderName = `${newMessage.sender?.firstName || ''} ${newMessage.sender?.lastName || ''}`.trim() || 'Someone';
          const groupChat = groupChats.find(g => g.id === data.groupId);
          showMessageNotification(
            senderName,
            newMessage.content || 'Sent a file',
            'group',
            groupChat?.name || 'Group Chat'
          );
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/group-chats"] });
      } else if (data.type === "event-group-message") {
        const newMessage = data.message as EventGroupMessageWithUser;
        const currentSelectedEventGroupId = selectedEventGroupIdRef.current;
        
        if (currentSelectedEventGroupId === data.groupId) {
          setEventGroupMessages((prev) => [...prev, newMessage]);
        }
        
        // Show notification for event group messages from others
        if (newMessage.senderId !== currentUser?.id) {
          const senderName = `${newMessage.sender?.firstName || ''} ${newMessage.sender?.lastName || ''}`.trim() || 'Someone';
          const eventGroup = eventGroups.find(g => g.id === data.groupId);
          showMessageNotification(
            senderName,
            newMessage.content || 'Sent a file',
            'event',
            eventGroup?.name || 'Event Group'
          );
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [currentUser?.id]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !wsRef.current) return;

    if (activeTab === "direct" && selectedUserId) {
      wsRef.current.send(
        JSON.stringify({
          type: "direct-message",
          recipientId: selectedUserId,
          content: messageContent.trim(),
        })
      );
    } else if (activeTab === "groups" && selectedGroupId) {
      wsRef.current.send(
        JSON.stringify({
          type: "group-message",
          groupId: selectedGroupId,
          content: messageContent.trim(),
        })
      );
    } else if (activeTab === "events" && selectedEventGroupId) {
      wsRef.current.send(
        JSON.stringify({
          type: "event-group-message",
          groupId: selectedEventGroupId,
          content: messageContent.trim(),
        })
      );
    }

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

  // File upload handlers
  const handleGetUploadParameters = async (file: { name: string; type: string; size: number }) => {
    setIsUploading(true);
    const res = await apiRequest("/api/objects/upload-url", "POST", { fileName: file.name });
    const data = await res.json();
    return {
      method: "PUT" as const,
      url: data.url,
      objectPath: data.objectPath,
    };
  };

  const handleFileUploadComplete = (file: { name: string; type: string; size: number; objectPath: string }) => {
    setIsUploading(false);
    
    if (!wsRef.current) return;

    if (activeTab === "direct" && selectedUserId) {
      wsRef.current.send(
        JSON.stringify({
          type: "direct-message",
          recipientId: selectedUserId,
          content: "",
          fileUrl: file.objectPath,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        })
      );
    } else if (activeTab === "groups" && selectedGroupId) {
      wsRef.current.send(
        JSON.stringify({
          type: "group-message",
          groupId: selectedGroupId,
          content: "",
          fileUrl: file.objectPath,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        })
      );
    } else if (activeTab === "events" && selectedEventGroupId) {
      wsRef.current.send(
        JSON.stringify({
          type: "event-group-message",
          groupId: selectedEventGroupId,
          content: "",
          fileUrl: file.objectPath,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        })
      );
    }

    toast({
      title: "File shared",
      description: `${file.name} has been shared successfully`,
    });
  };

  const handleFileUploadError = (error: Error) => {
    setIsUploading(false);
    toast({
      title: "Upload failed",
      description: error.message,
      variant: "destructive",
    });
  };

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to render file attachment
  const renderFileAttachment = (fileUrl: string | null | undefined, fileName: string | null | undefined, fileSize: number | null | undefined, fileType: string | null | undefined, isCurrentUser: boolean) => {
    if (!fileUrl) return null;

    const isImage = fileType?.startsWith('image/');
    const downloadUrl = `/api${fileUrl}`;

    return (
      <div className="mt-2">
        {isImage ? (
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block">
            <img 
              src={downloadUrl} 
              alt={fileName || 'Shared image'} 
              className="max-w-full max-h-48 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
              data-testid="img-file-attachment"
            />
          </a>
        ) : (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isCurrentUser ? 'bg-primary-foreground/20' : 'bg-background/50'
            } hover:opacity-80 transition-opacity`}
            data-testid="link-file-download"
          >
            <File className="h-4 w-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName || 'File'}</p>
              {fileSize && (
                <p className="text-xs opacity-70">{formatFileSize(fileSize)}</p>
              )}
            </div>
            <Download className="h-4 w-4 shrink-0" />
          </a>
        )}
      </div>
    );
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroupMutation.mutate({
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      memberIds: selectedMembers,
    });
  };

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);
  const selectedGroup = groupChats.find((g) => g.id === selectedGroupId);
  const currentUserMember = groupMembers.find(m => m.userId === currentUser?.id);
  const isGroupAdmin = currentUserMember?.role === 'admin' || selectedGroup?.createdById === currentUser?.id;

  // Filter out current user and existing group members for adding new members
  const availableUsersForGroup = allUsers.filter(u => 
    u.id !== currentUser?.id && 
    !groupMembers.some(m => m.userId === u.id)
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />
      
      <div className="container mx-auto px-4 py-4">
        {/* Hero Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-2">
              <Mail className="w-8 h-8" />
              Messages
            </h1>
            <p className="text-white/90 text-lg">Connect with event participants and friends</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="md:col-span-1 p-4">
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as "direct" | "groups" | "events");
              if (v === "direct") {
                setSelectedGroupId(null);
                setSelectedEventGroupId(null);
              } else if (v === "groups") {
                setSelectedUserId(null);
                setSelectedEventGroupId(null);
              } else if (v === "events") {
                setSelectedUserId(null);
                setSelectedGroupId(null);
              }
            }}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="direct" className="flex-1 gap-2" data-testid="tab-direct-messages">
                  <Mail className="h-4 w-4" />
                  Direct
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex-1 gap-2" data-testid="tab-group-chats">
                  <Users className="h-4 w-4" />
                  Groups
                </TabsTrigger>
                <TabsTrigger value="events" className="flex-1 gap-2" data-testid="tab-event-groups">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="mt-0">
                {/* Share Chat Invite Button */}
                <Button 
                  variant="outline" 
                  className="w-full mb-4 gap-2" 
                  onClick={() => handleCreateInvite("direct")}
                  disabled={createInviteMutation.isPending}
                  data-testid="button-share-chat-invite"
                >
                  {createInviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                  Share Chat Invite
                </Button>
                
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
                          setSelectedGroupId(null);
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
                          <AvatarWithOnlineIndicator isOnline={isUserOnline(conv.userId)} size="md">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conv.user.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          </AvatarWithOnlineIndicator>
                          
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
              </TabsContent>

              <TabsContent value="groups" className="mt-0">
                {/* Create Group Button */}
                <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-4 gap-2" data-testid="button-create-group">
                      <Plus className="h-4 w-4" />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Group Chat</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="groupName">Group Name</Label>
                        <Input
                          id="groupName"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Enter group name"
                          data-testid="input-group-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="groupDescription">Description (optional)</Label>
                        <Textarea
                          id="groupDescription"
                          value={newGroupDescription}
                          onChange={(e) => setNewGroupDescription(e.target.value)}
                          placeholder="What's this group about?"
                          className="resize-none"
                          data-testid="input-group-description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Add Members</Label>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          {allUsers.filter(u => u.id !== currentUser.id).map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-accent rounded-md">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedMembers.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMembers([...selectedMembers, user.id]);
                                  } else {
                                    setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                                  }
                                }}
                                data-testid={`checkbox-member-${user.id}`}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImageUrl || undefined} />
                                <AvatarFallback>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                                {user.firstName} {user.lastName}
                              </label>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                      <Button 
                        onClick={handleCreateGroup} 
                        disabled={!newGroupName.trim() || createGroupMutation.isPending}
                        className="w-full"
                        data-testid="button-confirm-create-group"
                      >
                        {createGroupMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Create Group
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {groupChatsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : groupChats.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No group chats yet. Create one to get started!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {groupChats.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setSelectedUserId(null);
                        }}
                        className={`w-full p-3 rounded-md text-left transition-colors hover-elevate active-elevate-2 ${
                          selectedGroupId === group.id
                            ? "bg-accent"
                            : "bg-transparent"
                        }`}
                        data-testid={`button-group-${group.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold">
                            <Users className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">
                                {group.name}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {group.memberCount}
                              </Badge>
                            </div>
                            
                            {group.lastMessage ? (
                              <p className="text-sm text-muted-foreground truncate">
                                {group.lastMessage.content}
                              </p>
                            ) : group.description ? (
                              <p className="text-sm text-muted-foreground truncate">
                                {group.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                {eventGroupsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : eventGroups.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No event groups yet. Join an event to start planning!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eventGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedEventGroupId(group.id);
                          setSelectedGroupId(null);
                          setSelectedUserId(null);
                        }}
                        className={`w-full p-3 rounded-md text-left transition-colors hover-elevate active-elevate-2 ${
                          selectedEventGroupId === group.id
                            ? "bg-accent"
                            : "bg-transparent"
                        }`}
                        data-testid={`button-event-group-${group.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            <Calendar className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">
                                {group.name}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {group.members?.length || 0}
                              </Badge>
                            </div>
                            
                            {group.description ? (
                              <p className="text-sm text-muted-foreground truncate">
                                {group.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Chat Area */}
          <Card className={`md:col-span-2 p-4 flex flex-col ${(selectedUserId || selectedGroupId || selectedEventGroupId) ? 'h-[600px]' : 'min-h-[200px]'}`}>
            {!selectedUserId && !selectedGroupId && !selectedEventGroupId ? (
              <div className="flex items-start justify-center pt-8 text-muted-foreground">
                Select a conversation, group, or event to start messaging
              </div>
            ) : activeTab === "direct" && selectedUserId ? (
              <>
                {/* Chat Header - Direct Messages */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <AvatarWithOnlineIndicator isOnline={isUserOnline(selectedUserId)} size="md">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation?.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {selectedConversation?.user.firstName?.[0]}
                          {selectedConversation?.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </AvatarWithOnlineIndicator>
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid="text-chat-recipient-name">
                        {selectedConversation?.user.firstName} {selectedConversation?.user.lastName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <OnlineIndicator isOnline={isUserOnline(selectedUserId)} size="sm" showLabel />
                        {selectedConversation?.user.profession && (
                          <span className="text-sm text-muted-foreground">
                            &bull; {selectedConversation.user.profession}
                          </span>
                        )}
                      </div>
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

                {/* Messages - Direct */}
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
                            {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                            {renderFileAttachment(msg.fileUrl, msg.fileName, msg.fileSize, msg.fileType, isCurrentUser)}
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

                {/* Input - Direct Messages */}
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
                  <ObjectUploader
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleFileUploadComplete}
                    onError={handleFileUploadError}
                    maxFileSize={10485760}
                    disabled={isUploading}
                    isUploading={isUploading}
                    buttonVariant="ghost"
                    buttonSize="icon"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </ObjectUploader>
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
            ) : activeTab === "groups" && selectedGroupId ? (
              <>
                {/* Chat Header - Group */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid="text-group-name">
                        {selectedGroup?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {groupMembers.length} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setGroupCallGroupId(selectedGroupId);
                          setGroupCallType("audio");
                          setGroupCallIsEventGroup(false);
                          setGroupCallActive(true);
                        }}
                        variant="ghost"
                        size="icon"
                        title="Group audio call"
                        data-testid="button-group-audio-call"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() => {
                          setGroupCallGroupId(selectedGroupId);
                          setGroupCallType("video");
                          setGroupCallIsEventGroup(false);
                          setGroupCallActive(true);
                        }}
                        variant="ghost"
                        size="icon"
                        title="Group video call"
                        data-testid="button-group-video-call"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                      {isGroupAdmin && (
                        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Add member"
                              data-testid="button-add-member"
                            >
                              <UserPlus className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Member</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[300px] py-4">
                              {availableUsersForGroup.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                  No users available to add
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {availableUsersForGroup.map((user) => (
                                    <button
                                      key={user.id}
                                      onClick={() => addMemberMutation.mutate({ 
                                        groupId: selectedGroupId, 
                                        memberId: user.id 
                                      })}
                                      className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate active-elevate-2"
                                      disabled={addMemberMutation.isPending}
                                      data-testid={`button-add-user-${user.id}`}
                                    >
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.profileImageUrl || undefined} />
                                        <AvatarFallback>
                                          {user.firstName?.[0]}{user.lastName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="flex-1 text-left">
                                        {user.firstName} {user.lastName}
                                      </span>
                                      <Plus className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Dialog open={groupSettingsOpen} onOpenChange={setGroupSettingsOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Group settings"
                            data-testid="button-group-settings"
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Group Settings</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div>
                              <Label className="text-muted-foreground text-sm">Members</Label>
                              <ScrollArea className="h-[200px] mt-2 border rounded-md p-2">
                                {groupMembers.map((member) => (
                                  <div key={member.id} className="flex items-center gap-3 p-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={member.user.profileImageUrl || undefined} />
                                      <AvatarFallback>
                                        {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1">
                                      {member.user.firstName} {member.user.lastName}
                                    </span>
                                    {member.role === 'admin' && (
                                      <Badge variant="secondary">Admin</Badge>
                                    )}
                                  </div>
                                ))}
                              </ScrollArea>
                            </div>
                            {selectedGroup?.createdById !== currentUser.id && (
                              <Button
                                onClick={() => leaveGroupMutation.mutate(selectedGroupId)}
                                disabled={leaveGroupMutation.isPending}
                                variant="destructive"
                                className="w-full gap-2"
                                data-testid="button-leave-group"
                              >
                                {leaveGroupMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <LogOut className="h-4 w-4" />
                                )}
                                Leave Group
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Messages - Group */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {groupMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : groupMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    groupMessages.map((msg) => {
                      const isCurrentUser = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          data-testid={`group-message-${msg.id}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={msg.sender?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {!isCurrentUser && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {msg.sender?.firstName} {msg.sender?.lastName}
                                </p>
                              )}
                              {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                              {renderFileAttachment(msg.fileUrl, msg.fileName, msg.fileSize, msg.fileType, isCurrentUser)}
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - Group */}
                <div className="flex gap-2">
                  <ObjectUploader
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleFileUploadComplete}
                    onError={handleFileUploadError}
                    maxFileSize={10485760}
                    disabled={isUploading}
                    isUploading={isUploading}
                    buttonVariant="ghost"
                    buttonSize="icon"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </ObjectUploader>
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
                    data-testid="input-group-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    size="icon"
                    data-testid="button-send-group-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : activeTab === "events" && selectedEventGroupId ? (
              <>
                {/* Chat Header - Event Group */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" data-testid="text-event-group-name">
                        {eventGroups.find(g => g.id === selectedEventGroupId)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {eventGroups.find(g => g.id === selectedEventGroupId)?.members?.length || 0} members
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setGroupCallGroupId(selectedEventGroupId);
                          setGroupCallType("audio");
                          setGroupCallIsEventGroup(true);
                          setGroupCallActive(true);
                        }}
                        variant="ghost"
                        size="icon"
                        title="Group audio call"
                        data-testid="button-event-group-audio-call"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() => {
                          setGroupCallGroupId(selectedEventGroupId);
                          setGroupCallType("video");
                          setGroupCallIsEventGroup(true);
                          setGroupCallActive(true);
                        }}
                        variant="ghost"
                        size="icon"
                        title="Group video call"
                        data-testid="button-event-group-video-call"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages - Event Group */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {eventGroupMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : eventGroupMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Start planning your event!
                    </div>
                  ) : (
                    eventGroupMessages.map((msg) => {
                      const isCurrentUser = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          data-testid={`event-group-message-${msg.id}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={msg.sender?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs">
                                  {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {!isCurrentUser && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {msg.sender?.firstName} {msg.sender?.lastName}
                                </p>
                              )}
                              {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                              {renderFileAttachment(msg.fileUrl, msg.fileName, msg.fileSize, msg.fileType, isCurrentUser)}
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - Event Group */}
                <div className="flex gap-2">
                  <ObjectUploader
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleFileUploadComplete}
                    onError={handleFileUploadError}
                    maxFileSize={10485760}
                    disabled={isUploading}
                    isUploading={isUploading}
                    buttonVariant="ghost"
                    buttonSize="icon"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </ObjectUploader>
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
                    data-testid="input-event-group-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    size="icon"
                    data-testid="button-send-event-group-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : null}
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

      {/* Group Call Dialog */}
      {groupCallActive && groupCallGroupId && (
        <GroupCallDialog
          open={groupCallActive}
          groupName={
            groupCallIsEventGroup
              ? eventGroups.find(g => g.id === groupCallGroupId)?.name || "Event Group"
              : groupChats.find(g => g.id === groupCallGroupId)?.name || "Group"
          }
          callType={groupCallType}
          memberCount={
            groupCallIsEventGroup
              ? eventGroups.find(g => g.id === groupCallGroupId)?.members?.length || 0
              : groupChats.find(g => g.id === groupCallGroupId)?.memberCount || 0
          }
          onClose={() => {
            setGroupCallActive(false);
            setGroupCallGroupId(null);
          }}
        />
      )}

      {/* Chat Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              {inviteType === "direct" ? "Share Chat Invite" : "Share Group Invite"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {inviteType === "direct" 
                ? "Share this link with someone to let them start a chat with you."
                : "Share this link to invite someone to join this group chat."}
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1"
                data-testid="input-invite-link"
              />
              <Button
                onClick={handleCopyInvite}
                variant="outline"
                size="icon"
                data-testid="button-copy-invite"
              >
                {copiedInvite ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                This invite link expires in 24 hours.
              </p>
              <Button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: inviteType === "direct" ? "Chat with me on Myzymo" : "Join my group on Myzymo",
                      text: inviteType === "direct" 
                        ? "Click this link to start chatting with me!" 
                        : "Click this link to join our group chat!",
                      url: inviteLink,
                    });
                  } else {
                    handleCopyInvite();
                  }
                }}
                className="w-full gap-2"
                data-testid="button-share-invite"
              >
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
