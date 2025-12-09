import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, ArrowUpDown, Globe, Lock, Users, Sparkles, AlertCircle, UsersRound, PartyPopper, Heart, Star, Gift, Vote, ArrowRight, GraduationCap, Cake, Bike, Dumbbell, Gem, Mountain, Trophy, Music, Home, Baby } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import type { LucideIcon } from "lucide-react";

type EventFilter = "public" | "my-events" | "group-events";
type SortOption = "date-asc" | "date-desc" | "title-asc" | "title-desc";

interface EventTypeConfig {
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
  createPath: string;
  joinPath: string;
  createLabel: string;
  createDescription: string;
  colors: {
    gradient: string;
    border: string;
    text: string;
    textMuted: string;
    button: string;
    buttonHover: string;
  };
}

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
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventTypeConfig | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  
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

  const openEventDialog = (config: EventTypeConfig) => {
    setSelectedEventType(config);
    setInviteCode("");
    setEventDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner */}
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
                  Browse and create exciting celebrations and gatherings
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

        {/* What are you planning? - Interactive Event Type Selection */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-xl md:text-2xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">What are you planning?</h2>
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Choose Event Type
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {/* Reunions */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "reunion",
                  title: "Reunions",
                  description: "Create a new reunion or join an existing one",
                  icon: GraduationCap,
                  createPath: "/groups?type=reunion",
                  joinPath: "/groups/join/",
                  createLabel: "Create New Reunion",
                  createDescription: "Start planning a school, college, or family reunion",
                  colors: {
                    gradient: "from-purple-400 to-violet-500",
                    border: "border-purple-200 dark:border-purple-800",
                    text: "text-purple-700 dark:text-purple-100",
                    textMuted: "text-purple-600 dark:text-purple-300",
                    button: "from-purple-500 to-violet-500",
                    buttonHover: "from-purple-600 to-violet-600"
                  }
                })}
                data-testid="card-event-type-reunion"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${reunionBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/60 to-purple-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Reunions</CardTitle>
                  <CardDescription className="text-xs text-purple-200 hidden sm:block">School, college & family</CardDescription>
                  <Badge className="mt-2 bg-purple-400/80 text-white text-[10px]"><UsersRound className="w-2.5 h-2.5 mr-1" />Group</Badge>
                </CardHeader>
              </Card>

              {/* Birthday Parties */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-pink-200 dark:border-pink-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "birthday",
                  title: "Birthday Party",
                  description: "Create a new birthday event or join an existing one",
                  icon: Cake,
                  createPath: "/events/create?type=private&category=birthday",
                  joinPath: "/events/join/",
                  createLabel: "Create Birthday Event",
                  createDescription: "Plan a memorable birthday celebration",
                  colors: {
                    gradient: "from-pink-400 to-rose-500",
                    border: "border-pink-200 dark:border-pink-800",
                    text: "text-pink-700 dark:text-pink-100",
                    textMuted: "text-pink-600 dark:text-pink-300",
                    button: "from-pink-500 to-rose-500",
                    buttonHover: "from-pink-600 to-rose-600"
                  }
                })}
                data-testid="card-event-type-birthday"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${birthdayBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/90 via-pink-900/60 to-pink-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Cake className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Birthday Party</CardTitle>
                  <CardDescription className="text-xs text-pink-200 hidden sm:block">Celebrate in style</CardDescription>
                  <Badge className="mt-2 bg-pink-400/80 text-white text-[10px]"><PartyPopper className="w-2.5 h-2.5 mr-1" />Party</Badge>
                </CardHeader>
              </Card>

              {/* Group Rides */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "group_ride",
                  title: "Group Rides",
                  description: "Create a new ride or join an existing one",
                  icon: Bike,
                  createPath: "/groups?type=group_ride",
                  joinPath: "/groups/join/",
                  createLabel: "Create Group Ride",
                  createDescription: "Plan a bike trip or adventure with friends",
                  colors: {
                    gradient: "from-blue-400 to-cyan-500",
                    border: "border-blue-200 dark:border-blue-800",
                    text: "text-blue-700 dark:text-blue-100",
                    textMuted: "text-blue-600 dark:text-blue-300",
                    button: "from-blue-500 to-cyan-500",
                    buttonHover: "from-blue-600 to-cyan-600"
                  }
                })}
                data-testid="card-event-type-group-ride"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${groupRideBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/60 to-blue-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Group Rides</CardTitle>
                  <CardDescription className="text-xs text-blue-200 hidden sm:block">Bike trips & adventures</CardDescription>
                  <Badge className="mt-2 bg-blue-400/80 text-white text-[10px]"><UsersRound className="w-2.5 h-2.5 mr-1" />Group</Badge>
                </CardHeader>
              </Card>

              {/* Fitness */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "fitness",
                  title: "Fitness",
                  description: "Create a new fitness activity or join an existing one",
                  icon: Dumbbell,
                  createPath: "/groups?type=fitness",
                  joinPath: "/groups/join/",
                  createLabel: "Create Fitness Activity",
                  createDescription: "Plan yoga, gym sessions, or sports activities",
                  colors: {
                    gradient: "from-emerald-400 to-green-500",
                    border: "border-emerald-200 dark:border-emerald-800",
                    text: "text-emerald-700 dark:text-emerald-100",
                    textMuted: "text-emerald-600 dark:text-emerald-300",
                    button: "from-emerald-500 to-green-500",
                    buttonHover: "from-emerald-600 to-green-600"
                  }
                })}
                data-testid="card-event-type-fitness"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${fitnessBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/60 to-emerald-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Fitness</CardTitle>
                  <CardDescription className="text-xs text-emerald-200 hidden sm:block">Yoga, gym & sports</CardDescription>
                  <Badge className="mt-2 bg-emerald-400/80 text-white text-[10px]"><UsersRound className="w-2.5 h-2.5 mr-1" />Group</Badge>
                </CardHeader>
              </Card>

              {/* Weddings */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "wedding",
                  title: "Wedding",
                  description: "Create a new wedding event or join an existing one",
                  icon: Gem,
                  createPath: "/events/create?type=private&category=wedding",
                  joinPath: "/events/join/",
                  createLabel: "Create Wedding Event",
                  createDescription: "Plan your special day celebration",
                  colors: {
                    gradient: "from-amber-400 to-orange-500",
                    border: "border-amber-200 dark:border-amber-800",
                    text: "text-amber-700 dark:text-amber-100",
                    textMuted: "text-amber-600 dark:text-amber-300",
                    button: "from-amber-500 to-orange-500",
                    buttonHover: "from-amber-600 to-orange-600"
                  }
                })}
                data-testid="card-event-type-wedding"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${weddingBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-900/60 to-amber-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Gem className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Wedding</CardTitle>
                  <CardDescription className="text-xs text-amber-200 hidden sm:block">Your special day</CardDescription>
                  <Badge className="mt-2 bg-amber-400/80 text-white text-[10px]"><Heart className="w-2.5 h-2.5 mr-1" />Private</Badge>
                </CardHeader>
              </Card>

              {/* Treks */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-teal-200 dark:border-teal-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "trek",
                  title: "Treks",
                  description: "Create a new trek or join an existing one",
                  icon: Mountain,
                  createPath: "/groups?type=trek",
                  joinPath: "/groups/join/",
                  createLabel: "Create Trek",
                  createDescription: "Plan a hiking or adventure trip",
                  colors: {
                    gradient: "from-teal-400 to-cyan-500",
                    border: "border-teal-200 dark:border-teal-800",
                    text: "text-teal-700 dark:text-teal-100",
                    textMuted: "text-teal-600 dark:text-teal-300",
                    button: "from-teal-500 to-cyan-500",
                    buttonHover: "from-teal-600 to-cyan-600"
                  }
                })}
                data-testid="card-event-type-trek"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${trekBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-900/60 to-teal-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Mountain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Treks</CardTitle>
                  <CardDescription className="text-xs text-teal-200 hidden sm:block">Hiking & adventures</CardDescription>
                  <Badge className="mt-2 bg-teal-400/80 text-white text-[10px]"><UsersRound className="w-2.5 h-2.5 mr-1" />Group</Badge>
                </CardHeader>
              </Card>

              {/* Sports */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-red-200 dark:border-red-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "sports",
                  title: "Sports",
                  description: "Create a new sports event or join an existing one",
                  icon: Trophy,
                  createPath: "/groups?type=sports",
                  joinPath: "/groups/join/",
                  createLabel: "Create Sports Event",
                  createDescription: "Plan matches, tournaments, or team sports",
                  colors: {
                    gradient: "from-red-400 to-orange-500",
                    border: "border-red-200 dark:border-red-800",
                    text: "text-red-700 dark:text-red-100",
                    textMuted: "text-red-600 dark:text-red-300",
                    button: "from-red-500 to-orange-500",
                    buttonHover: "from-red-600 to-orange-600"
                  }
                })}
                data-testid="card-event-type-sports"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sportsBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/60 to-red-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Sports</CardTitle>
                  <CardDescription className="text-xs text-red-200 hidden sm:block">Matches & tournaments</CardDescription>
                  <Badge className="mt-2 bg-red-400/80 text-white text-[10px]"><UsersRound className="w-2.5 h-2.5 mr-1" />Group</Badge>
                </CardHeader>
              </Card>

              {/* Music */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-violet-200 dark:border-violet-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "music",
                  title: "Music",
                  description: "Create a new music event or join an existing one",
                  icon: Music,
                  createPath: "/events/create?type=public&category=music",
                  joinPath: "/events/join/",
                  createLabel: "Create Music Event",
                  createDescription: "Plan a concert, show, or music gathering",
                  colors: {
                    gradient: "from-violet-400 to-purple-500",
                    border: "border-violet-200 dark:border-violet-800",
                    text: "text-violet-700 dark:text-violet-100",
                    textMuted: "text-violet-600 dark:text-violet-300",
                    button: "from-violet-500 to-purple-500",
                    buttonHover: "from-violet-600 to-purple-600"
                  }
                })}
                data-testid="card-event-type-music"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${musicBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 via-violet-900/60 to-violet-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Music</CardTitle>
                  <CardDescription className="text-xs text-violet-200 hidden sm:block">Concerts & shows</CardDescription>
                  <Badge className="mt-2 bg-violet-400/80 text-white text-[10px]"><Globe className="w-2.5 h-2.5 mr-1" />Public</Badge>
                </CardHeader>
              </Card>

              {/* Family */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-sky-200 dark:border-sky-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "family",
                  title: "Family",
                  description: "Create a new family event or join an existing one",
                  icon: Home,
                  createPath: "/events/create?type=private&category=family",
                  joinPath: "/events/join/",
                  createLabel: "Create Family Event",
                  createDescription: "Plan a family gathering or special occasion",
                  colors: {
                    gradient: "from-sky-400 to-blue-500",
                    border: "border-sky-200 dark:border-sky-800",
                    text: "text-sky-700 dark:text-sky-100",
                    textMuted: "text-sky-600 dark:text-sky-300",
                    button: "from-sky-500 to-blue-500",
                    buttonHover: "from-sky-600 to-blue-600"
                  }
                })}
                data-testid="card-event-type-family"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${familyBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/90 via-sky-900/60 to-sky-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Family</CardTitle>
                  <CardDescription className="text-xs text-sky-200 hidden sm:block">Gatherings & occasions</CardDescription>
                  <Badge className="mt-2 bg-sky-400/80 text-white text-[10px]"><Heart className="w-2.5 h-2.5 mr-1" />Private</Badge>
                </CardHeader>
              </Card>

              {/* Baby Shower */}
              <Card 
                className="hover-elevate cursor-pointer border-2 border-rose-200 dark:border-rose-800 shadow-md hover:shadow-lg transition-all group overflow-hidden relative" 
                onClick={() => openEventDialog({
                  type: "baby_shower",
                  title: "Baby Shower",
                  description: "Create a new baby shower or join an existing one",
                  icon: Baby,
                  createPath: "/events/create?type=private&category=baby_shower",
                  joinPath: "/events/join/",
                  createLabel: "Create Baby Shower",
                  createDescription: "Plan a celebration for the new arrival",
                  colors: {
                    gradient: "from-rose-400 to-pink-500",
                    border: "border-rose-200 dark:border-rose-800",
                    text: "text-rose-700 dark:text-rose-100",
                    textMuted: "text-rose-600 dark:text-rose-300",
                    button: "from-rose-500 to-pink-500",
                    buttonHover: "from-rose-600 to-pink-600"
                  }
                })}
                data-testid="card-event-type-baby-shower"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${babyShowerBg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/90 via-rose-900/60 to-rose-900/30" />
                <CardHeader className="p-3 md:p-4 text-center relative z-10">
                  <div className="mx-auto p-3 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                    <Baby className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">Baby Shower</CardTitle>
                  <CardDescription className="text-xs text-rose-200 hidden sm:block">Celebrate new life</CardDescription>
                  <Badge className="mt-2 bg-rose-400/80 text-white text-[10px]"><Heart className="w-2.5 h-2.5 mr-1" />Private</Badge>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {/* Browse Events Section Header */}
        <div className="mb-4">
          <h2 className="font-heading font-semibold text-xl md:text-2xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Browse Events</h2>
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
                <h3 className="font-semibold text-xl mb-2 text-destructive">Failed to Load Events</h3>
                <p className="text-muted-foreground mb-4">We encountered an error while loading the events. Please try again later.</p>
                <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-reload">Reload Page</Button>
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
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`} />
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`p-2.5 bg-gradient-to-br ${colors.icon} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <Badge className={`${colors.badge} text-white shrink-0`}><UsersRound className="w-3 h-3 mr-1" />Group</Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-white line-clamp-2" data-testid={`text-group-title-${group.id}`}>{group.name}</CardTitle>
                    <CardDescription className={`${colors.text} line-clamp-2`}>{group.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <Calendar className="w-4 h-4" />
                      <span>{group.eventDate ? format(new Date(group.eventDate), "PPP") : "Date TBD"}</span>
                    </div>
                    {group.locationCity && (
                      <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{group.locationCity}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 relative z-10">
                    <Badge variant="outline" className="text-xs text-white border-white/40">{group.eventType?.replace(/_/g, ' ') || "Event"}</Badge>
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
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`} />
                  <CardHeader className="p-4 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`p-2.5 bg-gradient-to-br ${colors.icon} rounded-xl shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      {event.isPublic ? (
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shrink-0"><Globe className="w-3 h-3 mr-1" />Public</Badge>
                      ) : (
                        <Badge className={`${colors.badge} text-white shrink-0`}><Lock className="w-3 h-3 mr-1" />Private</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-white line-clamp-2" data-testid={`text-event-title-${event.id}`}>{event.title}</CardTitle>
                    <CardDescription className={`${colors.text} line-clamp-2`}>{event.description}</CardDescription>
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
                    <Badge variant="outline" className="text-xs text-white border-white/40">{eventType?.replace(/_/g, ' ') || "Event"}</Badge>
                    <Button size="sm" className={`bg-gradient-to-r ${colors.icon} text-white border-0`} onClick={(e) => { e.stopPropagation(); setLocation(`/events/${event.id}`); }}>
                      View Details<ArrowRight className="w-3.5 h-3.5 ml-1" />
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
                  {eventFilter === "public" ? "No public events found" : eventFilter === "group-events" ? "No group events yet" : "No events yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {eventFilter === "public" ? "Check back later for exciting celebrations and gatherings!" : eventFilter === "group-events" ? "Join or create a group to start planning together" : user ? "Create your first event to start planning your celebration" : "Log in to create your own events"}
                </p>
                {user && eventFilter === "group-events" && (
                  <Button onClick={() => setLocation("/groups")} data-testid="button-browse-groups" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                    <UsersRound className="w-4 h-4 mr-2" />Create or Join Groups
                  </Button>
                )}
                {!user && (
                  <Button onClick={() => setLocation("/login")} data-testid="button-login-to-create" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg">
                    Log In to Create Events
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : null}
      </main>

      {/* Event Type Dialog - Create or Join */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-event-type-options" onOpenAutoFocus={(e) => e.preventDefault()}>
          {selectedEventType && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 bg-gradient-to-br ${selectedEventType.colors.gradient} rounded-xl shadow-md`}>
                    <selectedEventType.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedEventType.title}</DialogTitle>
                    <DialogDescription>{selectedEventType.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <Card 
                  className={`hover-elevate cursor-pointer border-2 ${selectedEventType.colors.border} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/30`}
                  onClick={() => {
                    setEventDialogOpen(false);
                    setLocation(selectedEventType.createPath);
                  }}
                  data-testid="option-create-event"
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className={`p-2.5 bg-gradient-to-br ${selectedEventType.colors.gradient} rounded-xl shadow-md`}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${selectedEventType.colors.text}`}>{selectedEventType.createLabel}</CardTitle>
                      <CardDescription className={selectedEventType.colors.textMuted}>{selectedEventType.createDescription}</CardDescription>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                </Card>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground font-medium">OR</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm font-medium ${selectedEventType.colors.text}`}>
                    <Users className="w-4 h-4" />
                    Join an Existing {selectedEventType.title}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter invite code..."
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inviteCode.trim()) {
                          setEventDialogOpen(false);
                          setLocation(`${selectedEventType.joinPath}${inviteCode.trim()}`);
                        }
                      }}
                      className="flex-1"
                      data-testid="input-invite-code"
                    />
                    <Button
                      onClick={() => {
                        if (inviteCode.trim()) {
                          setEventDialogOpen(false);
                          setLocation(`${selectedEventType.joinPath}${inviteCode.trim()}`);
                        }
                      }}
                      disabled={!inviteCode.trim()}
                      className={`bg-gradient-to-r ${selectedEventType.colors.button}`}
                      data-testid="button-join-event"
                    >
                      Join
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Ask the organizer for the invite code to join</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
