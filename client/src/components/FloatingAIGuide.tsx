import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_ACTIONS = [
  "How do I create an event?",
  "Show me available vendors",
  "Help me complete my profile",
  "What features does Myzymo offer?",
  "How do I invite friends to an event?",
  "Find vendors in my city",
];

export default function FloatingAIGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI guide for Myzymo. I can help you:\n\n• Explore features and plan events\n• Find and book vendors\n• Navigate the platform\n• Answer any questions\n\nWhat would you like to discover?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !conversationId && isOpen) {
      createConversationMutation.mutate();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("/api/ai/conversations", "POST", {
        title: "AI Guide Session",
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) {
        return {
          userMessage: { role: "user" as const, content: message },
          assistantMessage: {
            role: "assistant" as const,
            content:
              "I'd love to help you explore Myzymo! Please sign up or log in to unlock the full AI-guided experience and all platform features.",
          },
        };
      }

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
      setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
      setInputMessage("");
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'd love to help you explore Myzymo! Please sign up or log in to unlock the full AI-guided experience and all platform features.",
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={handleOpen}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 z-50"
          data-testid="button-floating-ai-guide"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[500px] bg-background border rounded-lg shadow-2xl flex flex-col z-50">
          <div className="flex items-center justify-between gap-3 p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">AI Guide</h3>
                <p className="text-xs text-muted-foreground">Your Myzymo assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-ai-guide"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

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
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[75%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}

              {messages.length <= 1 && !sendMessageMutation.isPending && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-3">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_ACTIONS.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover-elevate active-elevate-2 text-xs py-1.5 px-3"
                        onClick={() => handleSuggestionClick(suggestion)}
                        data-testid={`button-suggestion-${index}`}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
                data-testid="input-ai-message"
              />
              <Button
                onClick={handleSend}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
