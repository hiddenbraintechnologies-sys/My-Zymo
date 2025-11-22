import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";
import { format } from "date-fns";

export default function Events() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
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
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-xl">Reunify</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/events" data-testid="link-events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/vendors" data-testid="link-vendors">
              <Button variant="ghost">Vendors</Button>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Manage your celebrations and gatherings</p>
          </div>
          <Button onClick={() => setLocation("/events/create")} data-testid="button-create-event">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="hover-elevate cursor-pointer"
                onClick={() => setLocation(`/events/${event.id}`)}
                data-testid={`card-event-${event.id}`}
              >
                {event.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-md">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle data-testid={`text-event-title-${event.id}`}>{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(event.date), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first event to start planning your celebration
              </p>
              <Button onClick={() => setLocation("/events/create")} data-testid="button-create-first-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
