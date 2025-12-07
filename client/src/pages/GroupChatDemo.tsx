import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Send, 
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  Heart,
  ThumbsUp,
  ArrowRight,
  UserPlus,
  Lock,
  Users,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCheck,
  Circle,
  PartyPopper,
  Camera,
  Music
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  reactions?: { emoji: string; count: number }[];
}

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  role: string;
}

const DEMO_GROUP = {
  id: "demo-group",
  name: "College Reunion 2025",
  description: "Planning our 10-year batch reunion!",
  eventDate: "March 15, 2025",
  location: "The Grand Ballroom, Mumbai",
  memberCount: 45,
};

const DEMO_MEMBERS: GroupMember[] = [
  { id: "1", name: "Priya Sharma", avatar: "", isOnline: true, role: "Organizer" },
  { id: "2", name: "Rahul Mehta", avatar: "", isOnline: true, role: "Treasurer" },
  { id: "3", name: "Ananya Patel", avatar: "", isOnline: false, role: "Member" },
  { id: "4", name: "Vikram Singh", avatar: "", isOnline: true, role: "Member" },
  { id: "5", name: "Neha Gupta", avatar: "", isOnline: false, role: "Member" },
  { id: "6", name: "Arjun Kumar", avatar: "", isOnline: false, role: "Member" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    senderId: "1",
    senderName: "Priya Sharma",
    senderAvatar: "",
    content: "Hey everyone! So excited for our reunion! The venue is confirmed for March 15th.",
    timestamp: new Date(Date.now() - 3600000 * 2),
    isOwn: false,
    reactions: [{ emoji: "🎉", count: 8 }],
  },
  {
    id: "2",
    senderId: "2",
    senderName: "Rahul Mehta",
    senderAvatar: "",
    content: "That's awesome! I've started collecting contributions. We've raised ₹45,000 so far.",
    timestamp: new Date(Date.now() - 3600000 * 1.5),
    isOwn: false,
    reactions: [{ emoji: "👍", count: 5 }],
  },
  {
    id: "3",
    senderId: "4",
    senderName: "Vikram Singh",
    senderAvatar: "",
    content: "Count me in! Should we also plan some games and activities?",
    timestamp: new Date(Date.now() - 3600000),
    isOwn: false,
  },
  {
    id: "4",
    senderId: "1",
    senderName: "Priya Sharma",
    senderAvatar: "",
    content: "Great idea! I'm thinking we could have a memory lane segment where everyone shares their favorite college moments.",
    timestamp: new Date(Date.now() - 1800000),
    isOwn: false,
  },
  {
    id: "5",
    senderId: "3",
    senderName: "Ananya Patel",
    senderAvatar: "",
    content: "Love that! Also, can we create a shared photo album for old pictures? I have some gems!",
    timestamp: new Date(Date.now() - 900000),
    isOwn: false,
    reactions: [{ emoji: "❤️", count: 12 }],
  },
];

