import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Sparkles, PartyPopper, Users } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function PublicEventsShowcase() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/public-events"],
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show events if there are public events
  if (!events || events.length === 0) {
    return null;
  }

  // Show only the first 6 events
  const displayEvents = events.slice(0, 6);

  return (
    <section className="py-16 px-4 bg-muted/30" data-testid="section-public-events">
      <div className="max-w-7xl mx-auto">
        {/* Celebration Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8 md:p-12 mb-12 shadow-xl">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          
          {/* Floating decorative elements */}
          <div className="absolute top-4 right-8 opacity-20">
            <PartyPopper className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-15">
            <Sparkles className="w-20 h-20 text-white" />
          </div>
          
          <div className="relative text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Discover Celebrations Near You</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 drop-shadow-lg" data-testid="heading-public-events">
              Upcoming Public Events
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6">
              Join celebrations happening across India. Connect with communities and make memories together.
            </p>
            
            {/* Stats badges */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{events?.length || 0} Events</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Open to Everyone</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">All Over India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card 
                className="hover-elevate cursor-pointer h-full flex flex-col"
                data-testid={`card-public-event-${event.id}`}
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
                  <CardTitle className="line-clamp-2" data-testid={`text-event-title-${event.id}`}>
                    {event.title}
                  </CardTitle>
                  {event.description && (
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span data-testid={`text-event-date-${event.id}`}>
                        {format(new Date(event.date), 'PPP')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1" data-testid={`text-event-location-${event.id}`}>
                        {event.location}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" data-testid={`button-view-event-${event.id}`}>
                      View Event
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {events.length > 6 && (
          <div className="text-center">
            <Link href="/api/login">
              <Button size="lg" data-testid="button-view-all-events">
                View All Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
