import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Users, UserPlus, UserCheck, UserX, Clock, Mail, Download, 
  Search, Filter, CheckCircle2, XCircle, HelpCircle, Star,
  Lock, ChevronDown, MoreHorizontal, Calendar, MapPin, 
  PartyPopper, GraduationCap, Sparkles, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Attendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "confirmed" | "pending" | "declined";
  role: "host" | "co-host" | "guest";
  rsvpDate?: string;
  plusOnes: number;
  dietaryNotes?: string;
}

const DEMO_EVENT = {
  name: "College Reunion 2025",
  date: "March 15, 2025",
  location: "The Grand Ballroom, Mumbai",
  totalInvited: 50,
};

const DEMO_ATTENDEES: Attendee[] = [
  { id: "1", name: "You (Demo User)", email: "you@demo.com", status: "confirmed", role: "host", rsvpDate: "2 days ago", plusOnes: 1 },
  { id: "2", name: "Priya Sharma", email: "priya.s@email.com", status: "confirmed", role: "co-host", rsvpDate: "1 week ago", plusOnes: 0, dietaryNotes: "Vegetarian" },
  { id: "3", name: "Rahul Verma", email: "rahul.v@email.com", status: "confirmed", role: "guest", rsvpDate: "3 days ago", plusOnes: 2 },
  { id: "4", name: "Ananya Patel", email: "ananya.p@email.com", status: "confirmed", role: "guest", rsvpDate: "5 days ago", plusOnes: 1, dietaryNotes: "No nuts" },
  { id: "5", name: "Vikram Singh", email: "vikram.s@email.com", status: "pending", role: "guest", plusOnes: 0 },
  { id: "6", name: "Meera Reddy", email: "meera.r@email.com", status: "pending", role: "guest", plusOnes: 0 },
  { id: "7", name: "Arjun Kumar", email: "arjun.k@email.com", status: "pending", role: "guest", plusOnes: 0 },
  { id: "8", name: "Neha Gupta", email: "neha.g@email.com", status: "declined", role: "guest", rsvpDate: "1 day ago", plusOnes: 0 },
  { id: "9", name: "Sanjay Joshi", email: "sanjay.j@email.com", status: "confirmed", role: "guest", rsvpDate: "4 days ago", plusOnes: 1 },
  { id: "10", name: "Kavita Menon", email: "kavita.m@email.com", status: "confirmed", role: "guest", rsvpDate: "6 days ago", plusOnes: 0, dietaryNotes: "Vegan" },
];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusIcon(status: string) {
  switch (status) {
    case "confirmed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "pending": return <HelpCircle className="w-4 h-4 text-amber-500" />;
    case "declined": return <XCircle className="w-4 h-4 text-red-500" />;
    default: return null;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Confirmed</Badge>;
    case "pending": return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Pending</Badge>;
    case "declined": return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Declined</Badge>;
    default: return null;
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case "host": return <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400">Host</Badge>;
    case "co-host": return <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">Co-host</Badge>;
    default: return null;
  }
}

