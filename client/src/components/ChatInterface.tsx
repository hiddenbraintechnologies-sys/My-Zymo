import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

// TODO: Remove mock data
const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Rahul Kumar",
    senderInitials: "RK",
    content: "Hey everyone! Excited for the reunion!",
    timestamp: new Date(2025, 10, 22, 14, 30),
    isCurrentUser: false,
  },
  {
    id: "2",
    sender: "You",
    senderInitials: "ME",
    content: "Me too! Can't wait to see everyone again.",
    timestamp: new Date(2025, 10, 22, 14, 35),
    isCurrentUser: true,
  },
  {
    id: "3",
    sender: "Priya Sharma",
    senderInitials: "PS",
    content: "Should we plan the menu? Any dietary restrictions?",
    timestamp: new Date(2025, 10, 22, 15, 10),
    isCurrentUser: false,
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "You",
        senderInitials: "ME",
        content: newMessage,
        timestamp: new Date(),
        isCurrentUser: true,
      };
      setMessages([...messages, message]);
      setNewMessage("");
      console.log('Message sent:', newMessage);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-background border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isCurrentUser ? 'flex-row-reverse' : ''}`}
          >
            {!message.isCurrentUser && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {message.senderInitials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className={`flex flex-col ${message.isCurrentUser ? 'items-end' : ''}`}>
              {!message.isCurrentUser && (
                <span className="text-xs font-medium mb-1">
                  {message.sender}
                </span>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-md ${
                  message.isCurrentUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {format(message.timestamp, 'h:mm a')}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            data-testid="input-chat-message"
          />
          <Button 
            size="icon"
            onClick={handleSend}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
