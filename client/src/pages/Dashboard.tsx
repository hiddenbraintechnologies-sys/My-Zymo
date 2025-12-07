import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Sparkles, Users, TrendingUp, IndianRupee, Vote, Lock, Globe, ArrowRight, UsersRound, PartyPopper, Heart, Star, Gift, MessageCircle, Bell, Camera, Store, GraduationCap, Cake, Bike, Dumbbell, Home, Gem, Music, Mountain, Trophy, Baby } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Event, EventGroup } from "@shared/schema";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import QuoteDialog from "@/components/QuoteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

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

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventTypeConfig | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const openEventDialog = (config: EventTypeConfig) => {
    setSelectedEventType(config);
    setInviteCode("");
    setEventDialogOpen(true);
  };

  
  const { data: privateEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/private"],
    enabled: !!user,
  });

  const { data: publicEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/public"],
    enabled: !!user,
  });

  const { data: followedPublicEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/followed"],
    enabled: !!user,
  });

  const { data: groups } = useQuery<EventGroup[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

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
        {/* Welcome Banner - Enhanced Hero Design with Floating Icons */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          
          {/* Floating Decorative Icons */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
            <div className="bg-gradient-to-br from-orange-500/30 to-amber-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute top-8 right-4 md:top-4 md:right-[200px] z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-pink-500/30 to-rose-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <PartyPopper className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-16 left-8 md:bottom-4 md:left-[120px] z-10 hidden md:block">
            <div className="bg-gradient-to-br from-violet-500/30 to-purple-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 p-4 md:p-8 min-h-[140px] md:min-h-[180px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
              <div>
                {/* Category Badge */}
                <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/40 to-amber-500/40 backdrop-blur-sm border border-orange-300/50 text-xs font-medium text-white">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Dashboard
                </div>
                <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 flex items-center gap-2 md:gap-3 text-white">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-white/80 text-sm md:text-lg mb-3">Create and share your celebrations with friends and family</p>
                {/* Quick Action Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Calendar className="w-3.5 h-3.5 text-orange-300" />
                    <span className="text-xs text-white">Events</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Users className="w-3.5 h-3.5 text-purple-300" />
                    <span className="text-xs text-white">Groups</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Gift className="w-3.5 h-3.5 text-pink-300" />
                    <span className="text-xs text-white">Celebrations</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
                <div className="text-center bg-gradient-to-br from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{privateEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Events
                  </div>
                </div>
                <div 
                  className="text-center bg-gradient-to-br from-purple-500/30 to-violet-500/30 backdrop-blur-sm border border-purple-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center cursor-pointer hover:from-purple-500/40 hover:to-violet-500/40 transition-all"
                  onClick={() => setLocation("/groups")}
                  data-testid="stat-groups"
                >
                  <div className="text-xl md:text-3xl font-bold text-white">{groups?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <UsersRound className="w-3 h-3" />
                    Groups
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur-sm border border-teal-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{publicEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-rose-500/30 to-pink-500/30 backdrop-blur-sm border border-rose-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{followedPublicEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3" />
                    Following
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What are you planning? - Interactive Event Type Selection */}
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${reunionBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/60 to-purple-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Reunions</CardTitle>
                <CardDescription className="text-xs text-purple-200 hidden sm:block">
                  School, college & family
                </CardDescription>
                <Badge className="mt-2 bg-purple-400/80 text-white text-[10px]">
                  <UsersRound className="w-2.5 h-2.5 mr-1" />
                  Group
                </Badge>
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${birthdayBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/90 via-pink-900/60 to-pink-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Cake className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Birthday Party</CardTitle>
                <CardDescription className="text-xs text-pink-200 hidden sm:block">
                  Celebrate in style
                </CardDescription>
                <Badge className="mt-2 bg-pink-400/80 text-white text-[10px]">
                  <PartyPopper className="w-2.5 h-2.5 mr-1" />
                  Party
                </Badge>
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${groupRideBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/60 to-blue-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Bike className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Group Rides</CardTitle>
                <CardDescription className="text-xs text-blue-200 hidden sm:block">
                  Bike trips & adventures
                </CardDescription>
                <Badge className="mt-2 bg-blue-400/80 text-white text-[10px]">
                  <UsersRound className="w-2.5 h-2.5 mr-1" />
                  Group
                </Badge>
              </CardHeader>
            </Card>

            {/* Fitness Activities */}
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${fitnessBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/60 to-emerald-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Fitness</CardTitle>
                <CardDescription className="text-xs text-emerald-200 hidden sm:block">
                  Yoga, gym & sports
                </CardDescription>
                <Badge className="mt-2 bg-emerald-400/80 text-white text-[10px]">
                  <UsersRound className="w-2.5 h-2.5 mr-1" />
                  Group
                </Badge>
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${weddingBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-900/60 to-amber-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Gem className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Wedding</CardTitle>
                <CardDescription className="text-xs text-amber-200 hidden sm:block">
                  Your special day
                </CardDescription>
                <Badge className="mt-2 bg-amber-400/80 text-white text-[10px]">
                  <Heart className="w-2.5 h-2.5 mr-1" />
                  Private
                </Badge>
              </CardHeader>
            </Card>

            {/* Treks & Adventures */}
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${trekBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-900/60 to-teal-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Mountain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Treks</CardTitle>
                <CardDescription className="text-xs text-teal-200 hidden sm:block">
                  Hiking & adventures
                </CardDescription>
                <Badge className="mt-2 bg-teal-400/80 text-white text-[10px]">
                  <UsersRound className="w-2.5 h-2.5 mr-1" />
                  Group
                </Badge>
              </CardHeader>
            </Card>

            {/* Sports Events */}
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${sportsBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 via-red-900/60 to-red-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Sports</CardTitle>
                <CardDescription className="text-xs text-red-200 hidden sm:block">
                  Matches & tournaments
                </CardDescription>
                <Badge className="mt-2 bg-red-400/80 text-white text-[10px]">
                  <UsersRound className="w-2.5 h-2.5 mr-1" />
                  Group
                </Badge>
              </CardHeader>
            </Card>

            {/* Music & Concerts */}
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${musicBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 via-violet-900/60 to-violet-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Music</CardTitle>
                <CardDescription className="text-xs text-violet-200 hidden sm:block">
                  Concerts & shows
                </CardDescription>
                <Badge className="mt-2 bg-violet-400/80 text-white text-[10px]">
                  <Globe className="w-2.5 h-2.5 mr-1" />
                  Public
                </Badge>
              </CardHeader>
            </Card>

            {/* Family Events */}
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${familyBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/90 via-sky-900/60 to-sky-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Family</CardTitle>
                <CardDescription className="text-xs text-sky-200 hidden sm:block">
                  Gatherings & occasions
                </CardDescription>
                <Badge className="mt-2 bg-sky-400/80 text-white text-[10px]">
                  <Heart className="w-2.5 h-2.5 mr-1" />
                  Private
                </Badge>
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
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${babyShowerBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/90 via-rose-900/60 to-rose-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-3 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Baby Shower</CardTitle>
                <CardDescription className="text-xs text-rose-200 hidden sm:block">
                  Celebrate new life
                </CardDescription>
                <Badge className="mt-2 bg-rose-400/80 text-white text-[10px]">
                  <Heart className="w-2.5 h-2.5 mr-1" />
                  Private
                </Badge>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Feature Tools Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-xl md:text-2xl">Feature Tools</h2>
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Interactive
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Split Expenses */}
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 border-2 border-orange-200 dark:border-orange-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/split-expenses")} 
              data-testid="card-feature-split-expenses"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl shadow-md">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">Essential</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-orange-700 dark:text-orange-100">Split Expenses</CardTitle>
                <CardDescription className="text-sm text-orange-600/80 dark:text-orange-200/80">
                  Track expenses and split bills fairly among group members
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Group Chat */}
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/group-chat-demo")} 
              data-testid="card-feature-group-chat"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs">Interactive</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-100">Group Chat</CardTitle>
                <CardDescription className="text-sm text-purple-600/80 dark:text-purple-200/80">
                  Real-time messaging within your event group
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Attendee Management */}
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/attendee-management")} 
              data-testid="card-feature-attendee-management"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs">Interactive</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-100">Attendee Management</CardTitle>
                <CardDescription className="text-sm text-emerald-600/80 dark:text-emerald-200/80">
                  Track RSVPs and manage your guest list
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Smart Reminders */}
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-sky-950/30 border-2 border-sky-200 dark:border-sky-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/smart-reminders")} 
              data-testid="card-feature-smart-reminders"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-md">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs">Interactive</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-sky-700 dark:text-sky-100">Smart Reminders</CardTitle>
                <CardDescription className="text-sm text-sky-600/80 dark:text-sky-200/80">
                  Never miss important event updates
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Photo Album */}
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-rose-950/30 border-2 border-rose-200 dark:border-rose-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/photo-album")} 
              data-testid="card-feature-photo-album"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl shadow-md">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs">Interactive</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-rose-700 dark:text-rose-100">Photo Album</CardTitle>
                <CardDescription className="text-sm text-rose-600/80 dark:text-rose-200/80">
                  Share memories with your event group
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Vendor Marketplace */}
            <Card 
              className="hover-elevate cursor-pointer bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-teal-950/30 border-2 border-teal-200 dark:border-teal-800 shadow-md hover:shadow-lg transition-all" 
              onClick={() => setLocation("/vendor-marketplace")} 
              data-testid="card-feature-vendor-marketplace"
            >
              <CardHeader className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl shadow-md">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs">New</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-teal-700 dark:text-teal-100">Vendor Marketplace</CardTitle>
                <CardDescription className="text-sm text-teal-600/80 dark:text-teal-200/80">
                  Find trusted vendors for your events
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
      {/* Floating Free Quote Button - Cute FAB */}
      <button
        onClick={() => setQuoteDialogOpen(true)}
        data-testid="fab-free-quote"
        className="fixed right-4 md:right-8 bottom-24 md:bottom-8 z-40 group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <IndianRupee className="w-5 h-5" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        </div>
        <span className="font-semibold text-sm whitespace-nowrap">Free Quote</span>
        <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 hidden sm:flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          AI
        </Badge>
      </button>
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

      {/* Unified Event Type Dialog - Create or Join */}
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
                    <DialogDescription>
                      {selectedEventType.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Create New Option */}
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
                      <CardDescription className={selectedEventType.colors.textMuted}>
                        {selectedEventType.createDescription}
                      </CardDescription>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                </Card>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground font-medium">OR</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Join with Invite Code */}
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
                      className={`bg-gradient-to-r ${selectedEventType.colors.button} hover:${selectedEventType.colors.buttonHover}`}
                      data-testid="button-join-event"
                    >
                      Join
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ask the organizer for the invite code to join
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
