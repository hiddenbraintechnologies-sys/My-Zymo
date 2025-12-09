import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import overviewBg from "@assets/stock_images/dashboard_overview_s_4a588ad5.jpg";
import pollsBg from "@assets/stock_images/voting_ballot_poll_d_7ec70ade.jpg";
import itineraryBg from "@assets/stock_images/calendar_schedule_pl_e91332c5.jpg";
import membersBg from "@assets/stock_images/team_members_people__7009dec8.jpg";
import expensesBg from "@assets/stock_images/money_budget_expense_f5d2b625.jpg";
import dateBg from "@assets/stock_images/calendar_date_event__81a53008.jpg";
import locationBg from "@assets/stock_images/location_map_pin_des_5d18dfbb.jpg";
import budgetBg from "@assets/stock_images/indian_rupee_money_c_c599aff9.jpg";
import statsMembersBg from "@assets/stock_images/friends_group_people_76ba475f.jpg";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Plus, ArrowLeft, Calendar, MapPin, IndianRupee, Upload, Palette,
  Settings, Vote, ClipboardList, UserCog, Image, MessageSquare, Mail, Link2,
  ChevronRight, Share2, QrCode, Copy, LogOut, Sparkles, Clock, Target,
  Check, X, Edit, Trash2, Crown, UserPlus, Star, MoreVertical, AlertCircle, ImagePlus, Split,
  Download, FileSpreadsheet, Send, Store, Utensils, Car, Camera, Music, PartyPopper
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiWhatsapp } from "react-icons/si";
import type { EventGroup, EventGroupMember, User, GroupPoll, GroupPollOption, GroupPollVote, GroupItineraryItem, GroupExpense, GroupExpenseSplit, Vendor } from "@shared/schema";
import { ITINERARY_VENDOR_MAPPING } from "@shared/schema";

type ExpenseWithSplits = GroupExpense & { 
  paidBy: User; 
  splits: (GroupExpenseSplit & { user: User })[] 
};

type GroupMemberWithUser = EventGroupMember & { user: User };

type GroupPollWithDetails = GroupPoll & {
  options: (GroupPollOption & { voteCount: number; voters?: User[] })[];
  totalVotes: number;
  userVote?: string;
};

type GroupWithFullDetails = EventGroup & {
  memberCount: number;
  members: GroupMemberWithUser[];
  polls?: GroupPollWithDetails[];
  itinerary?: GroupItineraryItem[];
  expenses?: ExpenseWithSplits[];
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", icon: Crown, description: "Full access to manage group" },
  { value: "treasurer", label: "Treasurer", icon: IndianRupee, description: "Manage expenses and budget" },
  { value: "planner", label: "Event Planner", icon: ClipboardList, description: "Plan and organize activities" },
  { value: "venue_manager", label: "Venue Manager", icon: MapPin, description: "Handle venue arrangements" },
  { value: "food_manager", label: "Food Manager", icon: Star, description: "Coordinate food and catering" },
  { value: "transport_manager", label: "Transport Manager", icon: ChevronRight, description: "Manage transportation" },
  { value: "member", label: "Member", icon: Users, description: "Regular group member" },
];

const STATUS_COLORS = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

// Comprehensive theme color options with wide variety
const THEME_COLORS = {
  gradients: [
    { id: "orange-amber", name: "Sunset Orange", gradient: "from-orange-500 via-amber-500 to-orange-600", preview: "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" },
    { id: "pink-rose", name: "Rose Garden", gradient: "from-pink-500 via-rose-500 to-pink-600", preview: "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600" },
    { id: "purple-violet", name: "Royal Purple", gradient: "from-purple-500 via-violet-500 to-purple-600", preview: "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" },
    { id: "blue-cyan", name: "Ocean Blue", gradient: "from-blue-500 via-cyan-500 to-blue-600", preview: "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600" },
    { id: "teal-emerald", name: "Forest Teal", gradient: "from-teal-500 via-emerald-500 to-teal-600", preview: "bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" },
    { id: "green-lime", name: "Spring Green", gradient: "from-green-500 via-lime-500 to-green-600", preview: "bg-gradient-to-r from-green-500 via-lime-500 to-green-600" },
    { id: "red-rose", name: "Cherry Red", gradient: "from-red-500 via-rose-500 to-red-600", preview: "bg-gradient-to-r from-red-500 via-rose-500 to-red-600" },
    { id: "indigo-blue", name: "Deep Indigo", gradient: "from-indigo-500 via-blue-500 to-indigo-600", preview: "bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" },
    { id: "fuchsia-pink", name: "Neon Fuchsia", gradient: "from-fuchsia-500 via-pink-500 to-fuchsia-600", preview: "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-600" },
    { id: "amber-yellow", name: "Golden Sun", gradient: "from-amber-500 via-yellow-500 to-amber-600", preview: "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" },
    { id: "slate-gray", name: "Modern Slate", gradient: "from-slate-600 via-gray-500 to-slate-600", preview: "bg-gradient-to-r from-slate-600 via-gray-500 to-slate-600" },
    { id: "zinc-neutral", name: "Elegant Dark", gradient: "from-zinc-700 via-neutral-600 to-zinc-700", preview: "bg-gradient-to-r from-zinc-700 via-neutral-600 to-zinc-700" },
  ],
  solids: [
    { id: "red", name: "Red", hex: "#ef4444", preview: "bg-red-500" },
    { id: "orange", name: "Orange", hex: "#f97316", preview: "bg-orange-500" },
    { id: "amber", name: "Amber", hex: "#f59e0b", preview: "bg-amber-500" },
    { id: "yellow", name: "Yellow", hex: "#eab308", preview: "bg-yellow-500" },
    { id: "lime", name: "Lime", hex: "#84cc16", preview: "bg-lime-500" },
    { id: "green", name: "Green", hex: "#22c55e", preview: "bg-green-500" },
    { id: "emerald", name: "Emerald", hex: "#10b981", preview: "bg-emerald-500" },
    { id: "teal", name: "Teal", hex: "#14b8a6", preview: "bg-teal-500" },
    { id: "cyan", name: "Cyan", hex: "#06b6d4", preview: "bg-cyan-500" },
    { id: "sky", name: "Sky", hex: "#0ea5e9", preview: "bg-sky-500" },
    { id: "blue", name: "Blue", hex: "#3b82f6", preview: "bg-blue-500" },
    { id: "indigo", name: "Indigo", hex: "#6366f1", preview: "bg-indigo-500" },
    { id: "violet", name: "Violet", hex: "#8b5cf6", preview: "bg-violet-500" },
    { id: "purple", name: "Purple", hex: "#a855f7", preview: "bg-purple-500" },
    { id: "fuchsia", name: "Fuchsia", hex: "#d946ef", preview: "bg-fuchsia-500" },
    { id: "pink", name: "Pink", hex: "#ec4899", preview: "bg-pink-500" },
    { id: "rose", name: "Rose", hex: "#f43f5e", preview: "bg-rose-500" },
    { id: "slate", name: "Slate", hex: "#64748b", preview: "bg-slate-500" },
    { id: "gray", name: "Gray", hex: "#6b7280", preview: "bg-gray-500" },
    { id: "zinc", name: "Zinc", hex: "#71717a", preview: "bg-zinc-500" },
  ],
};

