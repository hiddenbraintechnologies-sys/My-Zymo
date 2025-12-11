import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Search,
  MapPin,
  Bell,
  ChevronRight,
  GraduationCap,
  Cake,
  Bike,
  Dumbbell,
  Trophy,
  Home,
  Mountain,
  Music,
  Gem,
  Baby,
  Calendar,
  Users,
  IndianRupee,
  Store,
  Camera,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Star,
  TrendingUp,
  Gift,
  Heart,
  Zap,
} from "lucide-react";
import type { Event, EventGroup } from "@shared/schema";

interface MobileDashboardProps {
  onOpenEventDialog: (config: EventTypeConfig) => void;
  privateEvents?: Event[];
  publicEvents?: Event[];
  groups?: EventGroup[];
}

interface EventTypeConfig {
  type: string;
  title: string;
  description: string;
  icon: any;
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

const categories = [
  { id: "reunion", label: "Reunions", icon: GraduationCap, color: "from-purple-500 to-violet-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "birthday", label: "Birthday", icon: Cake, color: "from-pink-500 to-rose-600", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
  { id: "group_ride", label: "Rides", icon: Bike, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "fitness", label: "Fitness", icon: Dumbbell, color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "wedding", label: "Wedding", icon: Gem, color: "from-amber-500 to-orange-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "trek", label: "Treks", icon: Mountain, color: "from-teal-500 to-cyan-600", bgColor: "bg-teal-100 dark:bg-teal-900/30" },
  { id: "sports", label: "Sports", icon: Trophy, color: "from-red-500 to-orange-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
  { id: "music", label: "Music", icon: Music, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-100 dark:bg-violet-900/30" },
  { id: "family", label: "Family", icon: Home, color: "from-sky-500 to-blue-600", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
  { id: "baby_shower", label: "Baby", icon: Baby, color: "from-rose-400 to-pink-500", bgColor: "bg-rose-100 dark:bg-rose-900/30" },
];

const quickActions = [
  { id: "create", label: "Create Event", icon: Plus, color: "from-orange-500 to-amber-500", path: "/events/create" },
  { id: "split", label: "Split Bills", icon: IndianRupee, color: "from-green-500 to-emerald-500", path: "/split-expenses" },
  { id: "vendors", label: "Find Vendors", icon: Store, color: "from-purple-500 to-violet-500", path: "/vendors" },
  { id: "photos", label: "Photo Album", icon: Camera, color: "from-pink-500 to-rose-500", path: "/photos" },
];

const promoCards = [
  { 
    id: 1, 
    title: "Plan Your Reunion", 
    subtitle: "Reconnect with old friends", 
    discount: "FREE", 
    bgColor: "from-purple-500 to-violet-600",
    icon: GraduationCap
  },
  { 
    id: 2, 
    title: "Split Expenses", 
    subtitle: "Track & settle bills easily", 
    discount: "SMART", 
    bgColor: "from-green-500 to-emerald-600",
    icon: IndianRupee
  },
  { 
    id: 3, 
    title: "Book Vendors", 
    subtitle: "Best prices guaranteed", 
    discount: "10% OFF", 
    bgColor: "from-orange-500 to-amber-600",
    icon: Store
  },
];

export default function MobileDashboard({ onOpenEventDialog, privateEvents, publicEvents, groups }: MobileDashboardProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryClick = (categoryId: string) => {
    const categoryConfigs: Record<string, EventTypeConfig> = {
      reunion: {
        type: "reunion",
        title: "Reunions",
        description: "Create a new reunion or join an existing one",
        icon: GraduationCap,
        createPath: "/events/create?type=private&category=reunion",
        joinPath: "/events/join/",
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
      },
      birthday: {
        type: "birthday",
        title: "Birthday Party",
        description: "Create a birthday celebration",
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
      },
      group_ride: {
        type: "group_ride",
        title: "Group Rides",
        description: "Create a ride adventure",
        icon: Bike,
        createPath: "/events/create?type=private&category=group_ride",
        joinPath: "/events/join/",
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
      },
      fitness: {
        type: "fitness",
        title: "Fitness",
        description: "Create a fitness activity",
        icon: Dumbbell,
        createPath: "/events/create?type=private&category=fitness",
        joinPath: "/events/join/",
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
      },
      wedding: {
        type: "wedding",
        title: "Wedding",
        description: "Plan your special day",
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
      },
      trek: {
        type: "trek",
        title: "Treks",
        description: "Plan an adventure",
        icon: Mountain,
        createPath: "/events/create?type=private&category=trek",
        joinPath: "/events/join/",
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
      },
      sports: {
        type: "sports",
        title: "Sports",
        description: "Create a sports event",
        icon: Trophy,
        createPath: "/events/create?type=private&category=sports",
        joinPath: "/events/join/",
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
      },
      music: {
        type: "music",
        title: "Music",
        description: "Create a music event",
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
      },
      family: {
        type: "family",
        title: "Family",
        description: "Create a family event",
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
      },
      baby_shower: {
        type: "baby_shower",
        title: "Baby Shower",
        description: "Create a baby shower event",
        icon: Baby,
        createPath: "/events/create?type=private&category=baby_shower",
        joinPath: "/events/join/",
        createLabel: "Create Baby Shower",
        createDescription: "Plan a special baby shower celebration",
        colors: {
          gradient: "from-rose-400 to-pink-500",
          border: "border-rose-200 dark:border-rose-800",
          text: "text-rose-700 dark:text-rose-100",
          textMuted: "text-rose-600 dark:text-rose-300",
          button: "from-rose-500 to-pink-500",
          buttonHover: "from-rose-600 to-pink-600"
        }
      },
    };

    const config = categoryConfigs[categoryId];
    if (config) {
      onOpenEventDialog(config);
    }
  };

  const totalEvents = (privateEvents?.length || 0) + (publicEvents?.length || 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Location & Profile */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 pt-3 pb-4 safe-area-top">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-80">Hello, {user?.firstName || 'Guest'}</p>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">Your Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="relative p-2 rounded-full bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/messages")}
              data-testid="button-mobile-notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">3</span>
            </button>
            <Avatar className="w-9 h-9 border-2 border-white/50">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="bg-white/20 text-white text-sm">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search events, vendors, groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 rounded-xl bg-white dark:bg-gray-900 text-foreground border-0 shadow-lg"
            data-testid="input-mobile-search"
          />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="px-4 -mt-2 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl p-3 text-center border border-orange-200/50 dark:border-orange-800/50">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalEvents}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              Events
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl p-3 text-center border border-purple-200/50 dark:border-purple-800/50">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{groups?.length || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Groups
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-3 text-center border border-green-200/50 dark:border-green-800/50">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <IndianRupee className="w-3 h-3" />
              Pending
            </div>
          </div>
        </div>
      </div>

      {/* Category Icons - Horizontal Scroll */}
      <div className="px-4 mb-5">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center gap-1.5 min-w-[60px]"
                data-testid={`button-category-${category.id}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${category.bgColor} flex items-center justify-center shadow-sm hover:shadow-md transition-all`}>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${category.color}`}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground">{category.label}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Promo Banner Carousel */}
      <div className="px-4 mb-5">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {promoCards.map((promo) => (
              <div
                key={promo.id}
                className={`relative min-w-[280px] h-32 rounded-2xl bg-gradient-to-r ${promo.bgColor} p-4 flex items-center justify-between overflow-hidden`}
                data-testid={`card-promo-${promo.id}`}
              >
                <div className="z-10">
                  <Badge className="bg-white/20 text-white text-[10px] mb-2">{promo.discount}</Badge>
                  <h3 className="text-white font-bold text-lg">{promo.title}</h3>
                  <p className="text-white/80 text-sm">{promo.subtitle}</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                  <promo.icon className="w-24 h-24 text-white" />
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Quick Actions</h2>
          <Badge variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Fast
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
              data-testid={`button-quick-${action.id}`}
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Your Events Section */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Your Events</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/events")} className="text-primary text-xs h-8" data-testid="button-view-all-events">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        
        {privateEvents && privateEvents.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {privateEvents.slice(0, 5).map((event) => (
                <Card 
                  key={event.id} 
                  className="min-w-[200px] hover-elevate cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                  data-testid={`card-event-${event.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                        <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{event.location || "Location TBD"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {event.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 w-fit mx-auto mb-3">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-medium text-sm mb-1">No events yet</h4>
              <p className="text-xs text-muted-foreground mb-3">Create your first event to get started</p>
              <Button size="sm" onClick={() => navigate("/events/create")} className="bg-gradient-to-r from-orange-500 to-amber-500" data-testid="button-create-first-event">
                <Plus className="w-4 h-4 mr-1" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Your Groups Section */}
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Your Groups</h2>
          <Button variant="ghost" size="sm" className="text-primary text-xs h-8" data-testid="button-view-all-groups">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        
        {groups && groups.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {groups.slice(0, 5).map((group) => (
                <Card 
                  key={group.id} 
                  className="min-w-[200px] hover-elevate cursor-pointer"
                  onClick={() => navigate(`/groups/${group.id}`)}
                  data-testid={`card-group-${group.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{group.eventType || "Planning Group"}</p>
                        <Badge variant="outline" className="text-[10px] h-5 mt-1">
                          <MessageCircle className="w-2.5 h-2.5 mr-1" />
                          Chat
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 w-fit mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-sm mb-1">No groups yet</h4>
              <p className="text-xs text-muted-foreground mb-3">Join or create a planning group</p>
              <Button size="sm" variant="outline" data-testid="button-create-first-group">
                <Plus className="w-4 h-4 mr-1" />
                Create Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Explore Features Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Explore Features</h2>
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px]">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            New
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/split-expenses")} data-testid="card-feature-split">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Split Bills</h4>
                  <p className="text-[10px] text-muted-foreground">Track expenses</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Popular</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/vendors")} data-testid="card-feature-vendors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Vendors</h4>
                  <p className="text-[10px] text-muted-foreground">Find services</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                <Star className="w-3 h-3 fill-current" />
                <span>Top Rated</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" onClick={() => navigate("/messages")} data-testid="card-feature-chat">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Messages</h4>
                  <p className="text-[10px] text-muted-foreground">Group chats</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs">
                <Zap className="w-3 h-3" />
                <span>Real-time</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" data-testid="card-feature-photos">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Photos</h4>
                  <p className="text-[10px] text-muted-foreground">Share memories</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 text-xs">
                <Heart className="w-3 h-3" />
                <span>Memories</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
