import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Myzymo assistant. I can help you learn about our platform, plan events, or find vendors. What would you like to know?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Create conversation when widget opens for logged-in users
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/ai/conversations", "POST", {
        title: "Quick Chat",
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) {
        // For non-logged-in users, simulate a response
        return {
          userMessage: { role: "user" as const, content: message },
          assistantMessage: {
            role: "assistant" as const,
            content:
              "I'd love to help you more! Please sign up or log in to continue our conversation and explore all the features Myzymo has to offer. 😊",
          },
        };
      }

      // For logged-in users, use the AI API
      if (!conversationId) {
        throw new Error("No conversation initialized");
      }

      const res = await apiRequest("/api/ai/chat", "POST", {
        conversationId,
        message,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: data.userMessage.content },
        { role: "assistant", content: data.assistantMessage.content },
      ]);
      setInputMessage("");
    },
  });

  const handleOpen = () => {
    setIsOpen(true);
    if (user && !conversationId) {
      createConversationMutation.mutate();
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage.trim();
    
    if (!user) {
      // For non-logged-in users, add user message immediately and simulate response
      setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
      setInputMessage("");
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'd love to help you more! Please sign up or log in to continue our conversation and explore all the features Myzymo has to offer.",
          },
        ]);
      }, 500);
    } else {
      sendMessageMutation.mutate(messageToSend);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          data-testid="button-open-chatbot"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  AI
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">Myzymo Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-chatbot-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                  size="icon"
                  data-testid="button-send-chatbot-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground mt-2">
                  Log in for full AI assistance
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
