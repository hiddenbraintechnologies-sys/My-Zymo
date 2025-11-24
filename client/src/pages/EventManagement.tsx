import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calendar, MapPin, Users, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

export default function EventManagement() {
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/admin/events'],
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) =>
      apiRequest(`/api/admin/events/${eventId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Event deleted",
        description: "Event has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" data-testid="button-back-admin">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all platform events
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            {events?.length ?? 0} total events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events?.map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-4 border rounded-lg"
                data-testid={`event-item-${event.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-2" data-testid={`text-title-${event.id}`}>
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-description-${event.id}`}>
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span data-testid={`text-date-${event.id}`}>
                        {format(new Date(event.date), 'PPP')}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span data-testid={`text-location-${event.id}`}>{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Created {format(new Date(event.createdAt), 'PP')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge variant="outline">Event ID: {event.id.slice(0, 8)}...</Badge>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" data-testid={`button-delete-${event.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{event.title}"? This action cannot be undone and will delete all associated data including messages, expenses, and bookings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteEventMutation.mutate(event.id)}
                        data-testid="button-confirm-delete"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}

            {events?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No events found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
