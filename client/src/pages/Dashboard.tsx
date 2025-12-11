import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus, Sparkles, Users, TrendingUp, IndianRupee, Vote, Lock, Globe, ArrowRight, UsersRound, PartyPopper, Heart, Star, Gift, MessageCircle, Bell, Camera, Store, GraduationCap, Cake, Bike, Dumbbell, Home, Gem, Music, Mountain, Trophy, Baby, Check, Copy, Share2, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Event, EventGroup } from "@shared/schema";
import Navbar from "@/components/Navbar";
import MobileDashboard from "@/components/MobileDashboard";
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

// Category-specific form content with matching colors from dashboard
const FORM_CONTENT: Record<string, {
  title: string;
  description: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  locationPlaceholder: string;
  eventTypes: { value: string; label: string }[];
  defaultEventType: string;
  colors: {
    iconGradient: string;
    iconColor: string;
    buttonGradient: string;
    successGradient: string;
    cardBg: string;
    cardBorder: string;
  };
}> = {
  reunion: {
    title: "Plan Your Reunion",
    description: "Reconnect with old friends and create new memories",
    namePlaceholder: "e.g., Class of 2015 Reunion",
    descriptionPlaceholder: "e.g., 10-year reunion of our college batch",
    locationPlaceholder: "e.g., Delhi, Mumbai",
    eventTypes: [
      { value: "college_reunion", label: "College Reunion" },
      { value: "school_reunion", label: "School Reunion" },
      { value: "family_gathering", label: "Family Reunion" },
      { value: "corporate_event", label: "Alumni Meet" },
    ],
    defaultEventType: "college_reunion",
    colors: {
      iconGradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-500",
      buttonGradient: "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      successGradient: "from-purple-500 to-pink-500",
      cardBg: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      cardBorder: "border-purple-200 dark:border-purple-800",
    },
  },
  group_ride: {
    title: "Plan Your Group Ride",
    description: "Organize an exciting ride adventure with your crew",
    namePlaceholder: "e.g., Leh-Ladakh Bike Trip",
    descriptionPlaceholder: "e.g., Weekend ride to the mountains",
    locationPlaceholder: "e.g., Manali, Goa",
    eventTypes: [
      { value: "group_ride", label: "Group Ride" },
      { value: "bike_rally", label: "Bike Rally" },
      { value: "cycling_trip", label: "Cycling Trip" },
      { value: "adventure_trip", label: "Road Trip" },
    ],
    defaultEventType: "group_ride",
    colors: {
      iconGradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-500",
      buttonGradient: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      successGradient: "from-blue-500 to-cyan-500",
      cardBg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      cardBorder: "border-blue-200 dark:border-blue-800",
    },
  },
  fitness: {
    title: "Plan Your Fitness Activity",
    description: "Get fit together with your workout buddies",
    namePlaceholder: "e.g., Morning Yoga Group",
    descriptionPlaceholder: "e.g., Daily fitness sessions in the park",
    locationPlaceholder: "e.g., Local park, Gym",
    eventTypes: [
      { value: "fitness_bootcamp", label: "Fitness Bootcamp" },
      { value: "yoga_session", label: "Yoga Session" },
      { value: "marathon_run", label: "Marathon / Run" },
      { value: "gym_meetup", label: "Gym Meetup" },
    ],
    defaultEventType: "fitness_bootcamp",
    colors: {
      iconGradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-500",
      buttonGradient: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
      successGradient: "from-green-500 to-emerald-500",
      cardBg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
      cardBorder: "border-green-200 dark:border-green-800",
    },
  },
  trek: {
    title: "Plan Your Trek",
    description: "Adventure awaits! Plan your next expedition",
    namePlaceholder: "e.g., Himalayan Trek 2025",
    descriptionPlaceholder: "e.g., 5-day trek to base camp",
    locationPlaceholder: "e.g., Kedarnath, Triund",
    eventTypes: [
      { value: "trekking", label: "Trekking" },
      { value: "adventure_trip", label: "Adventure Trip" },
      { value: "camping", label: "Camping" },
    ],
    defaultEventType: "trekking",
    colors: {
      iconGradient: "from-emerald-500 to-teal-500",
      iconColor: "text-emerald-500",
      buttonGradient: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
      successGradient: "from-emerald-500 to-teal-500",
      cardBg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      cardBorder: "border-emerald-200 dark:border-emerald-800",
    },
  },
  sports: {
    title: "Plan Your Sports Event",
    description: "Organize matches and tournaments with your team",
    namePlaceholder: "e.g., Weekend Cricket League",
    descriptionPlaceholder: "e.g., Friendly match between office teams",
    locationPlaceholder: "e.g., Sports complex, Stadium",
    eventTypes: [
      { value: "sports_event", label: "Sports Event" },
      { value: "cricket_match", label: "Cricket Match" },
      { value: "football_match", label: "Football Match" },
      { value: "tournament", label: "Tournament" },
    ],
    defaultEventType: "sports_event",
    colors: {
      iconGradient: "from-red-500 to-orange-500",
      iconColor: "text-red-500",
      buttonGradient: "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
      successGradient: "from-red-500 to-orange-500",
      cardBg: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
      cardBorder: "border-red-200 dark:border-red-800",
    },
  },
};

