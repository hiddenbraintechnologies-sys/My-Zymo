import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, LogOut, Share2, Link as LinkIcon, MessageCircle, Mail, Edit, Trash2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import { useToast } from "@/hooks/use-toast";
import DashboardChat from "@/components/DashboardChat";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [downloadingEventId, setDownloadingEventId] = useState<string | null>(null);
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest(`/api/events/${eventId}`, "DELETE");
    },
    onSuccess: async () => {
      // Invalidate and refetch events list
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
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

  const handleDeleteClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete.id);
    }
  };

  const handleEditClick = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocation(`/events/${eventId}/edit`);
  };

  const handleDownloadMembers = async (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingEventId(event.id);
    
    try {
      const response = await fetch(`/api/events/${event.id}/export-members`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to download member details' }));
        throw new Error(errorData.message || 'Failed to download member details');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${event.title.replace(/[^a-z0-9]/gi, '-')}-members-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download complete",
        description: "Event member details have been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download member details.",
        variant: "destructive",
      });
    } finally {
      setDownloadingEventId(null);
    }
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
                        <div className="flex gap-2 flex-wrap">
                          {event.creatorId === user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleDownloadMembers(event, e)}
                              disabled={downloadingEventId === event.id}
                              data-testid={`button-download-members-${event.id}`}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {downloadingEventId === event.id ? "Downloading..." : "Download Members"}
                            </Button>
                          )}
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
                          {event.creatorId === user?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleEditClick(event.id, e)}
                                data-testid={`button-edit-event-${event.id}`}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleDeleteClick(event, e)}
                                data-testid={`button-delete-event-${event.id}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </>
                          )}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-event">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
              All messages, expenses, and bookings associated with this event will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
