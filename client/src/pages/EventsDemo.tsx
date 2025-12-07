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
  MessageCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/50 to-background dark:from-orange-950/20 dark:via-amber-950/10 dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white py-12 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
            <div>
              <span className="font-heading font-bold text-xl">Myzymo</span>
              <span className="block text-sm text-white/80">Bringing People Together</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-white/20 text-white border-white/30">
              <Calendar className="w-3 h-3 mr-1" />
              Try It Free
            </Badge>
          </div>
          
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3">
            Manage Events Effortlessly
          </h1>
          <p className="text-white/90 text-lg max-w-xl">
            Create events, invite your group, track RSVPs, and coordinate everything in one place.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowCreateEvent(!showCreateEvent)}
            className="gap-2"
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
    </div>
  );
}