// Event type specific themes matching dashboard colors
const EVENT_TYPE_THEMES: Record<string, {
  gradient: string;
  buttonGradient: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  tabActive: string;
  accentLight: string;
  accentDark: string;
}> = {
  // Reunion types - Purple/Pink theme
  college_reunion: {
    gradient: "from-purple-500 via-pink-500 to-purple-600",
    buttonGradient: "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    iconColor: "text-purple-500",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50",
    badgeText: "text-purple-700 dark:text-purple-300",
    cardBg: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
    cardBorder: "border-purple-200 dark:border-purple-800",
    tabActive: "data-[state=active]:bg-purple-500",
    accentLight: "purple-500",
    accentDark: "purple-400",
  },
  school_reunion: {
    gradient: "from-purple-500 via-pink-500 to-purple-600",
    buttonGradient: "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    iconColor: "text-purple-500",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50",
    badgeText: "text-purple-700 dark:text-purple-300",
    cardBg: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
    cardBorder: "border-purple-200 dark:border-purple-800",
    tabActive: "data-[state=active]:bg-purple-500",
    accentLight: "purple-500",
    accentDark: "purple-400",
  },
  // Group ride types - Blue/Cyan theme
  group_ride: {
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    buttonGradient: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    badgeText: "text-blue-700 dark:text-blue-300",
    cardBg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    cardBorder: "border-blue-200 dark:border-blue-800",
    tabActive: "data-[state=active]:bg-blue-500",
    accentLight: "blue-500",
    accentDark: "blue-400",
  },
  bike_rally: {
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    buttonGradient: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    badgeText: "text-blue-700 dark:text-blue-300",
    cardBg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    cardBorder: "border-blue-200 dark:border-blue-800",
    tabActive: "data-[state=active]:bg-blue-500",
    accentLight: "blue-500",
    accentDark: "blue-400",
  },
  cycling_trip: {
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    buttonGradient: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-100 dark:bg-blue-900/50",
    badgeText: "text-blue-700 dark:text-blue-300",
    cardBg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    cardBorder: "border-blue-200 dark:border-blue-800",
    tabActive: "data-[state=active]:bg-blue-500",
    accentLight: "blue-500",
    accentDark: "blue-400",
  },
  // Fitness types - Green/Emerald theme
  fitness_bootcamp: {
    gradient: "from-green-500 via-emerald-500 to-green-600",
    buttonGradient: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    iconColor: "text-green-500",
    badgeBg: "bg-green-100 dark:bg-green-900/50",
    badgeText: "text-green-700 dark:text-green-300",
    cardBg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    cardBorder: "border-green-200 dark:border-green-800",
    tabActive: "data-[state=active]:bg-green-500",
    accentLight: "green-500",
    accentDark: "green-400",
  },
  yoga_session: {
    gradient: "from-green-500 via-emerald-500 to-green-600",
    buttonGradient: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    iconColor: "text-green-500",
    badgeBg: "bg-green-100 dark:bg-green-900/50",
    badgeText: "text-green-700 dark:text-green-300",
    cardBg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    cardBorder: "border-green-200 dark:border-green-800",
    tabActive: "data-[state=active]:bg-green-500",
    accentLight: "green-500",
    accentDark: "green-400",
  },
  marathon_run: {
    gradient: "from-green-500 via-emerald-500 to-green-600",
    buttonGradient: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    iconColor: "text-green-500",
    badgeBg: "bg-green-100 dark:bg-green-900/50",
    badgeText: "text-green-700 dark:text-green-300",
    cardBg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    cardBorder: "border-green-200 dark:border-green-800",
    tabActive: "data-[state=active]:bg-green-500",
    accentLight: "green-500",
    accentDark: "green-400",
  },
  gym_meetup: {
    gradient: "from-green-500 via-emerald-500 to-green-600",
    buttonGradient: "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
    iconColor: "text-green-500",
    badgeBg: "bg-green-100 dark:bg-green-900/50",
    badgeText: "text-green-700 dark:text-green-300",
    cardBg: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    cardBorder: "border-green-200 dark:border-green-800",
    tabActive: "data-[state=active]:bg-green-500",
    accentLight: "green-500",
    accentDark: "green-400",
  },
  // Trek types - Emerald/Teal theme
  trekking: {
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    buttonGradient: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    cardBg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    cardBorder: "border-emerald-200 dark:border-emerald-800",
    tabActive: "data-[state=active]:bg-emerald-500",
    accentLight: "emerald-500",
    accentDark: "emerald-400",
  },
  adventure_trip: {
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    buttonGradient: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    cardBg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    cardBorder: "border-emerald-200 dark:border-emerald-800",
    tabActive: "data-[state=active]:bg-emerald-500",
    accentLight: "emerald-500",
    accentDark: "emerald-400",
  },
  camping: {
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    buttonGradient: "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    cardBg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    cardBorder: "border-emerald-200 dark:border-emerald-800",
    tabActive: "data-[state=active]:bg-emerald-500",
    accentLight: "emerald-500",
    accentDark: "emerald-400",
  },
  // Sports types - Red/Orange theme
  sports_event: {
    gradient: "from-red-500 via-orange-500 to-red-600",
    buttonGradient: "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100 dark:bg-red-900/50",
    badgeText: "text-red-700 dark:text-red-300",
    cardBg: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    cardBorder: "border-red-200 dark:border-red-800",
    tabActive: "data-[state=active]:bg-red-500",
    accentLight: "red-500",
    accentDark: "red-400",
  },
  cricket_match: {
    gradient: "from-red-500 via-orange-500 to-red-600",
    buttonGradient: "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100 dark:bg-red-900/50",
    badgeText: "text-red-700 dark:text-red-300",
    cardBg: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    cardBorder: "border-red-200 dark:border-red-800",
    tabActive: "data-[state=active]:bg-red-500",
    accentLight: "red-500",
    accentDark: "red-400",
  },
  football_match: {
    gradient: "from-red-500 via-orange-500 to-red-600",
    buttonGradient: "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100 dark:bg-red-900/50",
    badgeText: "text-red-700 dark:text-red-300",
    cardBg: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    cardBorder: "border-red-200 dark:border-red-800",
    tabActive: "data-[state=active]:bg-red-500",
    accentLight: "red-500",
    accentDark: "red-400",
  },
  tournament: {
    gradient: "from-red-500 via-orange-500 to-red-600",
    buttonGradient: "from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100 dark:bg-red-900/50",
    badgeText: "text-red-700 dark:text-red-300",
    cardBg: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    cardBorder: "border-red-200 dark:border-red-800",
    tabActive: "data-[state=active]:bg-red-500",
    accentLight: "red-500",
    accentDark: "red-400",
  },
};

// Default theme (orange/amber for generic events)
const DEFAULT_EVENT_THEME = {
  gradient: "from-orange-500 via-amber-500 to-orange-600",
  buttonGradient: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
  iconColor: "text-orange-500",
  badgeBg: "bg-orange-100 dark:bg-orange-900/50",
  badgeText: "text-orange-700 dark:text-orange-300",
  cardBg: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
  cardBorder: "border-orange-200 dark:border-orange-800",
  tabActive: "data-[state=active]:bg-orange-500",
  accentLight: "orange-500",
  accentDark: "orange-400",
};

// Helper to get theme based on event type
function getEventTypeTheme(eventType: string | null | undefined) {
  if (!eventType) return DEFAULT_EVENT_THEME;
  return EVENT_TYPE_THEMES[eventType] || DEFAULT_EVENT_THEME;
}

// Helper function to get banner gradient/color classes
function getBannerStyles(themeColor: string | null | undefined, eventType?: string | null): { gradientClass: string; hasCustomImage: boolean } {
  // If there's a custom theme color set, use it
  if (themeColor) {
    // Check if it's a gradient
    const gradient = THEME_COLORS.gradients.find(g => g.id === themeColor);
    if (gradient) {
      return { gradientClass: `bg-gradient-to-r ${gradient.gradient}`, hasCustomImage: false };
    }
    
    // Check if it's a solid color
    const solid = THEME_COLORS.solids.find(s => s.id === themeColor);
    if (solid) {
      return { gradientClass: solid.preview, hasCustomImage: false };
    }
    
    // Check if it's a hex color (custom)
    if (themeColor.startsWith("#")) {
      return { gradientClass: "", hasCustomImage: false };
    }
  }
  
  // Use event type theme as fallback
  const theme = getEventTypeTheme(eventType);
  return { gradientClass: `bg-gradient-to-r ${theme.gradient}`, hasCustomImage: false };
}

