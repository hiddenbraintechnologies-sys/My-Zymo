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
    <section className="py-20 px-4 bg-muted/30" data-testid="section-public-events">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold mb-4" data-testid="heading-public-events">
            Upcoming Public Events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join celebrations happening across India. Connect with communities and make memories together.
          </p>
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
