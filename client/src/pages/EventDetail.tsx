import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Share2, MessageCircle, DollarSign, Package, UserPlus, Image, Download, Sparkles, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Event, User, EventParticipant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvitationCardRenderer, isTemplateCard } from "@/components/InvitationCardRenderer";
import Navbar from "@/components/Navbar";

// Full event detail for authenticated users
type EventDetail = Event & {
  participants: (EventParticipant & { user: User })[];
  hasJoined?: boolean;
};

// Public preview for unauthenticated visitors (matches actual backend response)
type PublicEventPreview = Pick<Event, 'id' | 'title' | 'description' | 'date' | 'location' | 'imageUrl' | 'invitationCardUrl' | 'isPublic' | 'creatorId'> & {
  participants: []; // Empty array in public preview
  messages: [];
  expenses: [];
  bookings: [];
  hasJoined: false;
  requiresAuth?: boolean;
};

export default function EventDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/events/:id");
  const { toast } = useToast();
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  
  // Authenticated query - full event details or participant preview
  const { data: authenticatedEvent, isLoading: authenticatedLoading } = useQuery<EventDetail>({
    queryKey: ["/api/events", params?.id],
    enabled: !!user && !!params?.id,
  });
  
  // Public preview query - for unauthenticated users viewing public events
  const { data: publicEvent, isLoading: publicLoading } = useQuery<PublicEventPreview>({
    queryKey: ["/api/public-events", params?.id],
    enabled: !authLoading && !user && !!params?.id,
  });
  
  // Use the appropriate event data based on authentication status
  const event: EventDetail | PublicEventPreview | undefined = user ? authenticatedEvent : publicEvent;
  const isLoading = authLoading || (user ? authenticatedLoading : publicLoading);
  
  // Type guard to check if we have full event details with participants
  // Public previews always have hasJoined: false and empty arrays, so check requiresAuth flag and user
  const hasFullAccess = (evt: EventDetail | PublicEventPreview | undefined): evt is EventDetail => {
    if (!evt || !user) return false;
    // Public previews have requiresAuth flag set, so check for its absence
    if ('requiresAuth' in evt && evt.requiresAuth === true) return false;
    // Check if hasJoined is not explicitly false (meaning user has joined or is the creator)
    return 'hasJoined' in evt && evt.hasJoined !== false;
  };

  // Only create join mutation for authenticated users
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Must be logged in to join event");
      }
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

  const handleWhatsAppShare = () => {
    if (!event) {
      toast({
        title: "Error",
        description: "Event data not available",
        variant: "destructive",
      });
      return;
    }
    
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
    if (!event) {
      toast({
        title: "Error",
        description: "Event data not available",
        variant: "destructive",
      });
      return;
    }
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
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
                  Invite Link
                </Button>
                <Button
                  onClick={handleWhatsAppShare}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  data-testid="button-whatsapp-share"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite on WhatsApp
                </Button>
              </div>
            </div>

            {event.invitationCardUrl && (
              <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Image className="w-5 h-5 text-orange-500" />
                      Invitation Card
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                      {isTemplateCard(event.invitationCardUrl) ? (
                        <>
                          <Palette className="w-3 h-3 mr-1" />
                          Template
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Generated
                        </>
                      )}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-700 hover:border-orange-400 transition-colors max-w-md mx-auto">
                        {isTemplateCard(event.invitationCardUrl) ? (
                          <InvitationCardRenderer
                            templateData={event.invitationCardUrl}
                            eventTitle={event.title}
                            eventDate={event.date.toString()}
                            eventLocation={event.location}
                            data-testid="template-invitation-card"
                          />
                        ) : (
                          <img 
                            src={event.invitationCardUrl} 
                            alt={`${event.title} invitation card`}
                            className="w-full h-auto"
                            data-testid="img-invitation-card"
                          />
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-orange-500" />
                          {event.title} - Invitation Card
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {isTemplateCard(event.invitationCardUrl) ? (
                          <InvitationCardRenderer
                            templateData={event.invitationCardUrl}
                            eventTitle={event.title}
                            eventDate={event.date.toString()}
                            eventLocation={event.location}
                            className="border-2 border-orange-200 dark:border-orange-700"
                          />
                        ) : (
                          <img 
                            src={event.invitationCardUrl}
                            alt={`${event.title} invitation card`}
                            className="w-full h-auto rounded-lg"
                          />
                        )}
                        <div className="flex gap-2 justify-center flex-wrap">
                          {!isTemplateCard(event.invitationCardUrl) && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = event.invitationCardUrl!;
                                link.download = `${event.title.replace(/\s+/g, "-")}-invitation.png`;
                                link.click();
                              }}
                              data-testid="button-download-invitation"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Card
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              const message = `You're invited to ${event.title}!\n\n` +
                                `Date: ${format(new Date(event.date), 'PPP')}\n` +
                                `Location: ${event.location}\n\n` +
                                `Join us on Myzymo: ${window.location.href}`;
                              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                            data-testid="button-share-invitation"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share on WhatsApp
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <p className="text-center text-sm text-muted-foreground">
                    Click to view full size and share
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Show join/login CTA for non-participants or unauthenticated users */}
            {(!user || (user && event?.hasJoined === false)) && (
              <Alert className="border-primary bg-primary/5" data-testid="alert-join-event">
                <UserPlus className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {user 
                      ? "You've been invited to this event! Join to see all details and participate in chats."
                      : "Log in to join this event and access all features including chats, expenses, and vendor bookings."}
                  </span>
                  <Button 
                    onClick={() => user ? joinMutation.mutate() : window.location.href = "/api/login"}
                    disabled={!!user && joinMutation.isPending}
                    data-testid="button-join-event"
                  >
                    {user 
                      ? (joinMutation.isPending ? "Joining..." : "Join Event")
                      : "Log In to Join"}
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
                  {hasFullAccess(event) && event.hasJoined !== false && (
                    <div>
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="font-medium flex items-center gap-1" data-testid="text-participant-count">
                        <Users className="w-4 h-4" />
                        {event.participants.length} {event.participants.length === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {hasFullAccess(event) && event.hasJoined !== false && (
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
              )}
            </div>

            {hasFullAccess(event) && event.hasJoined !== false && (
              <>
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
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