export default function GroupDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/groups/:id");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [selectedThemeColor, setSelectedThemeColor] = useState<string>("");
  const [customHexColor, setCustomHexColor] = useState("#f97316");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [colorPickerTab, setColorPickerTab] = useState<"gradients" | "solids" | "custom">("gradients");

  const groupId = params?.id;

  // Fetch group details
  const { data: group, isLoading: groupLoading, error } = useQuery<GroupWithFullDetails>({
    queryKey: ["/api/groups", groupId],
    enabled: !!user && !!groupId,
  });

  // Fetch polls
  const { data: polls } = useQuery<GroupPollWithDetails[]>({
    queryKey: ["/api/groups", groupId, "polls"],
    enabled: !!user && !!groupId,
  });

  // Fetch itinerary
  const { data: itinerary } = useQuery<GroupItineraryItem[]>({
    queryKey: ["/api/groups", groupId, "itinerary"],
    enabled: !!user && !!groupId,
  });

  // Fetch expenses
  const { data: expenses } = useQuery<ExpenseWithSplits[]>({
    queryKey: ["/api/groups", groupId, "expenses"],
    enabled: !!user && !!groupId,
  });

  // Get theme based on event type for consistent styling
  const eventTheme = useMemo(() => {
    return getEventTypeTheme(group?.eventType);
  }, [group?.eventType]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      toast({
        title: "Invite code copied!",
        description: `Share "${group.inviteCode}" with others.`,
      });
    }
  };

  const copyInviteLink = () => {
    if (group?.inviteCode) {
      const joinUrl = `${window.location.origin}/groups?join=${group.inviteCode}`;
      navigator.clipboard.writeText(joinUrl);
      toast({
        title: "Link copied!",
        description: "Invite link copied to clipboard",
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (!group) return;
    
    const joinUrl = `${window.location.origin}/groups?join=${group.inviteCode}`;
    const eventDate = group.eventDate ? format(new Date(group.eventDate), 'PPP') : 'TBD';
    const location = group.locationPreference || 'TBD';
    
    const message = `You're invited to join our group planning on Myzymo!

${group.name}
${group.eventType ? `${group.eventType.replace(/_/g, ' ')}` : ''}
${eventDate}
${location}

Join with code: ${group.inviteCode}
Or click: ${joinUrl}

Let's plan together!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    if (!group) return;
    
    const joinUrl = `${window.location.origin}/groups?join=${group.inviteCode}`;
    const eventDate = group.eventDate ? format(new Date(group.eventDate), 'PPP') : 'TBD';
    const location = group.locationPreference || 'TBD';
    
    const subject = `You're invited to join "${group.name}" on Myzymo!`;
    const body = `Hi there!

You're invited to join our group planning on Myzymo!

Event: ${group.name}
${group.eventType ? `Type: ${group.eventType.replace(/_/g, ' ')}` : ''}
Date: ${eventDate}
Location: ${location}

Join with invite code: ${group.inviteCode}
Or click this link: ${joinUrl}

Looking forward to planning together!`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Customization mutation
  const customizeMutation = useMutation({
    mutationFn: async (data: { themeColor?: string; bannerImageUrl?: string }) => {
      const res = await apiRequest(`/api/groups/${groupId}`, "PATCH", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId] });
      toast({ title: "Customization saved!", description: "Your group banner has been updated." });
      setCustomizeDialogOpen(false);
      setBannerFile(null);
      setBannerPreviewUrl(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save customization", variant: "destructive" });
    },
  });

  // Handle banner file selection
  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 5MB", variant: "destructive" });
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload banner and save customization
  const handleSaveCustomization = async () => {
    setIsUploadingBanner(true);
    try {
      let bannerImageUrl: string | undefined;

      if (bannerFile) {
        // Get signed upload URL
        const uploadRes = await fetch(`/api/upload/signed-url?filename=${encodeURIComponent(bannerFile.name)}&contentType=${encodeURIComponent(bannerFile.type)}`);
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Failed to get upload URL");
        }
        const { signedUrl, fileUrl } = uploadData;

        // Upload to storage
        const uploadToStorageRes = await fetch(signedUrl, {
          method: "PUT",
          body: bannerFile,
          headers: { "Content-Type": bannerFile.type },
        });
        
        if (!uploadToStorageRes.ok) {
          throw new Error("Failed to upload image to storage");
        }
        
        bannerImageUrl = fileUrl;
      }

      // Determine which color to use based on current tab
      let themeColorToSave: string;
      if (colorPickerTab === "custom") {
        // Always use the custom hex color when on custom tab
        themeColorToSave = customHexColor;
      } else if (colorPickerTab === "solids" && selectedThemeColor) {
        // Use selected solid color
        themeColorToSave = selectedThemeColor;
      } else if (colorPickerTab === "gradients" && selectedThemeColor) {
        // Use selected gradient
        themeColorToSave = selectedThemeColor;
      } else {
        // Fallback to default orange-amber gradient
        themeColorToSave = "orange-amber";
      }

      await customizeMutation.mutateAsync({ 
        themeColor: themeColorToSave, 
        bannerImageUrl 
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload banner", variant: "destructive" });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Initialize selected theme when dialog opens
  const openCustomizeDialog = () => {
    if (group?.themeColor) {
      setSelectedThemeColor(group.themeColor);
      if (group.themeColor.startsWith("#")) {
        setCustomHexColor(group.themeColor);
        setColorPickerTab("custom");
      } else if (THEME_COLORS.solids.some(s => s.id === group.themeColor)) {
        setColorPickerTab("solids");
      } else {
        setColorPickerTab("gradients");
      }
    }
    if (group?.bannerImageUrl) {
      setBannerPreviewUrl(group.bannerImageUrl);
    }
    setCustomizeDialogOpen(true);
  };

  if (authLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Group Not Found</h2>
        <p className="text-muted-foreground mb-4">The group you're looking for doesn't exist or you don't have access.</p>
        <Link href="/groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );
  }

  const isAdmin = group.members?.some(m => m.userId === user.id && m.role === "admin");
  const isCreator = group.createdById === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/events?category=${group.eventType || 'all'}`} data-testid="link-back-events">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard" data-testid="link-home">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1">
                <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {group.inviteCode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    data-testid="button-share-menu"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={shareViaWhatsApp} data-testid="button-share-whatsapp">
                    <SiWhatsapp className="w-4 h-4 mr-2 text-green-500" />
                    Share via WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareViaEmail} data-testid="button-share-email">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    Share via Email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={copyInviteLink} data-testid="button-copy-link">
                    <Link2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyInviteCode} data-testid="button-copy-invite">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Invite Code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {(isAdmin || isCreator) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-group-menu">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openCustomizeDialog} data-testid="button-customize-group">
                    <Palette className="w-4 h-4 mr-2" />
                    Customize Banner
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Group Header Banner - Dashboard-style with background image and floating icons */}
        <div 
          className="relative overflow-hidden rounded-2xl shadow-xl mb-6"
        >
          {/* Background Image Layer - event type specific or custom */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${
                group.bannerImageUrl || 
                (group.eventType && EVENT_TYPE_BACKGROUNDS[group.eventType]) || 
                overviewBg
              })` 
            }}
          />
          
          {/* Gradient Overlay - based on theme color */}
          <div 
            className={`absolute inset-0 ${
              group.bannerImageUrl 
                ? "bg-gradient-to-r from-black/70 via-black/50 to-black/40"
                : `bg-gradient-to-r ${getBannerStyles(group.themeColor, group.eventType).gradientClass} opacity-85`
            }`}
            style={
              group.themeColor?.startsWith("#") && !group.bannerImageUrl
                ? { background: `linear-gradient(to right, ${group.themeColor}e0, ${group.themeColor}b0, ${group.themeColor}90)` }
                : undefined
            }
          />
          
          {/* Pattern overlay for added texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
          
          {/* Floating Decorative Icons - Dashboard style */}
          <div className="absolute top-4 left-4 md:top-6 md:left-8 z-10">
            <div className={`bg-gradient-to-br ${eventTheme.gradient} backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce`} style={{ animationDuration: '3s' }}>
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
              <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-10 hidden sm:block">
            <div className="bg-gradient-to-br from-amber-500/30 to-yellow-500/30 backdrop-blur-sm rounded-xl p-2 border border-white/20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 p-6 md:p-8 min-h-[200px] md:min-h-[240px]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                {/* Category Badge */}
                <div className="mb-3 inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-white">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  {group.eventType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Group Planning'}
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-white/20 backdrop-blur border-0 text-white text-xs">
                    {group.status}
                  </Badge>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-heading font-bold mb-3 text-white drop-shadow-lg" data-testid="text-group-name">
                  {group.name}
                </h1>
                
                {group.description && (
                  <p className="text-white/90 max-w-2xl text-sm md:text-base leading-relaxed">{group.description}</p>
                )}
              </div>
              
              {group.inviteCode && (
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 text-center min-w-[180px] border border-white/20 shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-sm text-white/80 mb-2">
                    <Link2 className="w-3.5 h-3.5" />
                    Invite Code
                  </div>
                  <div className="font-mono text-2xl font-bold tracking-widest mb-3 text-white" data-testid="text-invite-code">
                    {group.inviteCode}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const joinUrl = `${window.location.origin}/groups?join=${group.inviteCode}`;
                      navigator.clipboard.writeText(joinUrl);
                      toast({
                        title: "Link copied!",
                        description: "Invite link copied to clipboard",
                      });
                    }}
                    className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs gap-1.5"
                    data-testid="button-copy-invite-link"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Stats Cards - Dashboard Style Grid with Background Images */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-2">
          {group.eventDate && (
            <Card className="hover-elevate overflow-hidden relative border-2 border-blue-200 dark:border-blue-800 shadow-md">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${dateBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/60 to-blue-900/30" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-sky-500 rounded-xl shadow-md">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xs text-blue-200 font-medium">Event Date</div>
                <div className="font-bold text-white text-sm mt-0.5">{format(new Date(group.eventDate), "PPP")}</div>
              </CardContent>
            </Card>
          )}
          {group.locationPreference && (
            <Card className="hover-elevate overflow-hidden relative border-2 border-emerald-200 dark:border-emerald-800 shadow-md">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${locationBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/60 to-emerald-900/30" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xs text-emerald-200 font-medium">Location</div>
                <div className="font-bold text-white text-sm mt-0.5 truncate">{group.locationPreference}</div>
              </CardContent>
            </Card>
          )}
          {group.budget && (
            <Card className="hover-elevate overflow-hidden relative border-2 border-orange-200 dark:border-orange-800 shadow-md">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${budgetBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-900/60 to-orange-900/30" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md">
                    <IndianRupee className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xs text-orange-200 font-medium">Budget</div>
                <div className="font-bold text-white text-sm mt-0.5">{Number(group.budget).toLocaleString("en-IN")}</div>
              </CardContent>
            </Card>
          )}
          <Card className="hover-elevate overflow-hidden relative border-2 border-purple-200 dark:border-purple-800 shadow-md">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${statsMembersBg})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/60 to-purple-900/30" />
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-xs text-purple-200 font-medium">Members</div>
              <div className="font-bold text-white text-sm mt-0.5">{group.memberCount || group.members?.length || 1}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs - Enhanced styling */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-xl md:text-2xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Quick Access
            </h2>
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Interactive
            </Badge>
          </div>
          
          {/* Block Button Navigation - Dashboard Style */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {/* Overview Button */}
            <Card 
              className={`hover-elevate cursor-pointer overflow-hidden relative group border-2 transition-all ${
                activeTab === "overview" 
                  ? "border-orange-500 ring-2 ring-orange-500/30 shadow-lg scale-[1.02]" 
                  : "border-orange-200 dark:border-orange-800 shadow-md hover:shadow-lg"
              }`}
              onClick={() => setActiveTab("overview")}
              data-testid="tab-overview"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${overviewBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-900/60 to-orange-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-2.5 md:p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Overview</CardTitle>
                <CardDescription className="text-xs text-orange-200 hidden sm:block">
                  Quick summary
                </CardDescription>
                {activeTab === "overview" && (
                  <Badge className="mt-2 bg-orange-400/80 text-white text-[10px]">
                    <Check className="w-2.5 h-2.5 mr-1" />
                    Active
                  </Badge>
                )}
              </CardHeader>
            </Card>

            {/* Polls Button */}
            <Card 
              className={`hover-elevate cursor-pointer overflow-hidden relative group border-2 transition-all ${
                activeTab === "polls" 
                  ? "border-purple-500 ring-2 ring-purple-500/30 shadow-lg scale-[1.02]" 
                  : "border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg"
              }`}
              onClick={() => setActiveTab("polls")}
              data-testid="tab-polls"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${pollsBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/60 to-purple-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-2.5 md:p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <Vote className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Polls</CardTitle>
                <CardDescription className="text-xs text-purple-200 hidden sm:block">
                  Vote & decide
                </CardDescription>
                {activeTab === "polls" && (
                  <Badge className="mt-2 bg-purple-400/80 text-white text-[10px]">
                    <Check className="w-2.5 h-2.5 mr-1" />
                    Active
                  </Badge>
                )}
              </CardHeader>
            </Card>

            {/* Itinerary Button */}
            <Card 
              className={`hover-elevate cursor-pointer overflow-hidden relative group border-2 transition-all ${
                activeTab === "itinerary" 
                  ? "border-teal-500 ring-2 ring-teal-500/30 shadow-lg scale-[1.02]" 
                  : "border-teal-200 dark:border-teal-800 shadow-md hover:shadow-lg"
              }`}
              onClick={() => setItineraryDialogOpen(true)}
              data-testid="tab-itinerary"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${itineraryBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-teal-900/60 to-teal-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-2.5 md:p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Itinerary</CardTitle>
                <CardDescription className="text-xs text-teal-200 hidden sm:block">
                  Plan schedule
                </CardDescription>
                {activeTab === "itinerary" && (
                  <Badge className="mt-2 bg-teal-400/80 text-white text-[10px]">
                    <Check className="w-2.5 h-2.5 mr-1" />
                    Active
                  </Badge>
                )}
              </CardHeader>
            </Card>

            {/* Members Button */}
            <Card 
              className={`hover-elevate cursor-pointer overflow-hidden relative group border-2 transition-all ${
                activeTab === "members" 
                  ? "border-blue-500 ring-2 ring-blue-500/30 shadow-lg scale-[1.02]" 
                  : "border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg"
              }`}
              onClick={() => setActiveTab("members")}
              data-testid="tab-members"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${membersBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/60 to-blue-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-2.5 md:p-3 bg-gradient-to-br from-blue-400 to-sky-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <UserCog className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Members</CardTitle>
                <CardDescription className="text-xs text-blue-200 hidden sm:block">
                  Manage team
                </CardDescription>
                {activeTab === "members" && (
                  <Badge className="mt-2 bg-blue-400/80 text-white text-[10px]">
                    <Check className="w-2.5 h-2.5 mr-1" />
                    Active
                  </Badge>
                )}
              </CardHeader>
            </Card>

            {/* Expenses Button */}
            <Card 
              className={`hover-elevate cursor-pointer overflow-hidden relative group border-2 transition-all col-span-2 md:col-span-1 ${
                activeTab === "expenses" 
                  ? "border-green-500 ring-2 ring-green-500/30 shadow-lg scale-[1.02]" 
                  : "border-green-200 dark:border-green-800 shadow-md hover:shadow-lg"
              }`}
              onClick={() => setActiveTab("expenses")}
              data-testid="tab-expenses"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${expensesBg})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/60 to-green-900/30" />
              <CardHeader className="p-3 md:p-4 text-center relative z-10">
                <div className="mx-auto p-2.5 md:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-md mb-2 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <CardTitle className="text-sm md:text-base font-bold text-white">Expenses</CardTitle>
                <CardDescription className="text-xs text-green-200 hidden sm:block">
                  Split & track
                </CardDescription>
                {activeTab === "expenses" && (
                  <Badge className="mt-2 bg-green-400/80 text-white text-[10px]">
                    <Check className="w-2.5 h-2.5 mr-1" />
                    Active
                  </Badge>
                )}
              </CardHeader>
            </Card>
          </div>
          
          {/* Hidden TabsList for accessibility - keeps Tabs component working */}
          <TabsList className="hidden">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab group={group} polls={polls} itinerary={itinerary} expenses={expenses} theme={eventTheme} />
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls" className="space-y-6">
            <PollsTab groupId={groupId!} polls={polls} isAdmin={isAdmin || isCreator} theme={eventTheme} />
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <ItineraryTab groupId={groupId!} itinerary={itinerary} isAdmin={isAdmin || isCreator} groupLocation={group.locationPreference || undefined} theme={eventTheme} />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <MembersTab group={group} isAdmin={isAdmin || isCreator} theme={eventTheme} />
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab groupId={groupId!} group={group} expenses={expenses} members={group.members} isAdmin={isAdmin || isCreator} theme={eventTheme} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Customization Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange-500" />
              Customize Group Banner
            </DialogTitle>
            <DialogDescription>
              Upload a custom banner image or choose from our color themes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Banner Image Upload */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Custom Banner Image
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-4">
                {bannerPreviewUrl ? (
                  <div className="relative">
                    <img 
                      src={bannerPreviewUrl} 
                      alt="Banner preview" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setBannerPreviewUrl(null);
                        setBannerFile(null);
                      }}
                      data-testid="button-remove-banner"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerFileSelect}
                      data-testid="input-banner-upload"
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            {/* Color Theme Picker */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Theme Color
              </Label>
              
              {/* Color Picker Tabs */}
              <Tabs value={colorPickerTab} onValueChange={(v) => setColorPickerTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="gradients">Gradients</TabsTrigger>
                  <TabsTrigger value="solids">Solid Colors</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                {/* Gradients */}
                <TabsContent value="gradients" className="mt-0">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {THEME_COLORS.gradients.map((gradient) => (
                      <button
                        key={gradient.id}
                        type="button"
                        onClick={() => setSelectedThemeColor(gradient.id)}
                        className={`relative h-16 rounded-lg ${gradient.preview} transition-all ${
                          selectedThemeColor === gradient.id 
                            ? "ring-2 ring-offset-2 ring-primary" 
                            : "hover:scale-105"
                        }`}
                        data-testid={`color-gradient-${gradient.id}`}
                      >
                        {selectedThemeColor === gradient.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white drop-shadow-lg" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 right-1 text-xs text-white font-medium text-center drop-shadow-lg truncate">
                          {gradient.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                {/* Solid Colors */}
                <TabsContent value="solids" className="mt-0">
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {THEME_COLORS.solids.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedThemeColor(color.id)}
                        className={`relative h-10 w-10 rounded-full ${color.preview} transition-all ${
                          selectedThemeColor === color.id 
                            ? "ring-2 ring-offset-2 ring-primary scale-110" 
                            : "hover:scale-110"
                        }`}
                        title={color.name}
                        data-testid={`color-solid-${color.id}`}
                      >
                        {selectedThemeColor === color.id && (
                          <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                {/* Custom Hex Color Picker */}
                <TabsContent value="custom" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border-2"
                        style={{ backgroundColor: customHexColor }}
                      />
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="hex-color">Hex Color Code</Label>
                        <div className="flex gap-2">
                          <Input
                            id="hex-color"
                            type="text"
                            value={customHexColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                                setCustomHexColor(val);
                              }
                            }}
                            placeholder="#f97316"
                            className="font-mono"
                            data-testid="input-custom-hex"
                          />
                          <input
                            type="color"
                            value={customHexColor}
                            onChange={(e) => setCustomHexColor(e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                            data-testid="input-color-picker"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick color presets */}
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">Quick Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setCustomHexColor(hex)}
                            className={`w-8 h-8 rounded-full transition-all ${
                              customHexColor === hex ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"
                            }`}
                            style={{ backgroundColor: hex }}
                            data-testid={`color-preset-${hex}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Preview</Label>
              <div 
                className={`relative overflow-hidden rounded-xl p-4 text-white h-24 ${
                  bannerPreviewUrl ? "" : colorPickerTab === "custom" 
                    ? "" 
                    : getBannerStyles(selectedThemeColor).gradientClass || "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"
                }`}
                style={
                  bannerPreviewUrl 
                    ? { backgroundImage: `url(${bannerPreviewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : colorPickerTab === "custom"
                      ? { backgroundColor: customHexColor }
                      : undefined
                }
              >
                {bannerPreviewUrl && <div className="absolute inset-0 bg-black/40" />}
                <div className="relative">
                  <div className="text-lg font-bold">{group.name}</div>
                  <div className="text-sm text-white/80 mt-1">Your group banner preview</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setCustomizeDialogOpen(false)}
              data-testid="button-cancel-customize"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCustomization}
              disabled={isUploadingBanner || customizeMutation.isPending}
              className={`bg-gradient-to-r ${eventTheme.buttonGradient}`}
              data-testid="button-save-customize"
            >
              {isUploadingBanner ? "Uploading..." : customizeMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Itinerary Dialog */}
      <Dialog open={itineraryDialogOpen} onOpenChange={setItineraryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              Plan Your Itinerary
            </DialogTitle>
            <DialogDescription>
              Add activities and schedule your event timeline
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <ItineraryTab 
              groupId={groupId!} 
              itinerary={itinerary} 
              isAdmin={isAdmin || isCreator} 
              groupLocation={group?.locationPreference || undefined} 
              theme={eventTheme} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Theme type for child components
type EventTheme = typeof DEFAULT_EVENT_THEME;

// Overview Tab Component
function OverviewTab({ 
  group, 
  polls, 
  itinerary, 
  expenses,
  theme 
}: { 
  group: GroupWithFullDetails; 
  polls?: GroupPollWithDetails[];
  itinerary?: GroupItineraryItem[];
  expenses?: ExpenseWithSplits[];
  theme: EventTheme;
}) {
  const activePolls = polls?.filter(p => p.status === "active") || [];
  const upcomingItems = itinerary?.filter(i => new Date(i.startTime) > new Date()).slice(0, 3) || [];
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Active Polls Card - Dashboard style */}
      <Card className="hover-elevate bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-md">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs">Votes</Badge>
          </div>
          <CardTitle className="text-lg font-bold text-purple-700 dark:text-purple-100">Active Polls</CardTitle>
        </CardHeader>
        <CardContent>
          {activePolls.length > 0 ? (
            <div className="space-y-3">
              {activePolls.slice(0, 3).map(poll => (
                <div key={poll.id} className="p-3 bg-white/50 dark:bg-white/10 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                  <div className="font-medium truncate text-purple-800 dark:text-purple-100">{poll.question}</div>
                  <div className="text-sm text-purple-600/80 dark:text-purple-300/80 mt-1">
                    {poll.totalVotes} votes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-purple-600/70 dark:text-purple-300/70">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-800/30 rounded-full flex items-center justify-center mb-3">
                <Vote className="w-6 h-6 text-purple-400" />
              </div>
              <p className="font-medium">No active polls</p>
              <p className="text-xs mt-1">Create a poll to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Activities Card - Dashboard style */}
      <Card className="hover-elevate bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-amber-950/30 border-2 border-amber-200 dark:border-amber-800 shadow-md hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-md">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">Schedule</Badge>
          </div>
          <CardTitle className="text-lg font-bold text-amber-700 dark:text-amber-100">Upcoming Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingItems.length > 0 ? (
            <div className="space-y-3">
              {upcomingItems.map(item => (
                <div key={item.id} className="p-3 bg-white/50 dark:bg-white/10 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                  <div className="font-medium truncate text-amber-800 dark:text-amber-100">{item.title}</div>
                  <div className="text-sm text-amber-600/80 dark:text-amber-300/80 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {format(new Date(item.startTime), "PPp")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-amber-600/70 dark:text-amber-300/70">
              <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-800/30 rounded-full flex items-center justify-center mb-3">
                <ClipboardList className="w-6 h-6 text-amber-400" />
              </div>
              <p className="font-medium">No upcoming activities</p>
              <p className="text-xs mt-1">Add to your itinerary</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Overview Card - Dashboard style */}
      <Card className="hover-elevate bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-950/30 border-2 border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-md">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">Finance</Badge>
          </div>
          <CardTitle className="text-lg font-bold text-green-700 dark:text-green-100">Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/50 dark:bg-white/10 rounded-lg p-3 border border-green-200/50 dark:border-green-700/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-600/80 dark:text-green-300/80">Total Budget</span>
                <span className="font-bold text-green-700 dark:text-green-100">{Number(group.budget || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-600/80 dark:text-green-300/80">Spent</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{totalExpenses.toLocaleString("en-IN")}</span>
              </div>
              {group.budget && (
                <>
                  <Progress 
                    value={(totalExpenses / Number(group.budget)) * 100} 
                    className="h-2 bg-green-200 dark:bg-green-800"
                  />
                  <div className="text-xs text-green-600/80 dark:text-green-300/80 mt-1 text-right">
                    {Math.round((totalExpenses / Number(group.budget)) * 100)}% used
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Members - Dashboard style */}
      <Card className="md:col-span-2 lg:col-span-3 hover-elevate bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 dark:from-blue-950/30 dark:via-sky-950/20 dark:to-blue-950/30 border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-400 to-sky-500 rounded-xl shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-100">Group Members</CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-blue-300/80">{group.members?.length || 0} people joined</CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xs">Team</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {group.members?.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/10 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                <Avatar className="w-10 h-10 border-2 border-blue-300 dark:border-blue-600">
                  <AvatarImage src={member.user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-sky-500 text-white font-bold">
                    {member.user?.firstName?.[0] || member.user?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-blue-800 dark:text-blue-100">
                    {member.user?.firstName || member.user?.username}
                  </div>
                  <div className="text-xs text-blue-600/80 dark:text-blue-300/80 capitalize flex items-center gap-1">
                    {member.role === "admin" && <Crown className="w-3 h-3 text-amber-500" />}
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Polls Tab Component
function PollsTab({ 
  groupId, 
  polls, 
  isAdmin,
  theme 
}: { 
  groupId: string; 
  polls?: GroupPollWithDetails[];
  isAdmin: boolean;
  theme: EventTheme;
}) {
  const { toast } = useToast();
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    pollType: "single",
    endsAt: "",
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: typeof newPoll) => {
      const res = await apiRequest(`/api/groups/${groupId}/polls`, "POST", {
        ...data,
        options: data.options.filter(o => o.trim()),
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "polls"] });
      toast({ title: "Poll created!", description: "Members can now vote." });
      setCreatePollOpen(false);
      setNewPoll({ question: "", options: ["", ""], pollType: "single", endsAt: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create poll", variant: "destructive" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      await apiRequest(`/api/polls/${pollId}/vote`, "POST", { optionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "polls"] });
      toast({ title: "Vote recorded!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to vote", variant: "destructive" });
    },
  });

  const addOption = () => {
    if (newPoll.options.length < 10) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
    }
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({ ...newPoll, options: newPoll.options.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Polls & Voting</h2>
        {isAdmin && (
          <Dialog open={createPollOpen} onOpenChange={setCreatePollOpen}>
            <DialogTrigger asChild>
              <Button className={`bg-gradient-to-r ${theme.buttonGradient}`} data-testid="button-create-poll">
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
                <DialogDescription>Ask your group members to vote on something</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    placeholder="What should we decide?"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    data-testid="input-poll-question"
                  />
                </div>
                
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-2">
                    {newPoll.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const opts = [...newPoll.options];
                            opts[i] = e.target.value;
                            setNewPoll({ ...newPoll, options: opts });
                          }}
                          data-testid={`input-poll-option-${i}`}
                        />
                        {newPoll.options.length > 2 && (
                          <Button variant="ghost" size="icon" onClick={() => removeOption(i)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {newPoll.options.length < 10 && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newPoll.endsAt}
                    onChange={(e) => setNewPoll({ ...newPoll, endsAt: e.target.value })}
                    data-testid="input-poll-ends"
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => createPollMutation.mutate(newPoll)}
                  disabled={createPollMutation.isPending || !newPoll.question.trim() || newPoll.options.filter(o => o.trim()).length < 2}
                  data-testid="button-submit-poll"
                >
                  {createPollMutation.isPending ? "Creating..." : "Create Poll"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {polls && polls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map(poll => (
            <Card key={poll.id} className={poll.status === "closed" ? "opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                    <CardDescription className="mt-1">
                      {poll.totalVotes} votes
                      {poll.endsAt && ` • Ends ${format(new Date(poll.endsAt), "PPp")}`}
                    </CardDescription>
                  </div>
                  <Badge variant={poll.status === "active" ? "default" : "secondary"}>
                    {poll.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poll.options.map(option => {
                    const percentage = poll.totalVotes > 0 ? (option.voteCount / poll.totalVotes) * 100 : 0;
                    const isSelected = poll.userVote === option.id;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => poll.status === "active" && !poll.userVote && voteMutation.mutate({ pollId: poll.id, optionId: option.id })}
                        disabled={poll.status !== "active" || !!poll.userVote || voteMutation.isPending}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isSelected 
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" 
                            : "hover:border-muted-foreground/30"
                        } ${poll.status !== "active" || poll.userVote ? "cursor-default" : "cursor-pointer"}`}
                        data-testid={`button-vote-${option.id}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{option.optionText}</span>
                          <span className="text-sm text-muted-foreground">
                            {option.voteCount} ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {isSelected && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                            <Check className="w-3 h-3" />
                            Your vote
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Vote className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Polls Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create a poll to help your group make decisions together
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Activity category options for itinerary
const ACTIVITY_CATEGORIES = [
  { value: "breakfast", label: "Breakfast", icon: Utensils, vendorCategory: "catering" },
  { value: "lunch", label: "Lunch", icon: Utensils, vendorCategory: "catering" },
  { value: "dinner", label: "Dinner", icon: Utensils, vendorCategory: "catering" },
  { value: "snacks", label: "Snacks/Tea", icon: Utensils, vendorCategory: "catering" },
  { value: "venue", label: "Venue/Meeting", icon: MapPin, vendorCategory: "venue" },
  { value: "transport", label: "Transport/Ride", icon: Car, vendorCategory: "transport" },
  { value: "photography", label: "Photography", icon: Camera, vendorCategory: "photography" },
  { value: "decoration", label: "Decoration", icon: PartyPopper, vendorCategory: "decoration" },
  { value: "entertainment", label: "Entertainment", icon: Music, vendorCategory: "entertainment" },
  { value: "other", label: "Other", icon: ClipboardList, vendorCategory: null },
];

// Helper to get vendor category from itinerary item
function getVendorCategoryFromItem(item: GroupItineraryItem): string | null {
  // First check if item has explicit category
  if (item.category) {
    const cat = ACTIVITY_CATEGORIES.find(c => c.value === item.category);
    if (cat?.vendorCategory) return cat.vendorCategory;
  }
  
  // Try to infer from title
  const titleLower = item.title.toLowerCase();
  for (const [keyword, vendorCat] of Object.entries(ITINERARY_VENDOR_MAPPING)) {
    if (titleLower.includes(keyword)) {
      return vendorCat;
    }
  }
  
  return null;
}

// Location suggestions based on category
const LOCATION_SUGGESTIONS: Record<string, string[]> = {
  dining: [
    "Taj Restaurant",
    "Mainland China",
    "Barbeque Nation",
    "Copper Chimney",
    "Paradise Biryani",
    "Absolute Barbecues",
    "Ohri's",
    "Cream Stone",
    "Bikanervala",
    "Haldiram's",
  ],
  entertainment: [
    "PVR Cinemas",
    "INOX Movies",
    "Wonderla Amusement Park",
    "Snow World",
    "Escape Room Adventures",
    "Timezone Gaming Zone",
    "Smaaash Gaming",
    "Bowling Alley",
    "Go-Karting Track",
    "Laser Tag Arena",
  ],
  sightseeing: [
    "City Museum",
    "Heritage Walk",
    "Art Gallery",
    "Botanical Garden",
    "Historical Fort",
    "Lake View Point",
    "Temple Complex",
    "Cultural Center",
    "Observatory",
    "Wildlife Sanctuary",
  ],
  shopping: [
    "Phoenix Mall",
    "Forum Mall",
    "City Centre Mall",
    "GVK One",
    "Inorbit Mall",
    "Local Bazaar",
    "Handicraft Market",
    "Street Shopping Area",
  ],
  sports: [
    "Stadium",
    "Sports Complex",
    "Cricket Ground",
    "Tennis Courts",
    "Swimming Pool",
    "Golf Course",
    "Badminton Court",
    "Football Ground",
  ],
  adventure: [
    "Trekking Trail",
    "Rock Climbing Center",
    "Bungee Jumping",
    "Zip Line Adventure",
    "Paragliding Point",
    "River Rafting",
    "Camping Ground",
    "Adventure Park",
  ],
};

// Itinerary Tab Component
function ItineraryTab({ 
  groupId, 
  itinerary, 
  isAdmin,
  groupLocation,
  theme
}: { 
  groupId: string; 
  itinerary?: GroupItineraryItem[];
  isAdmin: boolean;
  groupLocation?: string;
  theme: EventTheme;
}) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroupItineraryItem | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  // Get location suggestions based on category
  const locationSuggestions = useMemo(() => {
    const category = newItem.category;
    const suggestions = LOCATION_SUGGESTIONS[category] || [];
    const cityPrefix = groupLocation ? `${groupLocation} - ` : "";
    
    // Filter by what user has typed
    const searchTerm = newItem.location.toLowerCase();
    let filtered = suggestions
      .map(s => `${cityPrefix}${s}`)
      .filter(s => s.toLowerCase().includes(searchTerm) || searchTerm === "");
    
    // Add a custom option if user is typing something not in suggestions
    if (searchTerm && !filtered.some(s => s.toLowerCase() === searchTerm)) {
      filtered = [`${newItem.location}`, ...filtered.slice(0, 5)];
    }
    
    return filtered.slice(0, 8);
  }, [newItem.category, newItem.location, groupLocation]);

  // Get vendors for selected category and location
  const vendorCategory = selectedItem ? getVendorCategoryFromItem(selectedItem) : null;
  const searchLocation = selectedItem?.location || groupLocation || "";
  
  const { data: vendors, isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors", { category: vendorCategory, location: searchLocation }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (vendorCategory) params.set("category", vendorCategory);
      if (searchLocation) params.set("location", searchLocation);
      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json();
    },
    enabled: vendorDialogOpen && !!vendorCategory,
  });

  const bookVendorMutation = useMutation({
    mutationFn: async ({ itemId, vendorId }: { itemId: string; vendorId: string }) => {
      const res = await apiRequest(`/api/groups/${groupId}/itinerary/${itemId}`, "PATCH", {
        bookedVendorId: vendorId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "itinerary"] });
      toast({ title: "Vendor booked!", description: "The vendor has been assigned to this activity." });
      setVendorDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to book vendor", variant: "destructive" });
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: typeof newItem) => {
      const res = await apiRequest(`/api/groups/${groupId}/itinerary`, "POST", {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "itinerary"] });
      toast({ title: "Activity added!", description: "Your itinerary has been updated." });
      setCreateItemOpen(false);
      setNewItem({ title: "", description: "", category: "", startTime: "", endTime: "", location: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add activity", variant: "destructive" });
    },
  });

  const handleFindVendors = (item: GroupItineraryItem) => {
    const vendorCat = getVendorCategoryFromItem(item);
    if (vendorCat) {
      setSelectedItem(item);
      setVendorDialogOpen(true);
    } else {
      // Navigate to vendors page if no specific category
      setLocation("/vendors");
    }
  };

  const sortedItinerary = itinerary?.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Event Itinerary</h2>
        {isAdmin && (
          <Dialog open={createItemOpen} onOpenChange={setCreateItemOpen}>
            <DialogTrigger asChild>
              <Button className={`bg-gradient-to-r ${theme.buttonGradient}`} data-testid="button-add-activity">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Activity</DialogTitle>
                <DialogDescription>Plan an activity for your event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Activity name"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      data-testid="input-activity-title"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger data-testid="select-activity-category">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_CATEGORIES.map(cat => {
                          const Icon = cat.icon;
                          return (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Details about the activity"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="resize-none"
                    rows={3}
                    data-testid="input-activity-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={newItem.startTime}
                      onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
                      data-testid="input-activity-start"
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={newItem.endTime}
                      onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
                      data-testid="input-activity-end"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Label>Location</Label>
                  <div className="relative">
                    <Input
                      placeholder={groupLocation ? `e.g., ${groupLocation} - Restaurant Name` : "Where will this take place?"}
                      value={newItem.location}
                      onChange={(e) => {
                        setNewItem({ ...newItem, location: e.target.value });
                        setShowLocationSuggestions(true);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                      data-testid="input-activity-location"
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && newItem.category && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 text-xs text-muted-foreground border-b">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Popular {ACTIVITY_CATEGORIES.find(c => c.value === newItem.category)?.label || 'places'} {groupLocation && `in ${groupLocation}`}
                        </div>
                        {locationSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setNewItem({ ...newItem, location: suggestion });
                              setShowLocationSuggestions(false);
                            }}
                            data-testid={`suggestion-location-${idx}`}
                          >
                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {!newItem.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Select a category first to see location suggestions
                    </p>
                  )}
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => createItemMutation.mutate(newItem)}
                  disabled={createItemMutation.isPending || !newItem.title.trim() || !newItem.startTime}
                  data-testid="button-submit-activity"
                >
                  {createItemMutation.isPending ? "Adding..." : "Add Activity"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {sortedItinerary && sortedItinerary.length > 0 ? (
        <div className="relative">
          <div className={`absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b ${theme.buttonGradient.split(' ')[0]} via-current to-current/50`} />
          <div className="space-y-4 ml-10">
            {sortedItinerary.map((item, index) => {
              const itemVendorCategory = getVendorCategoryFromItem(item);
              const categoryInfo = ACTIVITY_CATEGORIES.find(c => c.value === item.category);
              const CategoryIcon = categoryInfo?.icon || ClipboardList;
              
              return (
                <Card key={item.id} className="relative">
                  <div className={`absolute -left-10 top-6 w-4 h-4 rounded-full bg-gradient-to-br ${theme.buttonGradient} border-2 border-background`} />
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.category && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <CategoryIcon className="w-3 h-3" />
                              {categoryInfo?.label || item.category}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-muted-foreground mt-1">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {format(new Date(item.startTime), "h:mm a")}
                            {item.endTime && ` - ${format(new Date(item.endTime), "h:mm a")}`}
                          </div>
                          {item.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {item.location}
                            </div>
                          )}
                        </div>
                        
                        {/* Find Vendors Button */}
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950/30"
                            onClick={() => handleFindVendors(item)}
                            data-testid={`button-find-vendors-${item.id}`}
                          >
                            <Store className="w-4 h-4" />
                            {itemVendorCategory ? `Find ${itemVendorCategory.charAt(0).toUpperCase() + itemVendorCategory.slice(1)}` : "Find Vendors"}
                          </Button>
                        </div>
                      </div>
                      <Badge variant={item.status === "completed" ? "secondary" : "outline"} className="shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Activities Planned</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your event itinerary
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vendor Booking Dialog */}
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-orange-500" />
              Find {vendorCategory ? vendorCategory.charAt(0).toUpperCase() + vendorCategory.slice(1) : "Vendors"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <span>
                  For "{selectedItem.title}" 
                  {searchLocation && ` in ${searchLocation}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            {vendorsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : vendors && vendors.length > 0 ? (
              <div className="space-y-4">
                {vendors.map(vendor => (
                  <Card key={vendor.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {vendor.imageUrl && (
                          <img 
                            src={vendor.imageUrl} 
                            alt={vendor.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{vendor.rating} ({vendor.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{vendor.location}</span>
                          </div>
                          <div className="text-sm font-medium text-orange-600 mt-1">
                            {vendor.priceRange}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${theme.buttonGradient} shrink-0`}
                          onClick={() => selectedItem && bookVendorMutation.mutate({ 
                            itemId: selectedItem.id, 
                            vendorId: vendor.id 
                          })}
                          disabled={bookVendorMutation.isPending}
                          data-testid={`button-book-vendor-${vendor.id}`}
                        >
                          {bookVendorMutation.isPending ? "Booking..." : "Book"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Vendors Found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  No {vendorCategory} vendors found {searchLocation && `in ${searchLocation}`}
                </p>
                <Button variant="outline" onClick={() => setLocation("/vendors")}>
                  Browse All Vendors
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Members Tab Component
function MembersTab({ 
  group, 
  isAdmin,
  theme 
}: { 
  group: GroupWithFullDetails; 
  isAdmin: boolean;
  theme: EventTheme;
}) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest(`/api/groups/${group.id}/members/${userId}`, "PATCH", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group.id] });
      toast({ title: "Role updated!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">
          Members ({group.members?.length || 0})
        </h2>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Members
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {group.members?.map(member => {
          const RoleIcon = ROLE_OPTIONS.find(r => r.value === member.role)?.icon || Users;
          const isCurrentUser = member.userId === currentUser?.id;
          
          return (
            <Card key={member.id} className={isCurrentUser ? theme.cardBorder : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.user?.profileImageUrl || undefined} />
                    <AvatarFallback className={`bg-gradient-to-br ${theme.buttonGradient} text-white`}>
                      {member.user?.firstName?.[0] || member.user?.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">
                        {member.user?.firstName} {member.user?.lastName}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                      {member.userId === group.createdById && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-xs">
                          Creator
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{member.user?.username}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {isAdmin && !isCurrentUser && member.userId !== group.createdById ? (
                        <Select
                          value={member.role}
                          onValueChange={(role) => updateRoleMutation.mutate({ userId: member.userId, role })}
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <role.icon className="w-4 h-4" />
                                  {role.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <RoleIcon className="w-3 h-3" />
                          {ROLE_OPTIONS.find(r => r.value === member.role)?.label || member.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Expenses Tab Component - Two-Step Wizard
function ExpensesTab({ 
  groupId,
  group,
  expenses, 
  members, 
  isAdmin,
  theme 
}: { 
  groupId: string;
  group: GroupWithFullDetails;
  expenses?: ExpenseWithSplits[];
  members?: GroupMemberWithUser[];
  isAdmin: boolean;
  theme: EventTheme;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [splitMethod, setSplitMethod] = useState<"auto" | "manual">("auto");
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    category: "other",
    paidById: "",
  });
  const [manualSplits, setManualSplits] = useState<Record<string, string>>({});

  const totalAmount = parseFloat(expenseData.amount) || 0;
  const memberCount = members?.length || 1;
  const autoSplitAmount = totalAmount / memberCount;
  
  const manualSplitTotal = Object.values(manualSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const splitDifference = totalAmount - manualSplitTotal;
  const isSplitValid = Math.abs(splitDifference) < 0.01;

  const initializeManualSplits = () => {
    if (members) {
      const equalSplit = (totalAmount / memberCount).toFixed(2);
      const splits: Record<string, string> = {};
      members.forEach(member => {
        splits[member.userId] = equalSplit;
      });
      setManualSplits(splits);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setSplitMethod("auto");
    setExpenseData({ description: "", amount: "", category: "other", paidById: "" });
    setManualSplits({});
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetDialog();
    }
  };

  const goToStep2 = () => {
    initializeManualSplits();
    setStep(2);
  };

  const goBackToStep1 = () => {
    setStep(1);
  };

  const expenseMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(expenseData.amount);
      let splits: { userId: string; amount: string; isPayer: boolean }[] = [];
      
      if (splitMethod === "auto") {
        const splitAmount = (amount / memberCount).toFixed(2);
        splits = members?.map(member => ({
          userId: member.userId,
          amount: splitAmount,
          isPayer: member.userId === expenseData.paidById
        })) || [];
      } else {
        splits = members?.map(member => ({
          userId: member.userId,
          amount: manualSplits[member.userId] || "0",
          isPayer: member.userId === expenseData.paidById
        })) || [];
      }
      
      const res = await apiRequest(`/api/groups/${groupId}/expenses`, "POST", {
        description: expenseData.description,
        amount: amount,
        category: expenseData.category,
        splitType: splitMethod === "auto" ? "equal" : "manual",
        splits: splits,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "expenses"] });
      if (splitMethod === "auto") {
        toast({ 
          title: "Expense split automatically!", 
          description: `₹${autoSplitAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per person (${memberCount} members)` 
        });
      } else {
        toast({ title: "Expense added with manual splits!" });
      }
      handleDialogChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add expense", variant: "destructive" });
    },
  });

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const expensesByCategory = expenses?.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate member balances (what they paid - what they owe)
  const memberBalances = useMemo(() => {
    if (!expenses || !members || expenses.length === 0) return [];

    const balances = new Map<string, { paid: number; owes: number }>();

    // Initialize all members
    members.forEach(m => {
      balances.set(m.userId, { paid: 0, owes: 0 });
    });

    // Calculate what each person paid and owes
    expenses.forEach(expense => {
      // Add to paid amount for the payer
      const payer = balances.get(expense.paidById);
      if (payer) {
        payer.paid += Number(expense.amount);
      }

      // Add to owes amount for each split
      expense.splits?.forEach(split => {
        const member = balances.get(split.userId);
        if (member) {
          member.owes += Number(split.amount);
        }
      });
    });

    // Convert to array with net balance
    return members.map(m => {
      const balance = balances.get(m.userId) || { paid: 0, owes: 0 };
      const net = balance.paid - balance.owes;
      return {
        member: m,
        paid: balance.paid,
        owes: balance.owes,
        net: net,
        status: net > 0.01 ? "receive" : net < -0.01 ? "pay" : "settled"
      };
    }).sort((a, b) => b.net - a.net); // Sort by net balance (receivers first)
  }, [expenses, members]);

  // Find treasurer or admin to pay
  const paymentRecipient = useMemo(() => {
    const treasurer = members?.find(m => m.role === "treasurer");
    if (treasurer) return { member: treasurer, role: "Treasurer" };
    
    const admin = members?.find(m => m.role === "admin");
    if (admin) return { member: admin, role: "Admin" };
    
    // Fallback to group creator
    const creator = members?.find(m => m.userId === group.createdById);
    if (creator) return { member: creator, role: "Organizer" };
    
    return null;
  }, [members, group.createdById]);

  const CATEGORIES = ["venue", "food", "transport", "decoration", "entertainment", "other"];

  const canProceedToStep2 = expenseData.description.trim() && expenseData.amount && parseFloat(expenseData.amount) > 0 && expenseData.paidById;
  const canSubmit = splitMethod === "auto" || isSplitValid;

  const downloadPDF = () => {
    if (!expenses || expenses.length === 0) {
      toast({ title: "No expenses to export", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(234, 88, 12);
    doc.text("Myzymo", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(group.name, 14, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Event Type: ${group.eventType || "N/A"}`, 14, 40);
    doc.text(`Date: ${group.eventDate ? format(new Date(group.eventDate), "PP") : "TBD"}`, 14, 46);
    doc.text(`Generated: ${format(new Date(), "PPpp")}`, 14, 52);

    const tableData = expenses.map((expense, index) => {
      const payer = members?.find(m => m.userId === expense.paidById);
      return [
        index + 1,
        expense.description,
        expense.category,
        payer?.user?.firstName || "Unknown",
        `₹${Number(expense.amount).toLocaleString("en-IN")}`
      ];
    });

    tableData.push(["", "", "", "Total:", `₹${totalExpenses.toLocaleString("en-IN")}`]);

    autoTable(doc, {
      startY: 60,
      head: [["SL No.", "Description", "Category", "Paid By", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [234, 88, 12], textColor: 255 },
      footStyles: { fillColor: [245, 245, 245], fontStyle: "bold" },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35, halign: "right" }
      }
    });

    doc.save(`${group.name.replace(/\s+/g, "_")}_Expenses.pdf`);
    toast({ title: "PDF downloaded successfully!" });
  };

  const downloadExcel = () => {
    if (!expenses || expenses.length === 0) {
      toast({ title: "No expenses to export", variant: "destructive" });
      return;
    }

    const headerData = [
      ["Myzymo - Expense Report"],
      [`Event: ${group.name}`],
      [`Type: ${group.eventType || "N/A"}`],
      [`Date: ${group.eventDate ? format(new Date(group.eventDate), "PP") : "TBD"}`],
      [`Generated: ${format(new Date(), "PPpp")}`],
      [],
      ["SL No.", "Description", "Category", "Paid By", "Amount (INR)"]
    ];

    const tableData = expenses.map((expense, index) => {
      const payer = members?.find(m => m.userId === expense.paidById);
      return [
        index + 1,
        expense.description,
        expense.category,
        payer?.user?.firstName || "Unknown",
        Number(expense.amount)
      ];
    });

    tableData.push(["", "", "", "Total:", totalExpenses]);

    const ws = XLSX.utils.aoa_to_sheet([...headerData, ...tableData]);
    
    ws["!cols"] = [
      { wch: 8 },
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `${group.name.replace(/\s+/g, "_")}_Expenses.xlsx`);
    toast({ title: "Excel downloaded successfully!" });
  };

  const shareViaChat = async () => {
    setShareDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-heading font-semibold">Expenses</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className={`bg-gradient-to-r ${theme.buttonGradient}`} data-testid="button-add-expense">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            {step === 1 ? (
              <>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                  <DialogDescription>Step 1: Enter expense details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="What was this expense for?"
                      value={expenseData.description}
                      onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                      data-testid="input-expense-description"
                    />
                  </div>
                  <div>
                    <Label>Total Amount (INR)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-9"
                        value={expenseData.amount}
                        onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                        data-testid="input-expense-amount"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={expenseData.category}
                        onValueChange={(value) => setExpenseData({ ...expenseData, category: value })}
                      >
                        <SelectTrigger data-testid="select-expense-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="capitalize">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Paid By</Label>
                      <Select
                        value={expenseData.paidById}
                        onValueChange={(value) => setExpenseData({ ...expenseData, paidById: value })}
                      >
                        <SelectTrigger data-testid="select-expense-paid-by">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {members?.map(member => (
                            <SelectItem key={member.userId} value={member.userId}>
                              {member.user?.firstName || member.user?.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    className={`w-full bg-gradient-to-r ${theme.buttonGradient}`}
                    onClick={goToStep2}
                    disabled={!canProceedToStep2}
                    data-testid="button-next-step"
                  >
                    Next: Choose Split Method
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Split Expense</DialogTitle>
                  <DialogDescription>
                    Step 2: How should ₹{totalAmount.toLocaleString("en-IN")} be split among {memberCount} members?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{expenseData.description}</span>
                      <span className="font-semibold flex items-center">
                        <IndianRupee className="w-3 h-3" />
                        {totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  
                  <RadioGroup value={splitMethod} onValueChange={(value: "auto" | "manual") => setSplitMethod(value)} className="space-y-3">
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${splitMethod === "auto" ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" : "border-border hover:border-orange-300"}`}>
                      <RadioGroupItem value="auto" id="auto-split" data-testid="radio-auto-split" />
                      <Label htmlFor="auto-split" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Split className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">Auto Split (Equal)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Each member pays: <span className="font-semibold text-foreground">₹{autoSplitAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                      </Label>
                    </div>
                    
                    <div className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${splitMethod === "manual" ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30" : "border-border hover:border-orange-300"}`}>
                      <RadioGroupItem value="manual" id="manual-split" className="mt-1" data-testid="radio-manual-split" />
                      <Label htmlFor="manual-split" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">Manual Split (Custom)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Assign custom amounts to each member
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {splitMethod === "manual" && (
                    <div className="space-y-3">
                      <Separator />
                      <ScrollArea className="max-h-48">
                        <div className="space-y-3 pr-4">
                          {members?.map(member => (
                            <div key={member.userId} className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={member.user?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                                  {(member.user?.firstName?.[0] || member.user?.username?.[0] || "?").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex-1 text-sm font-medium truncate">
                                {member.user?.firstName || member.user?.username}
                                {member.userId === expenseData.paidById && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Paid</Badge>
                                )}
                              </span>
                              <div className="relative w-28">
                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                <Input
                                  type="number"
                                  className="pl-6 h-8 text-sm"
                                  value={manualSplits[member.userId] || ""}
                                  onChange={(e) => setManualSplits({ ...manualSplits, [member.userId]: e.target.value })}
                                  data-testid={`input-split-${member.userId}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      
                      <div className={`p-3 rounded-lg ${isSplitValid ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span>Split Total:</span>
                          <span className={`font-semibold flex items-center ${isSplitValid ? "text-green-600" : "text-red-600"}`}>
                            <IndianRupee className="w-3 h-3" />
                            {manualSplitTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {!isSplitValid && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>
                              {splitDifference > 0 
                                ? `₹${splitDifference.toLocaleString("en-IN", { minimumFractionDigits: 2 })} remaining to assign`
                                : `₹${Math.abs(splitDifference).toLocaleString("en-IN", { minimumFractionDigits: 2 })} over the total`
                              }
                            </span>
                          </div>
                        )}
                        {isSplitValid && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <Check className="w-3 h-3" />
                            <span>Splits match the total amount</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={goBackToStep1}
                      className="flex-1"
                      data-testid="button-back-step"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className={`flex-1 bg-gradient-to-r ${theme.buttonGradient}`}
                      onClick={() => expenseMutation.mutate()}
                      disabled={expenseMutation.isPending || !canSubmit}
                      data-testid="button-submit-expense"
                    >
                      {expenseMutation.isPending ? "Saving..." : (
                        splitMethod === "auto" 
                          ? `Split Equally (${memberCount})` 
                          : "Save Manual Split"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Expense Table */}
      {expenses && expenses.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg">Expense Details</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadPDF}
                  data-testid="button-download-pdf"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadExcel}
                  data-testid="button-download-excel"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareViaChat}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
                  data-testid="button-share-expenses"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold w-16">SL No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Paid By</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map((expense, index) => {
                    const payer = members?.find(m => m.userId === expense.paidById);
                    return (
                      <tr key={expense.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-expense-${index + 1}`}>
                        <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{expense.description}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {expense.category} • {payer?.user?.firstName || "Unknown"}
                          </div>
                        </td>
                        <td className="px-4 py-3 capitalize hidden md:table-cell">{expense.category}</td>
                        <td className="px-4 py-3 hidden md:table-cell">{payer?.user?.firstName || "Unknown"}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="w-3 h-3" />
                            {Number(expense.amount).toLocaleString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-bold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      <span className="flex items-center justify-end text-orange-600">
                        <IndianRupee className="w-4 h-4" />
                        {totalExpenses.toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IndianRupee className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Expenses Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Track shared expenses for your event
            </p>
          </CardContent>
        </Card>
      )}

      {/* Settlement Summary */}
      {memberBalances.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Split className="w-5 h-5 text-orange-500" />
              Settlement Summary
            </CardTitle>
            <CardDescription>
              {paymentRecipient ? (
                <>
                  Payments should be made to <span className="font-semibold text-foreground">{paymentRecipient.member.user.firstName}</span> ({paymentRecipient.role})
                </>
              ) : (
                "Track what each member owes or is owed"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Member</th>
                    <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Paid</th>
                    <th className="px-4 py-3 text-right font-semibold hidden md:table-cell">Owes</th>
                    <th className="px-4 py-3 text-right font-semibold">Net</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {memberBalances.map((balance, index) => {
                    const isCurrentUser = balance.member.userId === user?.id;
                    return (
                      <tr 
                        key={balance.member.userId} 
                        className={`transition-colors ${isCurrentUser ? "bg-orange-50/50 dark:bg-orange-950/20" : "hover:bg-muted/30"}`}
                        data-testid={`row-settlement-${index + 1}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={balance.member.user.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {balance.member.user.firstName?.[0]}{balance.member.user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {balance.member.user.firstName} {balance.member.user.lastName}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">You</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground md:hidden">
                                Paid: ₹{balance.paid.toLocaleString("en-IN")} • Owes: ₹{balance.owes.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="w-3 h-3" />
                            {balance.paid.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          <span className="flex items-center justify-end">
                            <IndianRupee className="w-3 h-3" />
                            {balance.owes.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={`flex items-center justify-end ${balance.status === "receive" ? "text-green-600" : balance.status === "pay" ? "text-red-600" : "text-muted-foreground"}`}>
                            {balance.net > 0 ? "+" : ""}
                            <IndianRupee className="w-3 h-3" />
                            {Math.abs(balance.net).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {balance.status === "receive" ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              To Receive
                            </Badge>
                          ) : balance.status === "pay" ? (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              To Pay
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Settled</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Payment Instructions for current user */}
            {user && memberBalances.find(b => b.member.userId === user.id && b.status === "pay") && paymentRecipient && (
              <div className="p-4 border-t bg-red-50/50 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-red-700 dark:text-red-400">
                      You need to pay ₹{Math.abs(memberBalances.find(b => b.member.userId === user.id)?.net || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-red-600/80 dark:text-red-400/80">
                      Please pay {paymentRecipient.member.user.firstName} ({paymentRecipient.role}) to settle your balance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Positive balance message for current user */}
            {user && memberBalances.find(b => b.member.userId === user.id && b.status === "receive") && (
              <div className="p-4 border-t bg-green-50/50 dark:bg-green-950/20">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-green-700 dark:text-green-400">
                      You will receive ₹{memberBalances.find(b => b.member.userId === user.id)?.net.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-green-600/80 dark:text-green-400/80">
                      Other members will pay you for the expenses you covered
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Share Expenses Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Expenses</DialogTitle>
            <DialogDescription>
              Share the expense report with group members via chat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-semibold mb-2">{group.name} - Expense Report</div>
              <div className="text-sm text-muted-foreground">
                Total Expenses: ₹{totalExpenses.toLocaleString("en-IN")}
              </div>
              <div className="text-sm text-muted-foreground">
                {expenses?.length || 0} items • {Object.keys(expensesByCategory).length} categories
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Share via</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const text = `📊 *${group.name} - Expense Report*\n\n` +
                      expenses?.map((e, i) => `${i + 1}. ${e.description}: ₹${Number(e.amount).toLocaleString("en-IN")}`).join("\n") +
                      `\n\n💰 *Total: ₹${totalExpenses.toLocaleString("en-IN")}*`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(whatsappUrl, "_blank");
                    setShareDialogOpen(false);
                    toast({ title: "Opening WhatsApp..." });
                  }}
                  data-testid="button-share-whatsapp"
                >
                  <SiWhatsapp className="w-4 h-4 mr-2 text-green-600" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const text = `${group.name} - Expense Report\n\n` +
                      expenses?.map((e, i) => `${i + 1}. ${e.description}: ₹${Number(e.amount).toLocaleString("en-IN")}`).join("\n") +
                      `\n\nTotal: ₹${totalExpenses.toLocaleString("en-IN")}`;
                    navigator.clipboard.writeText(text);
                    setShareDialogOpen(false);
                    toast({ title: "Copied to clipboard!" });
                  }}
                  data-testid="button-copy-expenses"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
