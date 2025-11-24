import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, LogOut, Share2, Link as LinkIcon, MessageCircle, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import { useToast } from "@/hooks/use-toast";
import DashboardChat from "@/components/DashboardChat";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleCopyLink = (eventId: string) => {
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    toast({
      title: "Link copied!",
      description: "Event link has been copied to clipboard.",
    });
  };

  const handleWhatsAppShare = (event: Event) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const message = `Join me for ${event.title}!\n\n${event.description}\n\nDate: ${format(new Date(event.date), 'PPP')}\nLocation: ${event.location}\n\nView details: ${eventUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[Dashboard] User not authenticated, redirecting to login');
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
            <Link href="/dashboard" data-testid="link-dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground">Create and share your celebrations with friends and family</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/events/create")} data-testid="card-quick-action-create">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Create Event
              </CardTitle>
              <CardDescription>
                Plan a new celebration or gathering
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/events")} data-testid="card-quick-action-events">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                My Events
              </CardTitle>
              <CardDescription>
                View and manage all your events
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/vendors")} data-testid="card-quick-action-vendors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Find Vendors
              </CardTitle>
              <CardDescription>
                Discover venues, caterers, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold mb-4">Your Recent Events</h2>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="hover-elevate"
                    data-testid={`card-event-${event.id}`}
                  >
                    <div className="flex gap-4">
                      {event.imageUrl && (
                        <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-l-md">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <CardTitle 
                          className="cursor-pointer mb-2"
                          onClick={() => setLocation(`/events/${event.id}`)}
                          data-testid={`text-event-title-${event.id}`}
                        >
                          {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mb-3">
                          {event.description}
                        </CardDescription>
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            {format(new Date(event.date), 'PPP')}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsAppShare(event)}
                            data-testid={`button-whatsapp-share-${event.id}`}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(event.id)}
                            data-testid={`button-copy-link-${event.id}`}
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first celebration and start sharing with friends!
                    </p>
                    <Button onClick={() => setLocation("/events/create")} data-testid="button-create-first-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Chat Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold mb-4">Chat with Participants</h2>
            </div>
            <DashboardChat />
          </div>
        </div>
      </main>
    </div>
  );
}
