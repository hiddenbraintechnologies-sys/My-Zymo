import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, Plus, ArrowLeft, Calendar, MapPin, IndianRupee,
  Vote, ClipboardList, UserCog,
  ChevronRight, Share2, Copy, LogOut, Sparkles, Target, Pencil
} from "lucide-react";
import type { EventGroup, EventGroupMember, User } from "@shared/schema";

type GroupMemberWithUser = EventGroupMember & { user: User };

type GroupWithDetails = EventGroup & {
  memberCount: number;
  members?: GroupMemberWithUser[];
  activePolls?: number;
};

const EVENT_TYPES = [
  { value: "college_reunion", label: "College Reunion" },
  { value: "school_reunion", label: "School Reunion" },
  { value: "birthday_party", label: "Birthday Party" },
  { value: "wedding", label: "Wedding" },
  { value: "anniversary", label: "Anniversary" },
  { value: "family_gathering", label: "Family Gathering" },
  { value: "corporate_event", label: "Corporate Event" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export default function GroupPlanning() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [bannerEditOpen, setBannerEditOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  
  // Banner customization state
  const [bannerData, setBannerData] = useState({
    title: "Group Planning",
    subtitle: "Collaborate with friends and family to plan perfect events",
  });
  const [tempBannerData, setTempBannerData] = useState(bannerData);

  // Load saved banner data from localStorage
  useEffect(() => {
    const savedBanner = localStorage.getItem("groupPlanningBanner");
    if (savedBanner) {
      try {
        const parsed = JSON.parse(savedBanner);
        setBannerData(parsed);
        setTempBannerData(parsed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSaveBanner = () => {
    setBannerData(tempBannerData);
    localStorage.setItem("groupPlanningBanner", JSON.stringify(tempBannerData));
    setBannerEditOpen(false);
    toast({
      title: "Banner updated!",
      description: "Your custom banner has been saved.",
    });
  };
  
  // Create group form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "",
    eventDate: "",
    locationPreference: "",
    budget: "",
  });

  // Fetch user's groups
  const { data: groups, isLoading: groupsLoading, error: groupsError } = useQuery<GroupWithDetails[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
    retry: 2,
  });

  // Show error toast when groups fail to load
  useEffect(() => {
    if (groupsError && !groupsLoading) {
      toast({
        title: "Failed to load groups",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    }
  }, [groupsError, groupsLoading, toast]);

  // Handle join parameter from shared WhatsApp link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode && user) {
      setInviteCode(joinCode.toUpperCase());
      setJoinDialogOpen(true);
      // Clean up URL
      window.history.replaceState({}, '', '/groups');
    }
  }, [user]);

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("/api/groups", "POST", {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : undefined,
        budget: data.budget ? parseInt(data.budget) : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Group created!",
        description: "Start inviting members and planning your event.",
      });
      setCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        eventType: "",
        eventDate: "",
        locationPreference: "",
        budget: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join group by invite code
  const joinGroupMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest(`/api/groups/join/${code}`, "POST");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Joined group!",
        description: "You've successfully joined the planning group.",
      });
      setJoinDialogOpen(false);
      setInviteCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid invite code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle logout
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Handle form submission
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      });
      return;
    }
    createGroupMutation.mutate(formData);
  };

  // Handle join group
  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({
        title: "Invite code required",
        description: "Please enter an invite code.",
        variant: "destructive",
      });
      return;
    }
    joinGroupMutation.mutate(inviteCode.trim());
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" data-testid="link-back-dashboard">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard" data-testid="link-home">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1">
                <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
                <span className="font-heading font-bold text-xl bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hidden sm:inline">
                  Group Planning
                </span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
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
        {/* Hero Banner - Matching Home Page Style */}
        <div className="mb-8 relative overflow-hidden rounded-2xl shadow-xl">
          <img 
            src={heroImage} 
            alt="Celebration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
          <div className="relative z-10 p-4 md:p-8 min-h-[120px] md:min-h-[180px] flex items-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2 flex items-center gap-2 text-white" data-testid="text-banner-title">
                    {bannerData.title}
                  </h1>
                  <p className="text-white/80 text-sm md:text-lg" data-testid="text-banner-subtitle">{bannerData.subtitle}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 self-start md:self-auto">
              {/* Join Group Button */}
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    data-testid="button-join-group"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Planning Group</DialogTitle>
                    <DialogDescription>
                      Enter the invite code or scan QR code shared with you
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleJoinGroup} className="space-y-4">
                    <div>
                      <Label htmlFor="invite-code">Invite Code</Label>
                      <Input
                        id="invite-code"
                        placeholder="Enter 8-character code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={8}
                        className="uppercase tracking-widest font-mono text-lg text-center"
                        data-testid="input-invite-code"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={joinGroupMutation.isPending}
                      data-testid="button-submit-join"
                    >
                      {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Create Group Button */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-white text-orange-600 hover:bg-white/90"
                    data-testid="button-create-group"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      Create Planning Group
                    </DialogTitle>
                    <DialogDescription>
                      Start planning your event together with friends and family
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name *</Label>
                      <Input
                        id="group-name"
                        placeholder="e.g., Raj's Birthday Bash Planning"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="input-group-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="group-description">Description</Label>
                      <Textarea
                        id="group-description"
                        placeholder="What are we planning?"
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
                            {EVENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="event-date">Event Date</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          data-testid="input-event-date"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Preferred Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Mumbai"
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
                          placeholder="e.g., 50000"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          data-testid="input-budget"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600" 
                      disabled={createGroupMutation.isPending}
                      data-testid="button-submit-create"
                    >
                      {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Edit Banner Button */}
              <Dialog open={bannerEditOpen} onOpenChange={(open) => {
                setBannerEditOpen(open);
                if (open) {
                  setTempBannerData(bannerData);
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    data-testid="button-edit-banner"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Pencil className="w-5 h-5 text-orange-500" />
                      Customize Banner
                    </DialogTitle>
                    <DialogDescription>
                      Personalize the banner title and subtitle
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="banner-title">Banner Title</Label>
                      <Input
                        id="banner-title"
                        placeholder="e.g., Group Planning"
                        value={tempBannerData.title}
                        onChange={(e) => setTempBannerData({ ...tempBannerData, title: e.target.value })}
                        data-testid="input-banner-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="banner-subtitle">Banner Subtitle</Label>
                      <Textarea
                        id="banner-subtitle"
                        placeholder="e.g., Collaborate with friends and family"
                        value={tempBannerData.subtitle}
                        onChange={(e) => setTempBannerData({ ...tempBannerData, subtitle: e.target.value })}
                        className="resize-none"
                        rows={2}
                        data-testid="input-banner-subtitle"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setTempBannerData({ title: "Group Planning", subtitle: "Collaborate with friends and family to plan perfect events" });
                        }}
                        data-testid="button-reset-banner"
                      >
                        Reset to Default
                      </Button>
                      <Button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        onClick={handleSaveBanner}
                        data-testid="button-save-banner"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          </div>
          
          {/* Stats Row */}
          {groups && groups.length > 0 && (
            <div className="relative z-10 px-4 md:px-8 pb-4 md:pb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">{groups.length}</div>
                <div className="text-white/70 text-sm">Active Groups</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">
                  {groups.reduce((sum, g) => sum + (g.memberCount || 0), 0)}
                </div>
                <div className="text-white/70 text-sm">Total Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">
                  {groups.filter(g => g.status === "planning").length}
                </div>
                <div className="text-white/70 text-sm">In Planning</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
                <div className="text-2xl font-bold">
                  {groups.filter(g => new Date(g.eventDate!) > new Date()).length}
                </div>
                <div className="text-white/70 text-sm">Upcoming Events</div>
              </div>
            </div>
          )}
        </div>

        {/* Groups List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Your Planning Groups
            </h2>
          </div>

          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <EmptyGroupsState onCreateClick={() => setCreateDialogOpen(true)} />
          )}
        </div>
      </main>
    </div>
  );
}

// Group Card Component
function GroupCard({ group }: { group: GroupWithDetails }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const eventTypeLabel = EVENT_TYPES.find(t => t.value === group.eventType)?.label || group.eventType;
  const statusColor = STATUS_COLORS[group.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.planning;
  
  const copyInviteCode = () => {
    if (group.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      toast({
        title: "Invite code copied!",
        description: `Share "${group.inviteCode}" with others to invite them.`,
      });
    }
  };
  
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer group">
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-orange-600 transition-colors" data-testid={`text-group-name-${group.id}`}>
              {group.name}
            </h3>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {group.description}
              </p>
            )}
          </div>
          <Badge className={`${statusColor} ml-2 shrink-0`} data-testid={`badge-status-${group.id}`}>
            {group.status}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {eventTypeLabel && (
            <Badge variant="secondary" className="gap-1">
              <Target className="w-3 h-3" />
              {eventTypeLabel}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Users className="w-3 h-3" />
            {group.memberCount || 1} members
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          {group.eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{format(new Date(group.eventDate), "PPP")}</span>
            </div>
          )}
          {group.locationPreference && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{group.locationPreference}</span>
            </div>
          )}
          {group.budget && (
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-orange-500" />
              <span>{Number(group.budget).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            onClick={() => setLocation(`/groups/${group.id}`)}
            data-testid={`button-view-group-${group.id}`}
          >
            Open
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          {group.inviteCode && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyInviteCode();
              }}
              data-testid={`button-copy-invite-${group.id}`}
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyGroupsState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-orange-500" />
        </div>
        <h3 className="text-xl font-heading font-semibold mb-2">No Planning Groups Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Start collaborating with friends and family! Create a group to plan your next celebration together - 
          from voting on venues to tracking expenses.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            onClick={onCreateClick}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            data-testid="button-empty-create-group"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Group
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-2xl">
          <div className="text-center p-4">
            <Vote className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-sm font-medium">Polls & Voting</div>
          </div>
          <div className="text-center p-4">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <div className="text-sm font-medium">Itinerary Builder</div>
          </div>
          <div className="text-center p-4">
            <IndianRupee className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-sm font-medium">Expense Tracking</div>
          </div>
          <div className="text-center p-4">
            <UserCog className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <div className="text-sm font-medium">Role Assignment</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
