import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calendar, MapPin, Users, ChevronLeft, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner - Warm Cream Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-6 shadow-sm">
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="button-back-admin" className="hover:bg-orange-100 dark:hover:bg-orange-900/30">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3 text-foreground">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  Event Management
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  View and manage all platform events
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-3 min-w-[80px] shadow-sm">
                <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{events?.length ?? 0}</div>
                <div className="text-xs text-orange-600/80 dark:text-orange-400/80">Events</div>
              </div>
            </div>
          </div>
        </div>

      <Card className="border border-orange-100 dark:border-orange-900/30">
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
    </div>
  );
}
