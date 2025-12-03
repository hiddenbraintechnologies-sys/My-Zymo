import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Sparkles, Users, TrendingUp, IndianRupee, Vote, Lock, Globe, ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@shared/schema";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
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

  const { data: followedPublicEvents } = useQuery<Event[]>({
    queryKey: ["/api/events/followed"],
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
              <div className="flex items-center gap-2 md:gap-3">
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 md:p-4 min-w-[70px] md:min-w-[90px]">
                  <div className="text-xl md:text-3xl font-bold text-white">{privateEvents?.length || 0}</div>
                  <div className="text-xs text-white/80">My Events</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-2 md:p-4 min-w-[70px] md:min-w-[90px]">
                  <div className="text-xl md:text-3xl font-bold text-white">{followedPublicEvents?.length || 0}</div>
                  <div className="text-xs text-white/80">Followed</div>
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
        </div>
      </main>

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
