import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Share2, Link as LinkIcon, MessageCircle, MessageSquare, Mail, Edit, Trash2, Download, UserPlus, UserMinus, Sparkles, Users, TrendingUp, IndianRupee, Vote, Lock, Globe, ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import QuoteDialog from "@/components/QuoteDialog";
import FloatingChat from "@/components/FloatingChat";

type EventFilter = "private" | "public";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [downloadingEventId, setDownloadingEventId] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<EventFilter>("private");
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const { data: privateEvents, isLoading: isLoadingPrivate } = useQuery<Event[]>({
    queryKey: ["/api/events/private"],
    enabled: !!user && eventFilter === "private",
  });

  const { data: followedPublicEvents, isLoading: isLoadingFollowed } = useQuery<Event[]>({
    queryKey: ["/api/events/followed"],
    enabled: !!user && eventFilter === "public",
  });

  const events = eventFilter === "private" ? privateEvents : followedPublicEvents;
  const isLoading = eventFilter === "private" ? isLoadingPrivate : isLoadingFollowed;

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest(`/api/events/${eventId}`, "DELETE");
    },
    onSuccess: async () => {
      // Invalidate all event queries
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/events/private"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/events/followed"] });
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Welcome Banner - Hero Image Design */}
        <div className="mb-8 relative overflow-hidden rounded-2xl h-48 md:h-56 shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          <div className="relative z-10 h-full flex flex-col justify-center p-8">
            <div className="flex items-center justify-between flex-wrap gap-4 w-full">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 flex items-center gap-3 text-white">
                  <Sparkles className="w-7 h-7" />
                  Welcome {user.firstName}
                </h1>
                <p className="text-white/80 text-base md:text-lg">Create and share your celebrations with friends and family</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 min-w-[90px]">
                  <div className="text-2xl md:text-3xl font-bold text-white">{privateEvents?.length || 0}</div>
                  <div className="text-xs md:text-sm text-white/80">My Events</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 min-w-[90px]">
                  <div className="text-2xl md:text-3xl font-bold text-white">{followedPublicEvents?.length || 0}</div>
                  <div className="text-xs md:text-sm text-white/80">Followed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards - Vibrant and Colorful */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <Card 
            className="hover-elevate cursor-pointer border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 dark:from-orange-950/20 dark:to-amber-950/20 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setCreateEventDialogOpen(true)} 
            data-testid="card-quick-action-create"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl shadow-md">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-orange-400 text-white">New</Badge>
              </div>
              <CardTitle className="text-xl font-bold text-orange-700 dark:text-orange-100">
                Create Event
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Plan a new celebration or gathering
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 dark:from-amber-950/20 dark:to-orange-950/20 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setLocation("/events")} 
            data-testid="card-quick-action-events"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-amber-400 text-amber-800">{privateEvents?.length || 0}</Badge>
              </div>
              <CardTitle className="text-xl font-bold text-amber-700 dark:text-amber-100">
                My Events
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-300">
                View and manage all your events
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-100 via-amber-100 to-orange-200 dark:from-orange-950/20 dark:to-amber-950/20 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setLocation("/vendors")} 
            data-testid="card-quick-action-vendors"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl shadow-md">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-orange-300 text-amber-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Explore
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-orange-700 dark:text-orange-100">
                Find Vendors
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-300">
                Discover venues, caterers, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setQuoteDialogOpen(true)} 
            data-testid="card-quick-action-quote"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-md">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-emerald-400 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-emerald-700 dark:text-emerald-100">
                Get Free Quote
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-300">
                AI-powered instant cost estimate
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setShowChat(true)} 
            data-testid="card-quick-action-chat"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl shadow-md">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-blue-400 text-white">Chat</Badge>
              </div>
              <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-100">
                Event Chats
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                Chat with event participants
              </CardDescription>
            </CardHeader>
          </Card>

        </div>

        {/* Events Section */}
        <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Your Events
                </h2>
              </div>
              <Tabs value={eventFilter} onValueChange={(value) => setEventFilter(value as EventFilter)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40" data-testid="tabs-event-filter">
                  <TabsTrigger value="private" data-testid="tab-private-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-300 data-[state=active]:to-amber-300 data-[state=active]:text-white">
                    My Events
                  </TabsTrigger>
                  <TabsTrigger value="public" data-testid="tab-public-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-300 data-[state=active]:to-amber-300 data-[state=active]:text-white">
                    Followed Public Events
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event, index) => {
                  const gradientColors = [
                    'from-orange-100 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800',
                    'from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800',
                    'from-orange-50 to-amber-200 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800',
                    'from-amber-50 to-orange-200 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800',
                    'from-orange-100 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800',
                  ];
                  const gradientClass = gradientColors[index % gradientColors.length];
                  
                  return (
                    <Card 
                      key={event.id} 
                      className={`hover-elevate border-2 bg-gradient-to-br ${gradientClass} shadow-md hover:shadow-xl transition-all`}
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
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle 
                              className="cursor-pointer flex-1"
                              onClick={() => setLocation(`/events/${event.id}`)}
                              data-testid={`text-event-title-${event.id}`}
                            >
                              {event.title}
                            </CardTitle>
                            {event.isPublic && (
                              <Badge className="ml-2 bg-gradient-to-r from-orange-300 to-amber-300 text-white">Public</Badge>
                            )}
                          </div>
                          <CardDescription className="line-clamp-2 mb-3">
                            {event.description}
                          </CardDescription>
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-sm font-medium">
                              <Calendar className="w-4 h-4 mr-2 text-orange-400 dark:text-orange-300" />
                              <span className="text-foreground">{format(new Date(event.date), 'PPP')}</span>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                              <MapPin className="w-4 h-4 mr-2 text-orange-400 dark:text-orange-300" />
                              <span className="text-foreground">{event.location}</span>
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
                            Invite Link
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
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 border-2 border-dashed border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-900/40 dark:to-amber-900/40 rounded-full blur-xl"></div>
                    </div>
                    <Calendar className="w-16 h-16 mx-auto text-orange-400 relative z-10" />
                  </div>
                  <div>
                    {eventFilter === "private" ? (
                      <>
                        <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                          No events yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first celebration and start sharing with friends!
                        </p>
                        <Button 
                          onClick={() => setCreateEventDialogOpen(true)} 
                          data-testid="button-create-first-event"
                          className="bg-gradient-to-r from-orange-300 to-amber-300 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Event
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                          No followed events yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Browse and follow public events to see them here
                        </p>
                        <Button 
                          onClick={() => setLocation("/events")} 
                          data-testid="button-browse-events"
                          className="bg-gradient-to-r from-orange-300 to-amber-300 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Browse Events
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
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

      <QuoteDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />

      <Dialog open={createEventDialogOpen} onOpenChange={setCreateEventDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-create-event-type">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-center bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Choose Event Type
            </DialogTitle>
            <DialogDescription className="text-center">
              Select the type of event you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card 
              className="hover-elevate cursor-pointer border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"
              onClick={() => {
                setCreateEventDialogOpen(false);
                setLocation("/events/create?type=private");
              }}
              data-testid="option-private-event"
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl shadow-md">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-orange-700 dark:text-orange-100">Private Event</CardTitle>
                  <CardDescription className="text-orange-600 dark:text-orange-300">
                    Invite-only celebration for friends & family
                  </CardDescription>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-400" />
              </CardHeader>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
              onClick={() => {
                setCreateEventDialogOpen(false);
                setLocation("/events/create?type=public");
              }}
              data-testid="option-public-event"
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl shadow-md">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-amber-700 dark:text-amber-100">Public Event</CardTitle>
                  <CardDescription className="text-amber-600 dark:text-amber-300">
                    Open event visible to everyone on the platform
                  </CardDescription>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400" />
              </CardHeader>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30"
              onClick={() => {
                setCreateEventDialogOpen(false);
                setLocation("/groups");
              }}
              data-testid="option-group-planning"
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-violet-400 rounded-xl shadow-md">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-purple-700 dark:text-purple-100">Group Planning</CardTitle>
                  <CardDescription className="text-purple-600 dark:text-purple-300">
                    Collaborate with polls, itinerary & expense tracking
                  </CardDescription>
                </div>
                <Badge className="bg-purple-400 text-white mr-2">
                  <Users className="w-3 h-3 mr-1" />
                  Team
                </Badge>
                <ArrowRight className="w-5 h-5 text-purple-400" />
              </CardHeader>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Chat - Only shown on Dashboard */}
      {showChat && <FloatingChat />}
    </div>
  );
}
