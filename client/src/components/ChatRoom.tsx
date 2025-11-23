import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export default function ChatRoom() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log("[ChatRoom] WebSocket connected");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prev) => [...prev, {
            id: data.id || Date.now().toString(),
            senderId: data.senderId,
            senderName: data.senderName,
            senderImage: data.senderImage,
            content: data.content,
            imageUrl: data.imageUrl,
            createdAt: new Date(data.createdAt || Date.now()),
          }]);
        }
      } catch (error) {
        console.error("[ChatRoom] Error parsing message:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("[ChatRoom] WebSocket error:", error);
      setIsConnected(false);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log("[ChatRoom] WebSocket disconnected");
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, [user]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !user) return;
    
    const message = {
      type: "message",
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderImage: user.profileImageUrl,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    
    wsRef.current.send(JSON.stringify(message));
    setNewMessage("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wsRef.current || !user) return;
    
    // For now, show a placeholder. In production, you'd upload to a storage service
    toast({
      title: "Image upload",
      description: "Image sharing will be available soon!",
    });
  };
  
  if (!user) return null;
  
  return (
    <Card className="flex flex-col h-[500px]" data-testid="card-chat-room">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Group Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.senderId === user.id;
                const initials = msg.senderName.split(' ').map(n => n[0]).join('').toUpperCase();
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={msg.senderImage} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-medium">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(msg.createdAt, "HH:mm")}
                        </span>
                      </div>
                      <div className={`rounded-lg px-3 py-2 inline-block ${
                        isOwnMessage 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="Shared image" 
                          className="mt-2 rounded-lg max-w-full"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
