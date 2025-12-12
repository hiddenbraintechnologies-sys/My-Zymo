import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Plus, 
  Users, 
  ArrowRight, 
  Check, 
  Trash2, 
  MapPin,
  Clock,
  Sparkles,
  UserPlus,
  Lock,
  PartyPopper,
  GraduationCap,
  Bike,
  Dumbbell,
  Cake,
  Heart,
  Music,
  Camera,
  Edit,
  Share2,
  Bell,
  MessageCircle,
  Globe,
  Star,
  Gift
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { Event as EventType } from "@shared/schema";
import Navbar from "@/components/Navbar";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";

interface Event {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: Attendee[];
  status: "planning" | "confirmed" | "completed";
}

interface Attendee {
  id: string;
  name: string;
  status: "going" | "maybe" | "pending";
  color: string;
}

const EVENT_TYPES = [
  { value: "reunion", label: "Reunion", icon: GraduationCap },
  { value: "birthday", label: "Birthday Party", icon: Cake },
  { value: "wedding", label: "Wedding", icon: Heart },
  { value: "group_ride", label: "Group Ride", icon: Bike },
  { value: "fitness", label: "Fitness Activity", icon: Dumbbell },
  { value: "party", label: "Party", icon: Music },
  { value: "photoshoot", label: "Photoshoot", icon: Camera },
  { value: "other", label: "Other", icon: PartyPopper },
];

const DEMO_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-rose-500",
];

const DEMO_NAMES = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Ananya", "Rohan", "Meera"];