const DEFAULT_FORM_CONTENT = {
  title: "Create Planning Group",
  description: "Start planning your event together with friends and family",
  namePlaceholder: "e.g., Raj's Birthday Bash Planning",
  descriptionPlaceholder: "What are we planning?",
  locationPlaceholder: "e.g., Mumbai",
  eventTypes: [
    { value: "college_reunion", label: "College Reunion" },
    { value: "birthday_party", label: "Birthday Party" },
    { value: "wedding", label: "Wedding" },
    { value: "group_ride", label: "Group Ride" },
    { value: "trekking", label: "Trekking" },
    { value: "sports_event", label: "Sports Event" },
    { value: "other", label: "Other" },
  ],
  defaultEventType: "",
  colors: {
    iconGradient: "from-orange-500 to-amber-500",
    iconColor: "text-orange-500",
    buttonGradient: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
    successGradient: "from-orange-500 to-amber-500",
    cardBg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    cardBorder: "border-orange-200 dark:border-orange-800",
  },
};

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
  const { toast } = useToast();
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventTypeConfig | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  
  // Create form state
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createFormCategory, setCreateFormCategory] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<{ id: string; name: string; inviteCode: string } | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "",
    eventDate: "",
    locationPreference: "",
    budget: "",
  });

  const openEventDialog = (config: EventTypeConfig) => {
    setSelectedEventType(config);
    setInviteCode("");
    setEventDialogOpen(true);
  };
  
  // Open create form with category context
  const openCreateForm = (category: string) => {
    const content = FORM_CONTENT[category] || DEFAULT_FORM_CONTENT;
    setCreateFormCategory(category);
    setFormData({
      name: "",
      description: "",
      eventType: content.defaultEventType,
      eventDate: "",
      locationPreference: "",
      budget: "",
    });
    setCreatedGroup(null);
    setEventDialogOpen(false); // Close the event type dialog
    setCreateFormOpen(true);
  };
  
  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("/api/groups", "POST", {
        name: data.name,
        description: data.description || null,
        eventType: data.eventType || null,
        eventDate: data.eventDate || null,
        locationPreference: data.locationPreference || null,
        budget: data.budget ? parseInt(data.budget) : null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedGroup({
        id: data.id,
        name: data.name,
        inviteCode: data.inviteCode,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    },
  });
  
  // AI Description Generator for group creation
  const generateAIDescription = async () => {
    if (!formData.name) {
      toast({
        title: "Need more info",
        description: "Please enter a group name first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/ai/event-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventTitle: formData.name,
          eventType: formData.eventType || createFormCategory,
          date: formData.eventDate,
          location: formData.locationPreference,
          existingDescription: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      setFormData({ ...formData, description: data.description });
      toast({
        title: "Description generated!",
        description: "AI has written a description for your event.",
      });
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Collect all validation errors
    const errors: string[] = [];
    
    // Validate name - required
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errors.push("Group name is required");
    } else if (!/[a-zA-Z]/.test(trimmedName)) {
      errors.push("Name must contain at least one letter");
    }
    
    // Validate event date - required
    if (!formData.eventDate) {
      errors.push("Event date is required");
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push("Event date must be today or a future date");
      }
    }
    
    // Validate location - required
    const trimmedLocation = formData.locationPreference.trim();
    if (!trimmedLocation) {
      errors.push("Location is required");
    } else if (!/[a-zA-Z]/.test(trimmedLocation)) {
      errors.push("Location must contain letters, not just numbers");
    }
    
    // Validate description - optional but reject HTML/script tags if provided
    const trimmedDescription = formData.description.trim();
    if (trimmedDescription) {
      const htmlTagPattern = /<[^>]*>/;
      if (htmlTagPattern.test(trimmedDescription)) {
        errors.push("Description cannot contain HTML tags or special code");
      }
    }
    
    // Validate budget - optional but must be valid if provided
    if (formData.budget) {
      const budgetValue = parseFloat(formData.budget);
      if (isNaN(budgetValue) || budgetValue < 0) {
        errors.push("Budget must be a positive number");
      }
    }
    
    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: "Please fill required fields",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }
    
    createGroupMutation.mutate(formData);
  };
  
  const copyInviteCode = () => {
    if (createdGroup?.inviteCode) {
      navigator.clipboard.writeText(createdGroup.inviteCode);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    }
  };
  
  const shareViaWhatsApp = () => {
    if (createdGroup) {
      const message = `Join my ${createdGroup.name} planning group on Myzymo! Use invite code: ${createdGroup.inviteCode}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }
  };
  
  const closeCreateForm = () => {
    // If a group was created, navigate to its detail page
    if (createdGroup) {
      const groupId = createdGroup.id;
      setCreateFormOpen(false);
      setCreateFormCategory(null);
      setCreatedGroup(null);
      setFormData({
        name: "",
        description: "",
        eventType: "",
        eventDate: "",
        locationPreference: "",
        budget: "",
      });
      setLocation(`/groups/${groupId}`);
    } else {
      setCreateFormOpen(false);
      setCreateFormCategory(null);
      setCreatedGroup(null);
      setFormData({
        name: "",
        description: "",
        eventType: "",
        eventDate: "",
        locationPreference: "",
        budget: "",
      });
    }
  };
  
  // Helper to get current form colors
  const getFormColors = () => {
    if (createFormCategory && FORM_CONTENT[createFormCategory]) {
      return FORM_CONTENT[createFormCategory].colors;
    }
    return DEFAULT_FORM_CONTENT.colors;
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
    <>
      {/* Mobile Dashboard - Swiggy-inspired layout */}
      <div className="md:hidden">
        <MobileDashboard 
          onOpenEventDialog={openEventDialog}
          privateEvents={privateEvents}
          publicEvents={publicEvents}
          groups={groups}
        />
        <Navbar />
      </div>
      
      {/* Desktop Dashboard */}
      <div className="hidden md:block min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pb-8">
        {/* Welcome Banner - Enhanced Hero Design with Floating Icons */}
        <div className="mb-6 relative overflow-hidden rounded-2xl shadow-xl">
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
          
          <div className="relative z-10 pt-3 pb-4 px-4 md:pt-4 md:pb-5 md:px-6 min-h-[100px] md:min-h-[130px] flex items-center">
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
                  className="text-center bg-gradient-to-br from-purple-500/30 to-violet-500/30 backdrop-blur-sm border border-purple-300/40 rounded-xl p-2 md:p-4 w-[72px] md:w-[90px] h-[56px] md:h-[76px] flex flex-col justify-center"
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
      </div>
      
      {/* Floating Free Quote Button - Cute FAB - Desktop only */}
      <button
        onClick={() => setQuoteDialogOpen(true)}
        data-testid="fab-free-quote"
        className="hidden md:flex fixed right-4 md:right-8 bottom-24 md:bottom-8 z-40 group items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
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
                    openCreateForm(selectedEventType.type);
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

      {/* Create Form Dialog - Opens on Dashboard */}
      <Dialog open={createFormOpen} onOpenChange={(open) => {
        if (!open) closeCreateForm();
      }}>
        <DialogContent className="max-w-md" data-testid="dialog-create-form">
          {createdGroup ? (
            // Success Screen with themed colors
            <div className="text-center py-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${getFormColors().successGradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Group Created!</h3>
              <p className="text-muted-foreground mb-6">
                Share the invite code with friends to start planning together
              </p>
              
              {/* Invite Code Display with themed colors */}
              <div className={`bg-gradient-to-br ${getFormColors().cardBg} ${getFormColors().cardBorder} border rounded-xl p-4 mb-4`}>
                <div className="text-sm text-muted-foreground mb-1">Invite Code</div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-2xl font-bold tracking-wider ${getFormColors().iconColor}`}>
                    {createdGroup.inviteCode}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyInviteCode}
                    data-testid="button-copy-invite"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Share Options */}
              <div className="flex gap-3 mb-4">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  onClick={shareViaWhatsApp}
                  data-testid="button-share-whatsapp"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via WhatsApp
                </Button>
              </div>
              
              {/* Continue to Event - Navigate to group page */}
              <Button 
                className={`w-full bg-gradient-to-r ${getFormColors().buttonGradient}`}
                onClick={closeCreateForm}
                data-testid="button-save-close"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue to Event
              </Button>
            </div>
          ) : (
            // Create Form with themed colors
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`p-1.5 bg-gradient-to-br ${getFormColors().iconGradient} rounded-lg`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  {createFormCategory && FORM_CONTENT[createFormCategory] 
                    ? FORM_CONTENT[createFormCategory].title 
                    : DEFAULT_FORM_CONTENT.title}
                </DialogTitle>
                <DialogDescription>
                  {createFormCategory && FORM_CONTENT[createFormCategory] 
                    ? FORM_CONTENT[createFormCategory].description 
                    : DEFAULT_FORM_CONTENT.description}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Name *</Label>
                  <Input
                    id="group-name"
                    placeholder={createFormCategory && FORM_CONTENT[createFormCategory] 
                      ? FORM_CONTENT[createFormCategory].namePlaceholder 
                      : DEFAULT_FORM_CONTENT.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-group-name"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="group-description">Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIDescription}
                      disabled={isGeneratingDescription}
                      className="gap-1.5 text-xs h-7 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 dark:hover:bg-orange-950/50"
                      data-testid="button-ai-write-description"
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Writing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-orange-500" />
                          AI Write
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="group-description"
                    placeholder={createFormCategory && FORM_CONTENT[createFormCategory] 
                      ? FORM_CONTENT[createFormCategory].descriptionPlaceholder 
                      : DEFAULT_FORM_CONTENT.descriptionPlaceholder + " or click 'AI Write' to generate"}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                    rows={3}
                    data-testid="input-group-description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                    >
                      <SelectTrigger id="event-type" data-testid="select-event-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(createFormCategory && FORM_CONTENT[createFormCategory] 
                          ? FORM_CONTENT[createFormCategory].eventTypes 
                          : DEFAULT_FORM_CONTENT.eventTypes
                        ).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="event-date">Event Date *</Label>
                    <Input
                      id="event-date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      data-testid="input-event-date"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Preferred Location *</Label>
                    <Input
                      id="location"
                      placeholder={createFormCategory && FORM_CONTENT[createFormCategory] 
                        ? FORM_CONTENT[createFormCategory].locationPlaceholder 
                        : DEFAULT_FORM_CONTENT.locationPlaceholder}
                      value={formData.locationPreference}
                      onChange={(e) => setFormData({ ...formData, locationPreference: e.target.value })}
                      data-testid="input-location"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="budget">Budget (INR)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      placeholder="e.g., 50000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      data-testid="input-budget"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full bg-gradient-to-r ${getFormColors().buttonGradient}`}
                  disabled={createGroupMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
