import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Sparkles, Users, TrendingUp, IndianRupee, Vote, Lock, Globe, ArrowRight, UsersRound, PartyPopper, Heart, Star, Gift, MessageCircle, Bell, Camera, Store } from "lucide-react";
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

        {/* Quick Action Cards - Clean White Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover-elevate cursor-pointer bg-white dark:bg-card border shadow-lg hover:shadow-xl transition-all" 
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
              <CardTitle className="text-xl font-bold">
                Create Event
              </CardTitle>
              <CardDescription className="text-sm">
                Start planning your next celebration - birthdays, weddings, anniversaries, or any special occasion
              </CardDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Birthdays</Badge>
                <Badge variant="outline" className="text-xs">Weddings</Badge>
                <Badge variant="outline" className="text-xs">Parties</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer bg-white dark:bg-card border shadow-lg hover:shadow-xl transition-all" 
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
              <CardTitle className="text-xl font-bold">
                My Events
              </CardTitle>
              <CardDescription className="text-sm">
                View upcoming events, manage invitations, and track RSVPs for all your celebrations
              </CardDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Private</Badge>
                <Badge variant="outline" className="text-xs">Public</Badge>
                <Badge variant="outline" className="text-xs">Invites</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer bg-white dark:bg-card border shadow-lg hover:shadow-xl transition-all" 
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
              <CardTitle className="text-xl font-bold">
                Group Events
              </CardTitle>
              <CardDescription className="text-sm">
                Perfect for reunions, group trips & rides - plan together with polls, itinerary & split expenses
              </CardDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Reunions</Badge>
                <Badge variant="outline" className="text-xs">Trips</Badge>
                <Badge variant="outline" className="text-xs">Rides</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer bg-white dark:bg-card border shadow-lg hover:shadow-xl transition-all" 
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
              <CardTitle className="text-xl font-bold">
                Find Vendors
              </CardTitle>
              <CardDescription className="text-sm">
                Browse trusted vendors for your events - venues, caterers, decorators, photographers & more
              </CardDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Venues</Badge>
                <Badge variant="outline" className="text-xs">Catering</Badge>
                <Badge variant="outline" className="text-xs">Decor</Badge>
              </div>
            </CardHeader>
          </Card>

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
    </div>
  );
}
