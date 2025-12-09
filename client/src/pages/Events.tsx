import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, LogOut, ArrowUpDown, Filter, Globe, Lock, Users, Sparkles, AlertCircle, UsersRound, PartyPopper, Heart, Star, Gift, Vote, ArrowRight, GraduationCap, Cake, Bike, Dumbbell, Gem, Mountain, Trophy, Music, Home, Baby } from "lucide-react";
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
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import reunionBg from "@assets/stock_images/college_reunion_grad_32cdfc94.jpg";
import birthdayBg from "@assets/stock_images/birthday_party_celeb_2a4d00f8.jpg";
import groupRideBg from "@assets/stock_images/group_bike_ride_cycl_9f3949fe.jpg";
import fitnessBg from "@assets/stock_images/fitness_yoga_gym_wor_0a78b5ea.jpg";
import weddingBg from "@assets/stock_images/wedding_ceremony_cel_3d2131c8.jpg";
import trekBg from "@assets/stock_images/hiking_trek_mountain_b500039b.jpg";
import sportsBg from "@assets/stock_images/sports_team_cricket__e396c7f4.jpg";
import musicBg from "@assets/stock_images/music_concert_live_p_6d56ef3e.jpg";
import familyBg from "@assets/stock_images/family_gathering_cel_69f4e3bd.jpg";
import babyShowerBg from "@assets/stock_images/baby_shower_celebrat_f32cb2d3.jpg";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EventFilter = "public" | "my-events" | "group-events";
type SortOption = "date-asc" | "date-desc" | "title-asc" | "title-desc";

