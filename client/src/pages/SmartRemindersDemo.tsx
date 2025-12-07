import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Bell, BellRing, Clock, Calendar, IndianRupee, MessageCircle, 
  Users, Check, X, Settings, Plus, Trash2, Star, Lock,
  Sparkles, PartyPopper, Gift, ChevronRight, Volume2, VolumeX
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Notification {
  id: string;
  type: "event" | "message" | "payment" | "rsvp";
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
}

interface Reminder {
  id: string;
  title: string;
  eventName: string;
  dueDate: string;
  dueTime: string;
  enabled: boolean;
  type: "before_event" | "rsvp_deadline" | "payment_due" | "custom";
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { 
    id: "1", 
    type: "event", 
    title: "Event Tomorrow!", 
    description: "College Reunion 2025 is happening tomorrow at The Grand Ballroom", 
    time: "Just now", 
    read: false,
    icon: Calendar,
    color: "bg-blue-500"
  },
  { 
    id: "2", 
    type: "message", 
    title: "New message from Priya", 
    description: "Hey! Are you bringing the decorations for the party?", 
    time: "5 min ago", 
    read: false,
    icon: MessageCircle,
    color: "bg-purple-500"
  },
  { 
    id: "3", 
    type: "payment", 
    title: "Payment Reminder", 
    description: "You have a pending expense of ₹2,500 for the venue booking", 
    time: "1 hour ago", 
    read: false,
    icon: IndianRupee,
    color: "bg-orange-500"
  },
  { 
    id: "4", 
    type: "rsvp", 
    title: "3 new RSVPs", 
    description: "Rahul, Ananya, and Vikram confirmed attendance for your event", 
    time: "2 hours ago", 
    read: true,
    icon: Users,
    color: "bg-green-500"
  },
  { 
    id: "5", 
    type: "event", 
    title: "Event Update", 
    description: "Birthday Bash venue changed to Sunset Terrace", 
    time: "Yesterday", 
    read: true,
    icon: Calendar,
    color: "bg-blue-500"
  },
];

const DEMO_REMINDERS: Reminder[] = [
  { id: "1", title: "1 day before event", eventName: "College Reunion 2025", dueDate: "Mar 14, 2025", dueTime: "10:00 AM", enabled: true, type: "before_event" },
  { id: "2", title: "RSVP deadline approaching", eventName: "Birthday Bash", dueDate: "Mar 10, 2025", dueTime: "6:00 PM", enabled: true, type: "rsvp_deadline" },
  { id: "3", title: "Payment due reminder", eventName: "Group Trip to Goa", dueDate: "Mar 5, 2025", dueTime: "9:00 AM", enabled: true, type: "payment_due" },
  { id: "4", title: "1 week before event", eventName: "College Reunion 2025", dueDate: "Mar 8, 2025", dueTime: "10:00 AM", enabled: false, type: "before_event" },
];