export default function AttendeeManagementDemo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [attendees, setAttendees] = useState<Attendee[]>(DEMO_ATTENDEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const confirmedCount = attendees.filter(a => a.status === "confirmed").length;
  const pendingCount = attendees.filter(a => a.status === "pending").length;
  const declinedCount = attendees.filter(a => a.status === "declined").length;
  const totalGuests = attendees.filter(a => a.status === "confirmed").reduce((sum, a) => sum + 1 + a.plusOnes, 0);

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePremiumFeature = () => {
    setShowSignupDialog(true);
  };

  const handleStatusChange = (attendeeId: string, newStatus: "confirmed" | "pending" | "declined") => {
    setAttendees(prev => prev.map(a => 
      a.id === attendeeId ? { ...a, status: newStatus, rsvpDate: "Just now" } : a
    ));
    toast({
      title: "RSVP Updated",
      description: `Guest status changed to ${newStatus}`,
    });
  };

  const handleSendReminder = (attendee: Attendee) => {
    toast({
      title: "Reminder Sent!",
      description: `RSVP reminder sent to ${attendee.name}`,
    });
  };

  const handleInviteGuest = () => {
    if (!inviteEmail.trim()) return;
    
    const newAttendee: Attendee = {
      id: `new-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      status: "pending",
      role: "guest",
      plusOnes: 0,
    };
    
    setAttendees(prev => [...prev, newAttendee]);
    setInviteEmail("");
    setShowInviteDialog(false);
    
    toast({
      title: "Invitation Sent!",
      description: `${inviteEmail} has been invited to the event`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/20 dark:to-background">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {/* Floating Icons */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '2.5s' }}>
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-8 right-8 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-6 left-1/4 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '2.8s' }}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-4 right-1/4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '3.2s' }}>
          <PartyPopper className="w-6 h-6 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <Badge className="bg-white/20 text-white border-white/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Attendee Management
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mb-6">
            Track RSVPs, manage your guest list, and keep everyone updated. Try the demo below!
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
              <UserCheck className="w-3 h-3 mr-1" />
              RSVP Tracking
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
              <Mail className="w-3 h-3 mr-1" />
              Send Invitations
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              Guest List
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Event Info Card */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-800" data-testid="card-event-info">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-b">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{DEMO_EVENT.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {DEMO_EVENT.date}
                        <span className="text-muted-foreground">•</span>
                        <MapPin className="w-3 h-3" />
                        {DEMO_EVENT.location}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowInviteDialog(true)}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                    data-testid="button-invite-guest"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Guest
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{confirmedCount}</p>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{declinedCount}</p>
                    <p className="text-sm text-muted-foreground">Declined</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalGuests}</p>
                    <p className="text-sm text-muted-foreground">Total Guests</p>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-attendees"
                    />
                  </div>
                  <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full md:w-auto">
                    <TabsList data-testid="tabs-filter-status">
                      <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                      <TabsTrigger value="confirmed" data-testid="tab-confirmed">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Confirmed
                      </TabsTrigger>
                      <TabsTrigger value="pending" data-testid="tab-pending">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </TabsTrigger>
                      <TabsTrigger value="declined" data-testid="tab-declined">
                        <XCircle className="w-3 h-3 mr-1" />
                        Declined
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Attendee List */}
                <ScrollArea className="h-[400px]" data-testid="attendee-list">
                  <div className="space-y-2">
                    {filteredAttendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        data-testid={`attendee-row-${attendee.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={attendee.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-green-500 text-white text-sm">
                              {getInitials(attendee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{attendee.name}</p>
                              {getRoleBadge(attendee.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{attendee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {attendee.plusOnes > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              +{attendee.plusOnes} guest{attendee.plusOnes > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {attendee.dietaryNotes && (
                            <Badge variant="outline" className="text-xs">
                              {attendee.dietaryNotes}
                            </Badge>
                          )}
                          {getStatusBadge(attendee.status)}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${attendee.id}`}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, "confirmed")}>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                Mark Confirmed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, "pending")}>
                                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                Mark Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, "declined")}>
                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                Mark Declined
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {attendee.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleSendReminder(attendee)}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {filteredAttendees.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No attendees found matching your search
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Premium Features Card */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-800" data-testid="card-premium-features">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-500" />
                  Premium Features
                </CardTitle>
                <CardDescription>
                  Unlock full attendee management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-export"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  <Download className="w-4 h-4 mr-2" />
                  Export Guest List
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-bulk-email"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  <Mail className="w-4 h-4 mr-2" />
                  Bulk Email Invites
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-check-in"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  <UserCheck className="w-4 h-4 mr-2" />
                  Event Check-in
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-seating"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  <Users className="w-4 h-4 mr-2" />
                  Seating Arrangements
                </Button>
                
                <div className="pt-3 border-t">
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                    onClick={() => navigate("/signup")}
                    data-testid="button-sidebar-signup"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card data-testid="card-quick-stats">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response Rate</span>
                  <Badge variant="secondary">{Math.round(((confirmedCount + declinedCount) / attendees.length) * 100)}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dietary Requirements</span>
                  <Badge variant="secondary">{attendees.filter(a => a.dietaryNotes).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plus Ones</span>
                  <Badge variant="secondary">{attendees.reduce((sum, a) => sum + a.plusOnes, 0)}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <Card className="p-8 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800">
            <h3 className="text-2xl font-bold mb-2">Ready to Manage Your Event?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Sign up for free to create your own events, invite guests, track RSVPs, and unlock all premium features.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                onClick={() => navigate("/signup")}
                data-testid="button-cta-signup"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/")}
                data-testid="button-cta-explore"
              >
                Explore More Features
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Signup Prompt Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent data-testid="dialog-signup-prompt" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-500" />
              Premium Feature
            </DialogTitle>
            <DialogDescription>
              This feature requires a free account. Sign up to unlock:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Export guest lists to CSV/Excel
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Send bulk email invitations
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Event day check-in system
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Seating arrangement planner
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSignupDialog(false)}
              data-testid="button-prompt-continue"
            >
              Continue Exploring
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              onClick={() => navigate("/signup")}
              data-testid="button-prompt-signup"
            >
              Sign Up Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Guest Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent data-testid="dialog-invite-guest" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              Invite Guest
            </DialogTitle>
            <DialogDescription>
              Add a guest to your event. They'll receive an invitation to RSVP.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter email address..."
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInviteGuest()}
              data-testid="input-invite-email"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              onClick={handleInviteGuest}
              disabled={!inviteEmail.trim()}
              data-testid="button-send-invite"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
