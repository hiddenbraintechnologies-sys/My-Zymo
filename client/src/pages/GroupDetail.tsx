import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
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
  Users, Plus, ArrowLeft, Calendar, MapPin, IndianRupee,
  Settings, Vote, ClipboardList, UserCog, Image, MessageSquare,
  ChevronRight, Share2, QrCode, Copy, LogOut, Sparkles, Clock, Target,
  Check, X, Edit, Trash2, Crown, UserPlus, Star, MoreVertical, AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EventGroup, EventGroupMember, User, GroupPoll, GroupPollOption, GroupPollVote, GroupItineraryItem, GroupExpense } from "@shared/schema";

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
  expenses?: GroupExpense[];
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

export default function GroupDetail() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/groups/:id");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

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
  const { data: expenses } = useQuery<GroupExpense[]>({
    queryKey: ["/api/groups", groupId, "expenses"],
    enabled: !!user && !!groupId,
  });

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
            <Link href="/groups" data-testid="link-back-groups">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard" data-testid="link-home">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md px-2 py-1">
                <img src={logoUrl} alt="Myzymo" className="w-10 h-10" />
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {group.inviteCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteCode}
                className="gap-2"
                data-testid="button-copy-invite"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
            
            {(isAdmin || isCreator) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-group-menu">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Group Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 md:p-8 text-white shadow-xl mb-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${STATUS_COLORS[group.status as keyof typeof STATUS_COLORS]} bg-white/20 backdrop-blur border-0`}>
                    {group.status}
                  </Badge>
                  {group.eventType && (
                    <Badge className="bg-white/20 backdrop-blur border-0">
                      {group.eventType.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2" data-testid="text-group-name">
                  {group.name}
                </h1>
                
                {group.description && (
                  <p className="text-white/80 max-w-2xl">{group.description}</p>
                )}
              </div>
              
              {group.inviteCode && (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-sm text-white/70 mb-1">Invite Code</div>
                  <div className="font-mono text-2xl font-bold tracking-widest" data-testid="text-invite-code">
                    {group.inviteCode}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {group.eventDate && (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <Calendar className="w-5 h-5 mb-2 text-white/70" />
                  <div className="text-sm text-white/70">Event Date</div>
                  <div className="font-semibold">{format(new Date(group.eventDate), "PPP")}</div>
                </div>
              )}
              {group.locationPreference && (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <MapPin className="w-5 h-5 mb-2 text-white/70" />
                  <div className="text-sm text-white/70">Location</div>
                  <div className="font-semibold">{group.locationPreference}</div>
                </div>
              )}
              {group.budget && (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <IndianRupee className="w-5 h-5 mb-2 text-white/70" />
                  <div className="text-sm text-white/70">Budget</div>
                  <div className="font-semibold">{Number(group.budget).toLocaleString("en-IN")}</div>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <Users className="w-5 h-5 mb-2 text-white/70" />
                <div className="text-sm text-white/70">Members</div>
                <div className="font-semibold">{group.memberCount || group.members?.length || 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview" className="gap-2 py-3" data-testid="tab-overview">
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="polls" className="gap-2 py-3" data-testid="tab-polls">
              <Vote className="w-4 h-4" />
              <span className="hidden md:inline">Polls</span>
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="gap-2 py-3" data-testid="tab-itinerary">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden md:inline">Itinerary</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2 py-3" data-testid="tab-members">
              <UserCog className="w-4 h-4" />
              <span className="hidden md:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2 py-3" data-testid="tab-expenses">
              <IndianRupee className="w-4 h-4" />
              <span className="hidden md:inline">Expenses</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewTab group={group} polls={polls} itinerary={itinerary} expenses={expenses} />
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls" className="space-y-6">
            <PollsTab groupId={groupId!} polls={polls} isAdmin={isAdmin || isCreator} />
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <ItineraryTab groupId={groupId!} itinerary={itinerary} isAdmin={isAdmin || isCreator} />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <MembersTab group={group} isAdmin={isAdmin || isCreator} />
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <ExpensesTab groupId={groupId!} expenses={expenses} members={group.members} isAdmin={isAdmin || isCreator} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ 
  group, 
  polls, 
  itinerary, 
  expenses 
}: { 
  group: GroupWithFullDetails; 
  polls?: GroupPollWithDetails[];
  itinerary?: GroupItineraryItem[];
  expenses?: GroupExpense[];
}) {
  const activePolls = polls?.filter(p => p.status === "active") || [];
  const upcomingItems = itinerary?.filter(i => new Date(i.startTime) > new Date()).slice(0, 3) || [];
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Active Polls Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Vote className="w-5 h-5 text-orange-500" />
            Active Polls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePolls.length > 0 ? (
            <div className="space-y-3">
              {activePolls.slice(0, 3).map(poll => (
                <div key={poll.id} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium truncate">{poll.question}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {poll.totalVotes} votes
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Vote className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No active polls</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Activities Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            Upcoming Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingItems.length > 0 ? (
            <div className="space-y-3">
              {upcomingItems.map(item => (
                <div key={item.id} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {format(new Date(item.startTime), "PPp")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No upcoming activities</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-green-500" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-medium">{Number(group.budget || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium text-orange-600">{totalExpenses.toLocaleString("en-IN")}</span>
              </div>
              {group.budget && (
                <>
                  <Progress 
                    value={(totalExpenses / Number(group.budget)) * 100} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {Math.round((totalExpenses / Number(group.budget)) * 100)}% used
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Members */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Group Members ({group.members?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {group.members?.map(member => (
              <div key={member.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.user?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {member.user?.firstName?.[0] || member.user?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">
                    {member.user?.firstName || member.user?.username}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                </div>
                {member.role === "admin" && (
                  <Crown className="w-4 h-4 text-amber-500" />
                )}
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
  isAdmin 
}: { 
  groupId: string; 
  polls?: GroupPollWithDetails[];
  isAdmin: boolean;
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
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500" data-testid="button-create-poll">
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

// Itinerary Tab Component
function ItineraryTab({ 
  groupId, 
  itinerary, 
  isAdmin 
}: { 
  groupId: string; 
  itinerary?: GroupItineraryItem[];
  isAdmin: boolean;
}) {
  const { toast } = useToast();
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
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
      setNewItem({ title: "", description: "", startTime: "", endTime: "", location: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add activity", variant: "destructive" });
    },
  });

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
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500" data-testid="button-add-activity">
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
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="Where will this take place?"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    data-testid="input-activity-location"
                  />
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
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-amber-500 to-orange-300" />
          <div className="space-y-4 ml-10">
            {sortedItinerary.map((item, index) => (
              <Card key={item.id} className="relative">
                <div className="absolute -left-10 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 border-2 border-background" />
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
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
                    </div>
                    <Badge variant={item.status === "completed" ? "secondary" : "outline"} className="shrink-0">
                      {item.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  );
}

// Members Tab Component
function MembersTab({ 
  group, 
  isAdmin 
}: { 
  group: GroupWithFullDetails; 
  isAdmin: boolean;
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
            <Card key={member.id} className={isCurrentUser ? "border-orange-300 dark:border-orange-800" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
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

// Expenses Tab Component
function ExpensesTab({ 
  groupId, 
  expenses, 
  members, 
  isAdmin 
}: { 
  groupId: string; 
  expenses?: GroupExpense[];
  members?: GroupMemberWithUser[];
  isAdmin: boolean;
}) {
  const { toast } = useToast();
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "other",
    paidById: "",
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: typeof newExpense) => {
      const amount = parseFloat(data.amount);
      const memberCount = members?.length || 1;
      const splitAmount = (amount / memberCount).toFixed(2);
      
      const splits = members?.map(member => ({
        userId: member.userId,
        amount: splitAmount,
        isPayer: member.userId === data.paidById
      })) || [];
      
      const res = await apiRequest(`/api/groups/${groupId}/expenses`, "POST", {
        description: data.description,
        amount: amount,
        category: data.category,
        splitType: "equal",
        splits: splits,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "expenses"] });
      toast({ title: "Expense added!" });
      setAddExpenseOpen(false);
      setNewExpense({ description: "", amount: "", category: "other", paidById: "" });
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

  const CATEGORIES = ["venue", "food", "transport", "decoration", "entertainment", "other"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Expenses</h2>
        <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500" data-testid="button-add-expense">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>Record an expense for the group</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="What was this expense for?"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  data-testid="input-expense-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (INR)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    data-testid="input-expense-amount"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
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
              </div>
              <div>
                <Label>Paid By</Label>
                <Select
                  value={newExpense.paidById}
                  onValueChange={(value) => setNewExpense({ ...newExpense, paidById: value })}
                >
                  <SelectTrigger data-testid="select-expense-paid-by">
                    <SelectValue placeholder="Select member" />
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
              <Button 
                className="w-full" 
                onClick={() => addExpenseMutation.mutate(newExpense)}
                disabled={addExpenseMutation.isPending || !newExpense.description.trim() || !newExpense.amount || !newExpense.paidById}
                data-testid="button-submit-expense"
              >
                {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold flex items-center">
              <IndianRupee className="w-5 h-5" />
              {totalExpenses.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
        {Object.entries(expensesByCategory).slice(0, 3).map(([category, amount]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground capitalize">{category}</div>
              <div className="text-xl font-bold flex items-center">
                <IndianRupee className="w-4 h-4" />
                {Number(amount).toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expense List */}
      {expenses && expenses.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {expenses.map(expense => {
                const payer = members?.find(m => m.userId === expense.paidById);
                return (
                  <div key={expense.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          Paid by {payer?.user?.firstName || "Unknown"} • {expense.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {Number(expense.amount).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(expense.createdAt!), "PP")}
                      </div>
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