function getTypeIcon(type: string) {
  switch (type) {
    case "before_event": return <Calendar className="w-4 h-4 text-blue-500" />;
    case "rsvp_deadline": return <Users className="w-4 h-4 text-green-500" />;
    case "payment_due": return <IndianRupee className="w-4 h-4 text-orange-500" />;
    case "custom": return <Bell className="w-4 h-4 text-purple-500" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

export default function SmartRemindersDemo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [reminders, setReminders] = useState<Reminder[]>(DEMO_REMINDERS);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showNewReminderDialog, setShowNewReminderDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLiveNotification, setShowLiveNotification] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate a live notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLiveNotification(true);
      const newNotification: Notification = {
        id: `live-${Date.now()}`,
        type: "message",
        title: "New message from Rahul",
        description: "Just confirmed - I'm bringing 2 friends to the reunion!",
        time: "Just now",
        read: false,
        icon: MessageCircle,
        color: "bg-purple-500"
      };
      setNotifications(prev => [newNotification, ...prev]);
      
      toast({
        title: "New Notification",
        description: "Rahul sent you a message",
      });
      
      setTimeout(() => setShowLiveNotification(false), 3000);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All Caught Up!",
      description: "All notifications marked as read",
    });
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notification Dismissed",
      description: "Notification has been removed",
    });
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    const reminder = reminders.find(r => r.id === id);
    toast({
      title: reminder?.enabled ? "Reminder Disabled" : "Reminder Enabled",
      description: `"${reminder?.title}" for ${reminder?.eventName}`,
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been removed",
    });
  };

  const handlePremiumFeature = () => {
    setShowSignupDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-background dark:from-sky-950/20 dark:to-background">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {/* Floating Icons */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '2.5s' }}>
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-8 right-8 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-6 left-1/4 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '2.8s' }}>
          <PartyPopper className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-4 right-1/4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDuration: '3.2s' }}>
          <Gift className="w-6 h-6 text-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <Badge className="bg-white/20 text-white border-white/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Smart Reminders
          </h1>
          <p className="text-sky-100 text-lg md:text-xl max-w-2xl mb-6">
            Never miss important updates. Get notifications for messages, payments, and event changes.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
              <Bell className="w-3 h-3 mr-1" />
              Push Notifications
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />
              Custom Reminders
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Event Alerts
            </Badge>
          </div>
        </div>
      </div>

      {/* Live Notification Banner */}
      {showLiveNotification && (
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 px-4 animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 animate-bounce" />
              <span className="font-medium">New notification received!</span>
              <span className="text-purple-200">Rahul sent you a message</span>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setShowLiveNotification(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Notification Center */}
            <Card className="border-2 border-sky-200 dark:border-sky-800" data-testid="card-notification-center">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-b">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center relative">
                      <Bell className="w-6 h-6 text-white" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Notification Center</CardTitle>
                      <CardDescription>
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      data-testid="button-mark-all-read"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark All Read
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-2" data-testid="tabs-notifications">
                    <TabsTrigger value="notifications" className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500" data-testid="tab-notifications">
                      <Bell className="w-4 h-4 mr-1" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">{unreadCount}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="reminders" className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500" data-testid="tab-reminders">
                      <Clock className="w-4 h-4 mr-1" />
                      Reminders
                      <Badge variant="secondary" className="ml-2 text-xs">{reminders.filter(r => r.enabled).length}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notifications" className="m-0">
                    <ScrollArea className="h-[400px]" data-testid="notification-list">
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''}`}
                            data-testid={`notification-${notification.id}`}
                          >
                            <div className={`w-10 h-10 rounded-full ${notification.color} flex items-center justify-center flex-shrink-0`}>
                              <notification.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notification.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      data-testid={`button-read-${notification.id}`}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDismissNotification(notification.id)}
                                    data-testid={`button-dismiss-${notification.id}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-2" />
                            )}
                          </div>
                        ))}
                        
                        {notifications.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="reminders" className="m-0">
                    <div className="p-4 border-b">
                      <Button
                        className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
                        onClick={() => setShowNewReminderDialog(true)}
                        data-testid="button-add-reminder"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reminder
                      </Button>
                    </div>
                    <ScrollArea className="h-[350px]" data-testid="reminder-list">
                      <div className="divide-y">
                        {reminders.map((reminder) => (
                          <div
                            key={reminder.id}
                            className={`flex items-center justify-between gap-4 p-4 ${!reminder.enabled ? 'opacity-50' : ''}`}
                            data-testid={`reminder-${reminder.id}`}
                          >
                            <div className="flex items-center gap-3">
                              {getTypeIcon(reminder.type)}
                              <div>
                                <p className="font-medium">{reminder.title}</p>
                                <p className="text-sm text-muted-foreground">{reminder.eventName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {reminder.dueDate} at {reminder.dueTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={reminder.enabled}
                                onCheckedChange={() => handleToggleReminder(reminder.id)}
                                data-testid={`switch-reminder-${reminder.id}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteReminder(reminder.id)}
                                data-testid={`button-delete-${reminder.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {reminders.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No reminders set</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings Card */}
            <Card className="border-2 border-sky-200 dark:border-sky-800" data-testid="card-notification-settings">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-500" />
                  Quick Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-500" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                    <Label>Sound</Label>
                  </div>
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                    data-testid="switch-sound"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {soundEnabled ? "Notification sounds are on" : "Sounds are muted"}
                </div>
              </CardContent>
            </Card>

            {/* Premium Features Card */}
            <Card className="border-2 border-sky-200 dark:border-sky-800" data-testid="card-premium-features">
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-sky-500" />
                  Premium Features
                </CardTitle>
                <CardDescription>
                  Unlock advanced notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-email"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Email Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-sms"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  SMS Reminders
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-calendar"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Calendar Sync
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handlePremiumFeature}
                  data-testid="button-locked-recurring"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Recurring Reminders
                </Button>
                
                <div className="pt-3 border-t">
                  <Button
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
                    onClick={() => navigate("/signup")}
                    data-testid="button-sidebar-signup"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card data-testid="card-notification-types">
              <CardHeader>
                <CardTitle className="text-lg">Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Event Updates</p>
                    <p className="text-muted-foreground text-xs">Changes, reminders</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Messages</p>
                    <p className="text-muted-foreground text-xs">Group chats, DMs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Payments</p>
                    <p className="text-muted-foreground text-xs">Due, received</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">RSVPs</p>
                    <p className="text-muted-foreground text-xs">Confirmations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <Card className="p-8 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-2 border-sky-200 dark:border-sky-800">
            <h3 className="text-2xl font-bold mb-2">Stay in the Loop</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Sign up for free to receive real-time notifications, set custom reminders, and never miss an important update for your events.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
                onClick={() => navigate("/signup")}
                data-testid="button-cta-signup"
              >
                <Bell className="w-5 h-5 mr-2" />
                Enable Notifications
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
              <Star className="w-5 h-5 text-sky-500" />
              Premium Feature
            </DialogTitle>
            <DialogDescription>
              This feature requires a free account. Sign up to unlock:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-sky-500" />
              Email notifications for all events
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-sky-500" />
              SMS reminders for important deadlines
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-sky-500" />
              Google/Apple Calendar sync
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-sky-500" />
              Recurring reminder schedules
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
              className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
              onClick={() => navigate("/signup")}
              data-testid="button-prompt-signup"
            >
              Sign Up Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reminder Dialog */}
      <Dialog open={showNewReminderDialog} onOpenChange={setShowNewReminderDialog}>
        <DialogContent data-testid="dialog-add-reminder" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-500" />
              Add New Reminder
            </DialogTitle>
            <DialogDescription>
              Create a custom reminder for your events
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select defaultValue="before_event">
                <SelectTrigger data-testid="select-reminder-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_event">Before Event</SelectItem>
                  <SelectItem value="rsvp_deadline">RSVP Deadline</SelectItem>
                  <SelectItem value="payment_due">Payment Due</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Event</Label>
              <Select defaultValue="reunion">
                <SelectTrigger data-testid="select-event">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reunion">College Reunion 2025</SelectItem>
                  <SelectItem value="birthday">Birthday Bash</SelectItem>
                  <SelectItem value="trip">Group Trip to Goa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>When to Remind</Label>
              <Select defaultValue="1day">
                <SelectTrigger data-testid="select-when">
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1hour">1 hour before</SelectItem>
                  <SelectItem value="1day">1 day before</SelectItem>
                  <SelectItem value="3days">3 days before</SelectItem>
                  <SelectItem value="1week">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewReminderDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
              onClick={() => {
                const newReminder: Reminder = {
                  id: `new-${Date.now()}`,
                  title: "1 day before event",
                  eventName: "College Reunion 2025",
                  dueDate: "Mar 14, 2025",
                  dueTime: "10:00 AM",
                  enabled: true,
                  type: "before_event"
                };
                setReminders(prev => [...prev, newReminder]);
                setShowNewReminderDialog(false);
                toast({
                  title: "Reminder Created",
                  description: "Your reminder has been set",
                });
              }}
              data-testid="button-save-reminder"
            >
              Create Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
