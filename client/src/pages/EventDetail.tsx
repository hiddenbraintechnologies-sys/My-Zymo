import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Share2, LogOut, MessageCircle, DollarSign, Package, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Event, User, EventParticipant } from "@shared/schema";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

type EventDetail = Event & {
  participants: (EventParticipant & { user: User })[];
  hasJoined?: boolean;
};

export default function EventDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/events/:id");
  const { toast } = useToast();
  
  const { data: event, isLoading } = useQuery<EventDetail>({
    queryKey: ["/api/events", params?.id],
    enabled: !!user && !!params?.id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/events/${params?.id}/join`, "POST", { status: "going" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/events", params?.id] });
      toast({
        title: "Joined event!",
        description: "You're now a participant in this event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleWhatsAppShare = () => {
    if (!event) return;
    
    const eventUrl = window.location.href;
    const message = `🎉 You're invited to ${event.title}!\n\n📅 ${format(new Date(event.date), 'PPP')}\n📍 ${event.location}\n\nJoin us on Myzymo: ${eventUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Share via WhatsApp",
      description: "Opening WhatsApp to share your event invitation",
    });
  };

  const handleCopyLink = () => {
    const eventUrl = window.location.href;
    navigator.clipboard.writeText(eventUrl);
    
    toast({
      title: "Link copied!",
      description: "Event link copied to clipboard. Share it with your guests!",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
              <img src={logoUrl} alt="Myzymo" className="w-10 h-10" />
              <span className="font-heading font-bold text-xl">Myzymo</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/events" data-testid="link-events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/messages" data-testid="link-messages">
              <Button variant="ghost">Messages</Button>
            </Link>
            <Link href="/vendors" data-testid="link-vendors">
              <Button variant="ghost">Vendors</Button>
            </Link>
            <Link href="/ai-assistant" data-testid="link-ai-assistant">
              <Button variant="ghost">AI Assistant</Button>
            </Link>
            <Link href="/profile" data-testid="link-profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm" data-testid="text-user-name">
                {user.firstName} {user.lastName}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96" />
          </div>
        ) : !event ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Event not found</p>
            <Button onClick={() => navigate("/events")} className="mt-4" data-testid="button-back-to-events">
              Back to Events
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-event-name">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-muted-foreground" data-testid="text-event-description">
                    {event.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={handleWhatsAppShare}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  data-testid="button-whatsapp-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </Button>
              </div>
            </div>

            {event.hasJoined === false && (
              <Alert className="border-primary bg-primary/5" data-testid="alert-join-event">
                <UserPlus className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    You've been invited to this event! Join to see all details and participate in chats.
                  </span>
                  <Button 
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    data-testid="button-join-event"
                  >
                    {joinMutation.isPending ? "Joining..." : "Join Event"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium" data-testid="text-event-date">
                      {format(new Date(event.date), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-1" data-testid="text-event-location">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="font-medium flex items-center gap-1" data-testid="text-participant-count">
                      <Users className="w-4 h-4" />
                      {event.participants.length} {event.participants.length === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Participants ({event.participants.length})
                  </CardTitle>
                  <CardDescription>
                    Invite your friends and family via WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                        data-testid={`participant-${participant.userId}`}
                      >
                        <div className="flex items-center gap-3">
                          {participant.user.profileImageUrl && (
                            <img
                              src={participant.user.profileImageUrl}
                              alt={`${participant.user.firstName} ${participant.user.lastName}`}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium" data-testid={`participant-name-${participant.userId}`}>
                              {participant.user.firstName} {participant.user.lastName}
                              {participant.userId === event.creatorId && (
                                <Badge variant="secondary" className="ml-2">Organizer</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {participant.user.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant={participant.status === 'going' ? 'default' : 'secondary'}>
                          {participant.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-elevate cursor-pointer" onClick={() => navigate('/dashboard')} data-testid="card-group-chat">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Group Chat
                  </CardTitle>
                  <CardDescription>
                    Discuss event details with participants
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-elevate cursor-pointer" data-testid="card-split-expenses">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Split Expenses
                  </CardTitle>
                  <CardDescription>
                    Track and split event costs (Coming soon)
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover-elevate cursor-pointer" data-testid="card-book-vendors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Book Vendors
                  </CardTitle>
                  <CardDescription>
                    Find and book services (Coming soon)
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
