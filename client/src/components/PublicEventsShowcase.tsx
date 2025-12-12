import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
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
      <section className="py-8 px-4 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-6">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
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
    <section className="py-8 px-4 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10" data-testid="section-public-events">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold" data-testid="heading-public-events">
              Upcoming Public Events
            </h2>
            <p className="text-sm text-muted-foreground">
              Join celebrations happening across India
            </p>
          </div>
          {events.length > 3 && (
            <Link href="/api/login">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-events">
                View All
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayEvents.slice(0, 3).map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card 
                className="hover-elevate cursor-pointer h-full"
                data-testid={`card-public-event-${event.id}`}
              >
                {event.imageUrl && (
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-t-md">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm line-clamp-1" data-testid={`text-event-title-${event.id}`}>
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span data-testid={`text-event-date-${event.id}`}>
                        {format(new Date(event.date), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1" data-testid={`text-event-location-${event.id}`}>
                        {event.location}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
