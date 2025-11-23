import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Event } from "@shared/schema";

export default function EventInvites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Filter to show only upcoming events (mock invites)
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 3);
  
  const respondToInvite = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to respond to invite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Response saved!",
        description: "Your RSVP has been recorded.",
      });
    },
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Invites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading invites...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (upcomingEvents.length === 0) {
    return (
      <Card data-testid="card-event-invites">
        <CardHeader>
          <CardTitle>Event Invites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pending invites</p>
          <Link href="/events">
            <Button variant="link" className="p-0 h-auto mt-2">
              Discover events
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card data-testid="card-event-invites">
      <CardHeader>
        <CardTitle>Event Invites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="border-b last:border-0 pb-3 last:pb-0" data-testid={`invite-${event.id}`}>
            <Link href={`/events/${event.id}`}>
              <h4 className="font-semibold hover:text-primary cursor-pointer mb-1" data-testid="text-event-title">
                {event.title}
              </h4>
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              <span>{event.location}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="default"
                onClick={() => respondToInvite.mutate({ eventId: event.id, status: "going" })}
                data-testid="button-accept-invite"
                className="flex-1"
              >
                <Check className="w-3 h-3 mr-1" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => respondToInvite.mutate({ eventId: event.id, status: "declined" })}
                data-testid="button-decline-invite"
                className="flex-1"
              >
                <X className="w-3 h-3 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
