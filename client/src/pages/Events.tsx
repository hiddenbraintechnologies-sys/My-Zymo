import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, LogOut, ArrowUpDown, Filter, Globe, Lock, Users, Sparkles, AlertCircle, UsersRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event, EventGroup } from "@shared/schema";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";

type EventFilter = "public" | "my-events" | "group-events";
type SortOption = "date-asc" | "date-desc" | "title-asc" | "title-desc";

export default function Events() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [eventFilter, setEventFilter] = useState<EventFilter>("public");
  const [sortOption, setSortOption] = useState<SortOption>("date-asc");
  
  // Fetch public events (available for everyone)
  const { data: publicEvents, isLoading: isLoadingPublic, error: publicError } = useQuery<Event[]>({
    queryKey: ["/api/public-events"],
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Fetch user's private events (only if authenticated and viewing my-events tab)
  const { data: privateEvents, isLoading: isLoadingPrivate, error: privateError } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user && eventFilter === "my-events",
    retry: 2,
    staleTime: 30000,
  });

  // Fetch user's event groups (only if authenticated and viewing group-events tab)
  const { data: eventGroups, isLoading: isLoadingGroups, error: groupsError } = useQuery<EventGroup[]>({
    queryKey: ["/api/groups"],
    enabled: !!user && eventFilter === "group-events",
    retry: 2,
    staleTime: 30000,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Determine which events/groups to display based on filter
  const displayEvents = eventFilter === "public" ? publicEvents : eventFilter === "my-events" ? privateEvents : undefined;
  const isLoading = eventFilter === "public" ? isLoadingPublic : eventFilter === "my-events" ? isLoadingPrivate : isLoadingGroups;
  const error = eventFilter === "public" ? publicError : eventFilter === "my-events" ? privateError : groupsError;

  // Sort events based on selected option
  const sortedEvents = useMemo(() => {
    if (!displayEvents) return [];
    
    const sorted = [...displayEvents];
    
    switch (sortOption) {
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  }, [displayEvents, sortOption]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner - Hero Image Design */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          <div className="relative z-10 p-4 md:p-8 min-h-[120px] md:min-h-[140px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 w-full">
              <div>
                <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 flex items-center gap-2 text-white">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                  Discover Events
                </h1>
                <p className="text-white/80 text-sm md:text-lg">
                  {eventFilter === "public" 
                    ? "Browse exciting public celebrations and gatherings" 
                    : eventFilter === "my-events"
                    ? "Manage your personal events and celebrations"
                    : "View group events you're part of"}
                </p>
              </div>
              {user && (
                <Button 
                  onClick={() => setLocation("/events/create")} 
                  data-testid="button-create-event"
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 self-start md:self-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-6 space-y-4">
          {user && (
            <Tabs value={eventFilter} onValueChange={(value) => setEventFilter(value as EventFilter)} className="w-full">
              <TabsList className="grid w-full max-w-xl grid-cols-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40" data-testid="tabs-event-filter">
                <TabsTrigger value="public" data-testid="tab-public-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  Public
                </TabsTrigger>
                <TabsTrigger value="my-events" data-testid="tab-my-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Lock className="w-4 h-4 mr-2" />
                  My Events
                </TabsTrigger>
                <TabsTrigger value="group-events" data-testid="tab-group-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <UsersRound className="w-4 h-4 mr-2" />
                  Group Events
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="flex items-center gap-4">
            {eventFilter !== "group-events" && (
              <>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sort by:</span>
                </div>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="w-[200px]" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-asc">Date (Earliest First)</SelectItem>
                    <SelectItem value="date-desc">Date (Latest First)</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {eventFilter !== "group-events" && sortedEvents && sortedEvents.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                <Users className="w-3 h-3 mr-1" />
                {sortedEvents.length} {sortedEvents.length === 1 ? 'Event' : 'Events'}
              </Badge>
            )}
            {eventFilter === "group-events" && eventGroups && eventGroups.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                <UsersRound className="w-3 h-3 mr-1" />
                {eventGroups.length} {eventGroups.length === 1 ? 'Group' : 'Groups'}
              </Badge>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-12 border-2 border-destructive bg-destructive/10">
            <div className="text-center space-y-4 max-w-md mx-auto">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
              <div>
                <h3 className="font-semibold text-xl mb-2 text-destructive">
                  Failed to Load Events
                </h3>
                <p className="text-muted-foreground mb-4">
                  We encountered an error while loading the events. Please try again later.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  data-testid="button-reload"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Events Grid */}
        {!error && isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : !error && eventFilter === "group-events" && eventGroups && eventGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventGroups.map((group, index) => {
              const gradientColors = [
                'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800',
                'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800',
                'from-orange-100 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800',
                'from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800',
                'from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800',
              ];
              const gradientClass = gradientColors[index % gradientColors.length];
              
              return (
                <Card 
                  key={group.id} 
                  className={`hover-elevate cursor-pointer border-2 bg-gradient-to-br ${gradientClass} shadow-md hover:shadow-xl transition-all overflow-hidden`}
                  onClick={() => setLocation(`/groups/${group.id}`)}
                  data-testid={`card-group-${group.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="line-clamp-2" data-testid={`text-group-title-${group.id}`}>
                        {group.name}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shrink-0">
                        <UsersRound className="w-3 h-3 mr-1" />
                        Group
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {group.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-foreground">
                        {group.eventDate ? format(new Date(group.eventDate), "PPP") : "Date TBD"}
                      </span>
                    </div>
                    {group.locationCity && (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-foreground line-clamp-1">{group.locationCity}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {group.eventType || "Event"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : !error && eventFilter !== "group-events" && sortedEvents && sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event, index) => {
              const gradientColors = [
                'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800',
                'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800',
                'from-orange-100 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800',
                'from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800',
                'from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800',
              ];
              const gradientClass = gradientColors[index % gradientColors.length];
              
              return (
                <Card 
                  key={event.id} 
                  className={`hover-elevate cursor-pointer border-2 bg-gradient-to-br ${gradientClass} shadow-md hover:shadow-xl transition-all overflow-hidden`}
                  onClick={() => setLocation(`/events/${event.id}`)}
                  data-testid={`card-event-${event.id}`}
                >
                  {event.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="line-clamp-2" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                      {event.isPublic && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-foreground">{format(new Date(event.date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-foreground line-clamp-1">{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : !error ? (
          <Card className="p-12 border-2 border-dashed border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
            <div className="text-center space-y-4 max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-900/40 dark:to-amber-900/40 rounded-full blur-xl"></div>
                </div>
                {eventFilter === "group-events" ? (
                  <UsersRound className="w-16 h-16 mx-auto text-orange-500 relative z-10" />
                ) : (
                  <Calendar className="w-16 h-16 mx-auto text-orange-500 relative z-10" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {eventFilter === "public" 
                    ? "No public events found" 
                    : eventFilter === "group-events"
                    ? "No group events yet"
                    : "No events yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {eventFilter === "public" 
                    ? "Check back later for exciting celebrations and gatherings!" 
                    : eventFilter === "group-events"
                    ? "Join or create a group to start planning together"
                    : user 
                      ? "Create your first event to start planning your celebration" 
                      : "Log in to create your own events"}
                </p>
                {user && eventFilter === "my-events" && (
                  <Button 
                    onClick={() => setLocation("/events/create")} 
                    data-testid="button-create-first-event"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                )}
                {user && eventFilter === "group-events" && (
                  <Button 
                    onClick={() => setLocation("/groups")} 
                    data-testid="button-browse-groups"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <UsersRound className="w-4 h-4 mr-2" />
                    Create or Join Groups
                  </Button>
                )}
                {!user && (
                  <Button 
                    onClick={() => setLocation("/login")} 
                    data-testid="button-login-to-create"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                  >
                    Log In to Create Events
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