export default function EventsDemo() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "College Reunion 2024",
      type: "reunion",
      description: "Annual reunion with batchmates from Engineering College. Let's catch up and relive old memories!",
      date: "2024-12-28",
      time: "18:00",
      location: "The Grand Ballroom, Mumbai",
      attendees: [
        { id: "1", name: "You", status: "going", color: "bg-orange-500" },
        { id: "2", name: "Rahul", status: "going", color: "bg-blue-500" },
        { id: "3", name: "Priya", status: "maybe", color: "bg-green-500" },
        { id: "4", name: "Amit", status: "pending", color: "bg-purple-500" },
      ],
      status: "confirmed",
    },
    {
      id: "2",
      title: "Weekend Cycling Trip",
      type: "group_ride",
      description: "30km morning ride through the countryside. Beginners welcome!",
      date: "2024-12-15",
      time: "06:00",
      location: "Meeting Point: Central Park Gate",
      attendees: [
        { id: "1", name: "You", status: "going", color: "bg-orange-500" },
        { id: "5", name: "Vikram", status: "going", color: "bg-cyan-500" },
      ],
      status: "planning",
    },
  ]);
  
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "party",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [newAttendeeName, setNewAttendeeName] = useState("");

  const getEventIcon = (type: string) => {
    const eventType = EVENT_TYPES.find(t => t.value === type);
    return eventType?.icon || PartyPopper;
  };

  const getEventTypeLabel = (type: string) => {
    const eventType = EVENT_TYPES.find(t => t.value === type);
    return eventType?.label || "Event";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const createEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      type: newEvent.type,
      description: newEvent.description.trim(),
      date: newEvent.date,
      time: newEvent.time || "18:00",
      location: newEvent.location.trim() || "To be decided",
      attendees: [
        { id: "1", name: "You", status: "going", color: "bg-orange-500" },
      ],
      status: "planning",
    };
    
    setEvents([event, ...events]);
    setNewEvent({
      title: "",
      type: "party",
      description: "",
      date: "",
      time: "",
      location: "",
    });
    setShowCreateEvent(false);
    setSelectedEvent(event);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
  };

  const addAttendee = () => {
    if (!selectedEvent || !newAttendeeName.trim()) return;
    
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      name: newAttendeeName.trim(),
      status: "pending",
      color: DEMO_COLORS[selectedEvent.attendees.length % DEMO_COLORS.length],
    };
    
    const updatedEvent = {
      ...selectedEvent,
      attendees: [...selectedEvent.attendees, newAttendee],
    };
    
    setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
    setNewAttendeeName("");
  };

  const addQuickAttendee = () => {
    if (!selectedEvent) return;
    
    const availableNames = DEMO_NAMES.filter(
      name => !selectedEvent.attendees.some(a => a.name === name)
    );
    
    if (availableNames.length === 0) return;
    
    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      name: randomName,
      status: "pending",
      color: DEMO_COLORS[selectedEvent.attendees.length % DEMO_COLORS.length],
    };
    
    const updatedEvent = {
      ...selectedEvent,
      attendees: [...selectedEvent.attendees, newAttendee],
    };
    
    setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
  };

  const updateAttendeeStatus = (attendeeId: string, status: "going" | "maybe" | "pending") => {
    if (!selectedEvent) return;
    
    const updatedEvent = {
      ...selectedEvent,
      attendees: selectedEvent.attendees.map(a => 
        a.id === attendeeId ? { ...a, status } : a
      ),
    };
    
    setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
  };

  const removeAttendee = (attendeeId: string) => {
    if (!selectedEvent || attendeeId === "1") return; // Can't remove "You"
    
    const updatedEvent = {
      ...selectedEvent,
      attendees: selectedEvent.attendees.filter(a => a.id !== attendeeId),
    };
    
    setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
    setSelectedEvent(updatedEvent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "going": return "bg-green-500";
      case "maybe": return "bg-yellow-500";
      case "pending": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusCounts = (event: Event) => {
    return {
      going: event.attendees.filter(a => a.status === "going").length,
      maybe: event.attendees.filter(a => a.status === "maybe").length,
      pending: event.attendees.filter(a => a.status === "pending").length,
    };
  };

  // Fetch real events from API
  const { data: myEvents } = useQuery<EventType[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const { data: publicEventsData } = useQuery<EventType[]>({
    queryKey: ["/api/events/public"],
    enabled: !!user,
  });

  const { data: followedEventsData } = useQuery<EventType[]>({
    queryKey: ["/api/events/followed"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pb-8">
        {/* Hero Banner - Dashboard Style with Floating Icons */}
        <div className="mb-6 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Events" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          
          {/* Floating Decorative Icons */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
            <div className="bg-gradient-to-br from-orange-500/30 to-amber-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
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
            <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 pt-3 pb-4 px-4 md:pt-4 md:pb-5 md:px-6 min-h-[100px] md:min-h-[130px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
              <div>
                {/* Category Badge */}
                <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/40 to-amber-500/40 backdrop-blur-sm border border-orange-300/50 text-xs font-medium text-white">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  Events
                </div>
                <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 text-white">
                  Your Events
                </h1>
                <p className="text-white/80 text-sm md:text-lg mb-3">Manage all your celebrations in one place</p>
                {/* Quick Action Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Lock className="w-3.5 h-3.5 text-orange-300" />
                    <span className="text-xs text-white">Private</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Globe className="w-3.5 h-3.5 text-teal-300" />
                    <span className="text-xs text-white">Public</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    <Heart className="w-3.5 h-3.5 text-pink-300" />
                    <span className="text-xs text-white">Following</span>
                  </div>
                </div>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div className="text-center bg-gradient-to-br from-orange-500/30 to-amber-500/30 backdrop-blur-sm border border-orange-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{myEvents?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    My Events
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur-sm border border-teal-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{publicEventsData?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Globe className="w-3 h-3" />
                    Public
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-rose-500/30 to-pink-500/30 backdrop-blur-sm border border-rose-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center">
                  <div className="text-xl md:text-3xl font-bold text-white">{followedEventsData?.length || 0}</div>
                  <div className="text-[10px] md:text-xs text-white/80 whitespace-nowrap flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3" />
                    Following
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button 
            onClick={() => navigate("/events/create")}
            className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            data-testid="button-create-event"
          >
            <Plus className="w-4 h-4" />
            Create New Event
          </Button>
          {selectedEvent && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedEvent(null)}
              data-testid="button-back-to-list"
            >
              Back to Events List
            </Button>
          )}
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="my-events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="my-events" className="gap-2" data-testid="tab-my-events">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">My Events</span>
              <span className="sm:hidden">Mine</span>
              <Badge variant="secondary" className="ml-1 text-xs">{myEvents?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="public" className="gap-2" data-testid="tab-public-events">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Public Events</span>
              <span className="sm:hidden">Public</span>
              <Badge variant="secondary" className="ml-1 text-xs">{publicEventsData?.length || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2" data-testid="tab-following">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Following</span>
              <span className="sm:hidden">Follow</span>
              <Badge variant="secondary" className="ml-1 text-xs">{followedEventsData?.length || 0}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* My Events Tab */}
          <TabsContent value="my-events" className="space-y-4">
            {myEvents && myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="hover-elevate cursor-pointer border shadow-sm hover:shadow-md transition-all"
                    onClick={() => navigate(`/events/${event.id}`)}
                    data-testid={`card-event-${event.id}`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate">{event.title}</CardTitle>
                          <CardDescription className="text-sm mt-1 line-clamp-2">{event.description}</CardDescription>
                        </div>
                        <Badge variant={event.isPublic ? "default" : "secondary"} className="shrink-0">
                          {event.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {event.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[120px]">{event.location || 'TBD'}</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-muted/30">
                <CardHeader className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <CardTitle className="text-lg text-muted-foreground">No events yet</CardTitle>
                  <CardDescription>Create your first event to get started!</CardDescription>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    onClick={() => navigate("/events/create")}
                    data-testid="button-create-first-event"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Public Events Tab */}
          <TabsContent value="public" className="space-y-4">
            {publicEventsData && publicEventsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicEventsData.map((event) => (
                  <Card 
                    key={event.id} 
                    className="hover-elevate cursor-pointer border shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20"
                    onClick={() => navigate(`/events/${event.id}`)}
                    data-testid={`card-public-event-${event.id}`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate">{event.title}</CardTitle>
                          <CardDescription className="text-sm mt-1 line-clamp-2">{event.description}</CardDescription>
                        </div>
                        <Badge className="shrink-0 bg-teal-500">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[120px]">{event.location || 'TBD'}</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-muted/30">
                <CardHeader className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <CardTitle className="text-lg text-muted-foreground">No public events</CardTitle>
                  <CardDescription>Discover public events in your area!</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-4">
            {followedEventsData && followedEventsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedEventsData.map((event) => (
                  <Card 
                    key={event.id} 
                    className="hover-elevate cursor-pointer border shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20"
                    onClick={() => navigate(`/events/${event.id}`)}
                    data-testid={`card-followed-event-${event.id}`}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate">{event.title}</CardTitle>
                          <CardDescription className="text-sm mt-1 line-clamp-2">{event.description}</CardDescription>
                        </div>
                        <Badge className="shrink-0 bg-rose-500">
                          <Heart className="w-3 h-3 mr-1" />
                          Following
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[120px]">{event.location || 'TBD'}</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-muted/30">
                <CardHeader className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <CardTitle className="text-lg text-muted-foreground">Not following any events</CardTitle>
                  <CardDescription>Follow public events to stay updated!</CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Legacy Demo Events Section (hidden for now) */}
        <div className="hidden mt-8 space-y-6">

        {/* Create Event Form */}
        {showCreateEvent && (
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5" data-testid="card-create-event">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-primary" />
                Create New Event
              </CardTitle>
              <CardDescription>Fill in the details to create your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input
                    placeholder="e.g., Birthday Bash 2024"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    data-testid="input-event-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select 
                    value={newEvent.type} 
                    onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Tell your guests what this event is about..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="resize-none"
                  rows={3}
                  data-testid="input-event-description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    data-testid="input-event-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    data-testid="input-event-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Where is it happening?"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    data-testid="input-event-location"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreateEvent(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createEvent}
                  disabled={!newEvent.title.trim() || !newEvent.date}
                  data-testid="button-save-event"
                >
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <Card className={`${selectedEvent ? 'lg:col-span-1' : 'lg:col-span-3'}`} data-testid="card-events-list">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Your Events
              </CardTitle>
              <CardDescription>
                {events.length} event{events.length !== 1 ? 's' : ''} created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className={selectedEvent ? "h-[400px]" : "h-auto"}>
                <div className={`space-y-3 ${!selectedEvent ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground col-span-full">
                      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No events yet. Create your first event!</p>
                    </div>
                  ) : (
                    events.map((event) => {
                      const EventIcon = getEventIcon(event.type);
                      const counts = getStatusCounts(event);
                      const isSelected = selectedEvent?.id === event.id;
                      
                      return (
                        <div 
                          key={event.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedEvent(event)}
                          data-testid={`event-card-${event.id}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                                <EventIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold line-clamp-1">{event.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              data-testid={`button-delete-event-${event.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.date)}</span>
                              {event.time && (
                                <>
                                  <Clock className="w-3 h-3 ml-1" />
                                  <span>{event.time}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-3 pt-2 border-t">
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 4).map((attendee) => (
                                <Avatar key={attendee.id} className="w-6 h-6 border-2 border-background">
                                  <AvatarFallback className={`${attendee.color} text-white text-xs`}>
                                    {attendee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {event.attendees.length > 4 && (
                                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                  +{event.attendees.length - 4}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600">{counts.going} going</span>
                              {counts.maybe > 0 && <span className="text-yellow-600">{counts.maybe} maybe</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Event Detail Panel */}
          {selectedEvent && (
            <Card className="lg:col-span-2" data-testid="card-event-detail">
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                      {(() => {
                        const EventIcon = getEventIcon(selectedEvent.type);
                        return <EventIcon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle>{selectedEvent.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{getEventTypeLabel(selectedEvent.type)}</Badge>
                        <Badge className={`${
                          selectedEvent.status === 'confirmed' ? 'bg-green-500' :
                          selectedEvent.status === 'planning' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        } text-white`}>
                          {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                )}

                <Separator />

                {/* Attendees Section */}
                <div>
                  <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Attendees ({selectedEvent.attendees.length})
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={addQuickAttendee}
                        data-testid="button-quick-add-attendee"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Quick Add
                      </Button>
                    </div>
                  </div>
                  
                  {/* Add Attendee Input */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add attendee name..."
                      value={newAttendeeName}
                      onChange={(e) => setNewAttendeeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAttendee()}
                      data-testid="input-attendee-name"
                    />
                    <Button 
                      size="icon" 
                      onClick={addAttendee}
                      disabled={!newAttendeeName.trim()}
                      data-testid="button-add-attendee"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Attendee List */}
                  <div className="space-y-2">
                    {selectedEvent.attendees.map((attendee) => (
                      <div 
                        key={attendee.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        data-testid={`attendee-${attendee.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`${attendee.color} text-white text-sm`}>
                              {attendee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{attendee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {(["going", "maybe", "pending"] as const).map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={attendee.status === status ? "default" : "outline"}
                                className={`h-7 px-2 text-xs ${
                                  attendee.status === status 
                                    ? status === "going" ? "bg-green-500 hover:bg-green-600" :
                                      status === "maybe" ? "bg-yellow-500 hover:bg-yellow-600" :
                                      "bg-gray-400 hover:bg-gray-500"
                                    : ""
                                }`}
                                onClick={() => updateAttendeeStatus(attendee.id, status)}
                                data-testid={`button-status-${status}-${attendee.id}`}
                              >
                                {status === "going" && <Check className="w-3 h-3 mr-1" />}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Button>
                            ))}
                          </div>
                          {attendee.id !== "1" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => removeAttendee(attendee.id)}
                              data-testid={`button-remove-attendee-${attendee.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Features Locked */}
                {!user && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3 text-center">
                      Premium features - Sign up to unlock
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="opacity-60 cursor-not-allowed"
                        disabled
                        data-testid="button-locked-share"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Share Invite Link
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="opacity-60 cursor-not-allowed"
                        disabled
                        data-testid="button-locked-notify"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Send Notifications
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="opacity-60 cursor-not-allowed"
                        disabled
                        data-testid="button-locked-chat"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Group Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="opacity-60 cursor-not-allowed"
                        disabled
                        data-testid="button-locked-expenses"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Track Expenses
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* CTA Section */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="card-cta">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-heading font-bold text-2xl mb-2">
                  Unlock Full Event Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sign up to save your events permanently, share invite links, send notifications, 
                  manage expenses, and access group chat features!
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {user ? (
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/events")}
                      data-testid="button-go-to-events"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Go to My Events
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate("/signup")}
                        data-testid="button-signup-cta"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => navigate("/login")}
                        data-testid="button-login-cta"
                      >
                        Already have an account? Log in
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Share2, label: "Shareable Links" },
                { icon: Bell, label: "Smart Reminders" },
                { icon: MessageCircle, label: "Group Chat" },
                { icon: Lock, label: "Secure & Private" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
        {/* End of hidden legacy section */}
      </main>
    </div>
  );
}
