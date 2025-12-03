import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, LogOut, ArrowUpDown, Filter, Globe, Lock, Users, Sparkles, AlertCircle } from "lucide-react";
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
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import { useState, useMemo } from "react";

type EventFilter = "public" | "my-events";
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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Determine which events to display based on filter
  const displayEvents = eventFilter === "public" ? publicEvents : privateEvents;
  const isLoading = eventFilter === "public" ? isLoadingPublic : isLoadingPrivate;
  const error = eventFilter === "public" ? publicError : privateError;

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2">
              <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
              <span className="font-heading font-bold text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Myzymo</span>
            </div>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" data-testid="link-dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/events" data-testid="link-events">
                <Button variant="ghost">Events</Button>
              </Link>
              <Link href="/vendors" data-testid="link-vendors">
                <Button variant="ghost">Vendors</Button>
              </Link>
              <Link href="/profile" data-testid="link-profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" data-testid="text-user-name">
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
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/login">
                <Button variant="default" data-testid="button-login">
                  Log In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                Discover Events
              </h1>
              <p className="text-white/90 text-lg">
                {eventFilter === "public" 
                  ? "Browse exciting public celebrations and gatherings" 
                  : "Manage your personal events and celebrations"}
              </p>
            </div>
            {user && (
              <Button 
                onClick={() => setLocation("/events/create")} 
                data-testid="button-create-event"
                className="bg-white text-orange-600 hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-6 space-y-4">
          {user && (
            <Tabs value={eventFilter} onValueChange={(value) => setEventFilter(value as EventFilter)} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40" data-testid="tabs-event-filter">
                <TabsTrigger value="public" data-testid="tab-public-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  Public Events
                </TabsTrigger>
                <TabsTrigger value="my-events" data-testid="tab-my-events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                  <Lock className="w-4 h-4 mr-2" />
                  My Events
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="flex items-center gap-4">
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
            {sortedEvents && sortedEvents.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                <Users className="w-3 h-3 mr-1" />
                {sortedEvents.length} {sortedEvents.length === 1 ? 'Event' : 'Events'}
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
        ) : !error && sortedEvents && sortedEvents.length > 0 ? (
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
                <Calendar className="w-16 h-16 mx-auto text-orange-500 relative z-10" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {eventFilter === "public" ? "No public events found" : "No events yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {eventFilter === "public" 
                    ? "Check back later for exciting celebrations and gatherings!" 
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