export default function GroupChatDemo() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: "demo-user",
      senderName: "You",
      senderAvatar: "",
      content: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const responses = [
        "That's a great point!",
        "I agree, let's discuss this more at the reunion.",
        "Thanks for sharing!",
        "Looking forward to seeing everyone there!",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: "1",
        senderName: "Priya Sharma",
        senderAvatar: "",
        content: randomResponse,
        timestamp: new Date(),
        isOwn: false,
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1500);
  };

  const handlePremiumFeature = () => {
    setShowSignupPrompt(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const onlineCount = DEMO_MEMBERS.filter(m => m.isOnline).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 dark:from-purple-900 dark:via-violet-900 dark:to-purple-950 py-8 md:py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        {/* Floating Icons */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center animate-bounce border border-white/20" style={{ animationDuration: "2.5s" }}>
          <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center animate-bounce border border-white/20" style={{ animationDuration: "2.8s" }}>
          <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="absolute bottom-4 left-8 md:bottom-8 md:left-16 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center animate-bounce border border-white/20" style={{ animationDuration: "3s" }}>
          <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="absolute bottom-4 right-8 md:bottom-8 md:right-16 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center animate-bounce border border-white/20" style={{ animationDuration: "3.2s" }}>
          <PartyPopper className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt="Myzymo" className="w-8 h-8 md:w-10 md:h-10" />
            <Badge className="bg-gradient-to-r from-purple-400 to-violet-400 text-white border-0">
              <MessageCircle className="w-3 h-3 mr-1" />
              Group Chat Demo
            </Badge>
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-3">
            Real-Time Group Messaging
          </h1>
          <p className="text-purple-100 text-lg md:text-xl max-w-2xl mb-4">
            Stay connected with your event group. Share updates, coordinate plans, and celebrate together!
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30">
              <MessageCircle className="w-3 h-3 mr-1" />
              Instant Messaging
            </Badge>
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30">
              <Users className="w-3 h-3 mr-1" />
              Group Coordination
            </Badge>
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30">
              <Sparkles className="w-3 h-3 mr-1" />
              File Sharing
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Panel */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-purple-200 dark:border-purple-800" data-testid="card-chat-main">
              {/* Chat Header */}
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 px-4 py-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {DEMO_GROUP.name}
                        <Badge variant="secondary" className="text-xs">
                          {DEMO_GROUP.memberCount} members
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        {onlineCount} online now
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Premium Call Buttons - Locked but Clickable to Show Signup */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={handlePremiumFeature}
                      aria-label="Voice call - click to unlock with free signup"
                      data-testid="button-locked-call"
                    >
                      <Lock className="w-3 h-3 mr-1" aria-hidden="true" />
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={handlePremiumFeature}
                      aria-label="Video call - click to unlock with free signup"
                      data-testid="button-locked-video"
                    >
                      <Lock className="w-3 h-3 mr-1" aria-hidden="true" />
                      <Video className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMembersDialog(true)}
                      data-testid="button-view-members"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Members
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages Area */}
              <ScrollArea className="h-[400px] md:h-[500px] p-4" data-testid="chat-messages-area">
                <div className="space-y-4">
                  {/* Event Info Banner */}
                  <div className="flex justify-center">
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-4 py-2">
                      <Calendar className="w-3 h-3 mr-2" />
                      {DEMO_GROUP.eventDate} at {DEMO_GROUP.location}
                    </Badge>
                  </div>
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${message.id}`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className={message.isOwn ? 'bg-purple-500 text-white' : 'bg-gradient-to-br from-purple-400 to-violet-500 text-white'}>
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
                        {!message.isOwn && (
                          <p className="text-xs text-muted-foreground mb-1">{message.senderName}</p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.isOwn
                              ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 ${message.isOwn ? 'justify-end' : ''}`}>
                          <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                          {message.isOwn && <CheckCheck className="w-3 h-3 text-purple-500" />}
                          {message.reactions && message.reactions.map((reaction, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0">
                              {reaction.emoji} {reaction.count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t p-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20">
                <div className="flex items-center gap-2">
                  {/* Premium Attachment Buttons - Clickable to Show Signup */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground relative"
                    onClick={handlePremiumFeature}
                    aria-label="Attach file - click to unlock with free signup"
                    data-testid="button-locked-attach"
                  >
                    <Lock className="w-3 h-3 absolute top-0 right-0" aria-hidden="true" />
                    <Paperclip className="w-5 h-5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground relative"
                    onClick={handlePremiumFeature}
                    aria-label="Share image - click to unlock with free signup"
                    data-testid="button-locked-image"
                  >
                    <Lock className="w-3 h-3 absolute top-0 right-0" aria-hidden="true" />
                    <Image className="w-5 h-5" aria-hidden="true" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-10"
                      data-testid="input-message"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handlePremiumFeature}
                      aria-label="Add emoji - click to unlock with free signup"
                      data-testid="button-locked-emoji"
                    >
                      <Lock className="w-2 h-2 absolute -top-1 -right-1" aria-hidden="true" />
                      <Smile className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar - Group Info & Premium Features */}
          <div className="space-y-4">
            {/* Group Info Card */}
            <Card data-testid="card-group-info">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{DEMO_GROUP.eventDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{DEMO_GROUP.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{DEMO_GROUP.memberCount} members</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Premium Features Locked */}
            {!user && (
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30" data-testid="card-premium-features">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign up to unlock all chat features:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      Voice & Video Calls
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      File & Image Sharing
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      Message Reactions
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      Create Your Own Groups
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      Push Notifications
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                    onClick={() => navigate("/signup")}
                    aria-label="Sign up free to unlock all chat features"
                    data-testid="button-sidebar-signup"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Online Members Preview */}
            <Card data-testid="card-online-members">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                  Online Now ({onlineCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {DEMO_MEMBERS.filter(m => m.isOnline).map((member) => (
                    <div key={member.id} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-violet-500 text-white">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{member.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* CTA Section */}
        <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-950/30" data-testid="card-cta">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-heading font-bold text-2xl mb-2">
                  Create Your Own Group Chats
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sign up to create groups for your events, invite friends, share files, 
                  make voice and video calls, and stay connected with everyone!
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {user ? (
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/dashboard")}
                      className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                      data-testid="button-go-to-dashboard"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Go to My Chats
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate("/signup")}
                        className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                        data-testid="button-signup-cta"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => navigate("/login")}
                        data-testid="button-login-cta"
                      >
                        Already have an account? Log In
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent 
          className="max-w-md" 
          data-testid="dialog-members"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Group Members ({DEMO_MEMBERS.length})
            </DialogTitle>
            <DialogDescription>
              Members of {DEMO_GROUP.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {DEMO_MEMBERS.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-500 text-white">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Badge variant={member.isOnline ? "default" : "secondary"} className="text-xs">
                  {member.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            ))}
          </div>
          
          {!user && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Sign up to view full profiles and connect directly
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-violet-500"
                onClick={() => navigate("/signup")}
                data-testid="button-dialog-signup"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up to Connect
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Signup Prompt Dialog */}
      <Dialog open={showSignupPrompt} onOpenChange={setShowSignupPrompt}>
        <DialogContent 
          className="max-w-sm" 
          data-testid="dialog-signup-prompt"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center">Premium Feature</DialogTitle>
            <DialogDescription className="text-center">
              This feature requires a free account. Sign up to unlock voice calls, video calls, file sharing, and more!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500"
              onClick={() => navigate("/signup")}
              data-testid="button-prompt-signup"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowSignupPrompt(false)}
            >
              Continue Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