const EVENT_TYPE_COLORS: Record<string, { gradient: string; border: string; badge: string; text: string; icon: string }> = {
  college_reunion: { gradient: "from-purple-900/90 via-purple-900/60 to-purple-900/30", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-400/80", text: "text-purple-200", icon: "from-purple-400 to-violet-500" },
  school_reunion: { gradient: "from-purple-900/90 via-purple-900/60 to-purple-900/30", border: "border-purple-200 dark:border-purple-800", badge: "bg-purple-400/80", text: "text-purple-200", icon: "from-purple-400 to-violet-500" },
  birthday_party: { gradient: "from-pink-900/90 via-pink-900/60 to-pink-900/30", border: "border-pink-200 dark:border-pink-800", badge: "bg-pink-400/80", text: "text-pink-200", icon: "from-pink-400 to-rose-500" },
  wedding: { gradient: "from-amber-900/90 via-amber-900/60 to-amber-900/30", border: "border-amber-200 dark:border-amber-800", badge: "bg-amber-400/80", text: "text-amber-200", icon: "from-amber-400 to-orange-500" },
  group_ride: { gradient: "from-blue-900/90 via-blue-900/60 to-blue-900/30", border: "border-blue-200 dark:border-blue-800", badge: "bg-blue-400/80", text: "text-blue-200", icon: "from-blue-400 to-cyan-500" },
  fitness_bootcamp: { gradient: "from-emerald-900/90 via-emerald-900/60 to-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-400/80", text: "text-emerald-200", icon: "from-emerald-400 to-green-500" },
  yoga_session: { gradient: "from-emerald-900/90 via-emerald-900/60 to-emerald-900/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-400/80", text: "text-emerald-200", icon: "from-emerald-400 to-green-500" },
  trekking: { gradient: "from-teal-900/90 via-teal-900/60 to-teal-900/30", border: "border-teal-200 dark:border-teal-800", badge: "bg-teal-400/80", text: "text-teal-200", icon: "from-teal-400 to-cyan-500" },
  sports_event: { gradient: "from-red-900/90 via-red-900/60 to-red-900/30", border: "border-red-200 dark:border-red-800", badge: "bg-red-400/80", text: "text-red-200", icon: "from-red-400 to-orange-500" },
  music_event: { gradient: "from-indigo-900/90 via-indigo-900/60 to-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800", badge: "bg-indigo-400/80", text: "text-indigo-200", icon: "from-indigo-400 to-violet-500" },
  family_gathering: { gradient: "from-orange-900/90 via-orange-900/60 to-orange-900/30", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-400/80", text: "text-orange-200", icon: "from-orange-400 to-amber-500" },
  baby_shower: { gradient: "from-rose-900/90 via-rose-900/60 to-rose-900/30", border: "border-rose-200 dark:border-rose-800", badge: "bg-rose-400/80", text: "text-rose-200", icon: "from-rose-400 to-pink-500" },
  default: { gradient: "from-orange-900/90 via-orange-900/60 to-orange-900/30", border: "border-orange-200 dark:border-orange-800", badge: "bg-orange-400/80", text: "text-orange-200", icon: "from-orange-400 to-amber-500" },
};

const EVENT_TYPE_BACKGROUNDS: Record<string, string> = {
  college_reunion: reunionBg,
  school_reunion: reunionBg,
  birthday_party: birthdayBg,
  wedding: weddingBg,
  group_ride: groupRideBg,
  fitness_bootcamp: fitnessBg,
  yoga_session: fitnessBg,
  trekking: trekBg,
  sports_event: sportsBg,
  music_event: musicBg,
  family_gathering: familyBg,
  baby_shower: babyShowerBg,
};

const EVENT_TYPE_ICONS: Record<string, typeof Calendar> = {
  college_reunion: GraduationCap,
  school_reunion: GraduationCap,
  birthday_party: Cake,
  wedding: Gem,
  group_ride: Bike,
  fitness_bootcamp: Dumbbell,
  yoga_session: Dumbbell,
  trekking: Mountain,
  sports_event: Trophy,
  music_event: Music,
  family_gathering: Home,
  baby_shower: Baby,
};

export default function Events() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [eventFilter, setEventFilter] = useState<EventFilter>("public");
  const [sortOption, setSortOption] = useState<SortOption>("date-asc");
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  
  const { data: publicEvents, isLoading: isLoadingPublic, error: publicError } = useQuery<Event[]>({
    queryKey: ["/api/public-events"],
    retry: 2,
    staleTime: 30000,
  });

  const { data: privateEvents, isLoading: isLoadingPrivate, error: privateError } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user && eventFilter === "my-events",
    retry: 2,
    staleTime: 30000,
  });

  const { data: eventGroups, isLoading: isLoadingGroups, error: groupsError } = useQuery<EventGroup[]>({
    queryKey: ["/api/groups"],
    enabled: !!user && eventFilter === "group-events",
    retry: 2,
    staleTime: 30000,
  });

  const displayEvents = eventFilter === "public" ? publicEvents : eventFilter === "my-events" ? privateEvents : undefined;
  const isLoading = eventFilter === "public" ? isLoadingPublic : eventFilter === "my-events" ? isLoadingPrivate : isLoadingGroups;
  const error = eventFilter === "public" ? publicError : eventFilter === "my-events" ? privateError : groupsError;

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

  const getEventColors = (eventType: string | undefined) => {
    return EVENT_TYPE_COLORS[eventType || 'default'] || EVENT_TYPE_COLORS.default;
  };

  const getEventBackground = (eventType: string | undefined) => {
    return EVENT_TYPE_BACKGROUNDS[eventType || ''] || heroImage;
  };

  const getEventIcon = (eventType: string | undefined) => {
    return EVENT_TYPE_ICONS[eventType || ''] || Calendar;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner - Enhanced Design with Floating Icons */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          
          {/* Floating Decorative Icons */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
            <div className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-8 right-4 md:top-4 md:right-[200px] z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-pink-500/30 to-rose-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <PartyPopper className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-16 left-8 md:bottom-4 md:left-[120px] z-10 hidden md:block">
            <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
              <Gift className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 p-4 md:p-8 min-h-[140px] md:min-h-[180px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 w-full">
              <div>
                <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/40 to-orange-500/40 backdrop-blur-sm border border-amber-300/50 text-xs font-medium text-white">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  Events
                </div>
                <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 text-white">
                  Discover Events
                </h1>
                <p className="text-white/80 text-sm md:text-lg mb-3">
                  {eventFilter === "public" 
                    ? "Browse exciting public celebrations and gatherings" 
                    : eventFilter === "my-events"
                    ? "Manage your personal events and celebrations"
                    : "View group events you're part of"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Globe className="w-3.5 h-3.5 text-teal-300" />
                    <span className="text-xs text-white">Public</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Lock className="w-3.5 h-3.5 text-orange-300" />
                    <span className="text-xs text-white">Private</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Users className="w-3.5 h-3.5 text-purple-300" />
                    <span className="text-xs text-white">Groups</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
                <div className="text-center bg-gradient-to-br from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{publicEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </div>
                </div>
                {user && (
                  <>
                    <div className="text-center bg-gradient-to-br from-purple-500/30 to-violet-500/30 backdrop-blur-sm border border-purple-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                      <div className="text-xl md:text-3xl font-bold text-white">{privateEvents?.length || 0}</div>
                      <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur-sm border border-teal-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                      <div className="text-xl md:text-3xl font-bold text-white">{eventGroups?.length || 0}</div>
                      <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                        <UsersRound className="w-3 h-3" />
                        Groups
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        {user && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 border-2 border-orange-200 dark:border-orange-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setCreateEventDialogOpen(true)} 
              data-testid="card-quick-create-event"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl shadow-md">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">Create</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-orange-700 dark:text-orange-100">Create Event</CardTitle>
                <CardDescription className="text-sm text-orange-600/80 dark:text-orange-200/80">
                  Start planning your next celebration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setEventFilter("my-events")} 
              data-testid="card-quick-my-events"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs">Personal</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-100">My Events</CardTitle>
                <CardDescription className="text-sm text-purple-600/80 dark:text-purple-200/80">
                  Manage your personal celebrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-teal-950/30 border-2 border-teal-200 dark:border-teal-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/groups")} 
              data-testid="card-quick-groups"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl shadow-md">
                    <UsersRound className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs">Collaborate</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-teal-700 dark:text-teal-100">Group Planning</CardTitle>
                <CardDescription className="text-sm text-teal-600/80 dark:text-teal-200/80">
                  Plan events together with friends
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

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

          <div className="flex items-center gap-4 flex-wrap">
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

        {/* Events Grid - Enhanced Cards with Background Images */}
        {!error && isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : !error && eventFilter === "group-events" && eventGroups && eventGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventGroups.map((group) => {
              const colors = getEventColors(group.eventType);
              const bgImage = getEventBackground(group.eventType);
              const IconComponent = getEventIcon(group.eventType);
              
              return (
                <Card 
                  key={group.id} 
                  className={`hover-elevate cursor-pointer border-2 ${colors.border} shadow-md hover:shadow-xl transition-all overflow-hidden relative group`}
                  onClick={() => setLocation(`/groups/${group.id}`)}
                  data-testid={`card-group-${group.id}`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`} />
                  
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`p-2.5 bg-gradient-to-br ${colors.icon} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <Badge className={`${colors.badge} text-white shrink-0`}>
                        <UsersRound className="w-3 h-3 mr-1" />
                        Group
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-white line-clamp-2" data-testid={`text-group-title-${group.id}`}>
                      {group.name}
                    </CardTitle>
                    <CardDescription className={`${colors.text} line-clamp-2`}>
                      {group.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0 relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {group.eventDate ? format(new Date(group.eventDate), "PPP") : "Date TBD"}
                      </span>
                    </div>
                    {group.locationCity && (
                      <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{group.locationCity}</span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 relative z-10">
                    <Badge variant="outline" className="text-xs text-white border-white/40">
                      {group.eventType?.replace(/_/g, ' ') || "Event"}
                    </Badge>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : !error && eventFilter !== "group-events" && sortedEvents && sortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => {
              const eventType = (event as { eventType?: string }).eventType;
              const colors = getEventColors(eventType);
              const bgImage = event.imageUrl || getEventBackground(eventType);
              const IconComponent = getEventIcon(eventType);
              
              return (
                <Card 
                  key={event.id} 
                  className={`hover-elevate cursor-pointer border-2 ${colors.border} shadow-md hover:shadow-xl transition-all overflow-hidden relative group`}
                  onClick={() => setLocation(`/events/${event.id}`)}
                  data-testid={`card-event-${event.id}`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`} />
                  
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`p-2.5 bg-gradient-to-br ${colors.icon} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      {event.isPublic ? (
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge className={`${colors.badge} text-white shrink-0`}>
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-white line-clamp-2" data-testid={`text-event-title-${event.id}`}>
                      {event.title}
                    </CardTitle>
                    <CardDescription className={`${colors.text} line-clamp-2`}>
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0 relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 relative z-10 flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs text-white border-white/40">
                      {eventType?.replace(/_/g, ' ') || "Event"}
                    </Badge>
                    <Button 
                      size="sm" 
                      className={`bg-gradient-to-r ${colors.icon} text-white border-0`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/events/${event.id}`);
                      }}
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </CardFooter>
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
                    onClick={() => setCreateEventDialogOpen(true)} 
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

      {/* Create Event Type Dialog */}
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
    </div>
  );
}
