import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface EventChatProps {
  eventId: string;
}

// Mock messages for now - will connect to WebSocket later
const mockMessages = [
  {
    id: "1",
    senderId: "user1",
    senderName: "Priya Sharma",
    senderImage: "",
    content: "Excited for the reunion! Should we plan a surprise for our professors?",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    senderId: "user2",
    senderName: "Rahul Kumar",
    senderImage: "",
    content: "Great idea! Let's discuss the budget for decorations.",
    createdAt: new Date(Date.now() - 1800000),
  },
];

export default function EventChat({ eventId }: EventChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderImage: user.profileImageUrl || "",
      content: newMessage,
      createdAt: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <Card className="flex flex-col h-[500px]" data-testid="card-event-chat">
      <CardHeader className="pb-3">
        <CardTitle>Event Chat</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((msg) => {
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
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-event-chat-message"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              data-testid="button-send-event-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
