import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Sparkles, Users, TrendingUp, IndianRupee, Vote, Lock, Globe, ArrowRight, UsersRound } from "lucide-react";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
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

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);

  
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
        {/* Welcome Banner - Hero Image Design */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          <div className="relative z-10 p-4 md:p-8 min-h-[120px] md:min-h-[140px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
              <div>
                <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 flex items-center gap-2 md:gap-3 text-white">
                  <Sparkles className="w-5 h-5 md:w-7 md:h-7" />
                  Welcome {user.firstName}
                </h1>
                <p className="text-white/80 text-sm md:text-lg">Create and share your celebrations with friends and family</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{privateEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap">My Events</div>
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
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{publicEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap">Public</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{followedPublicEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap">Followed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards - Vibrant and Colorful */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            className="hover-elevate cursor-pointer border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-100 via-violet-50 to-purple-200 dark:from-purple-950/20 dark:to-violet-950/20 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setLocation("/groups")} 
            data-testid="card-quick-action-groups"
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-violet-400 rounded-xl shadow-md">
                  <UsersRound className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-purple-400 text-white">{groups?.length || 0}</Badge>
              </div>
              <CardTitle className="text-xl font-bold text-purple-700 dark:text-purple-100">
                Group Events
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-300">
                Plan together with polls & expense tracking
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
    </div>
  );
}
