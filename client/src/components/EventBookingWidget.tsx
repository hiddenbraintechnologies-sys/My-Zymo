import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Search,
  GraduationCap,
  Cake,
  Bike,
  Dumbbell,
  Trophy,
  Home,
  ArrowRight,
  Sparkles,
  IndianRupee,
  Plus
} from "lucide-react";
import { format } from "date-fns";

const eventTypes = [
  { id: "reunions", label: "Reunions", icon: GraduationCap },
  { id: "birthdays", label: "Birthdays", icon: Cake },
  { id: "rides", label: "Group Rides", icon: Bike },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "sports", label: "Sports", icon: Trophy },
  { id: "family", label: "Family", icon: Home },
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa"
];

export default function EventBookingWidget() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("create");
  const [selectedEventType, setSelectedEventType] = useState("reunions");
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState("10-20");

  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleFindEvents = () => {
    navigate("/events");
  };

  const handleSplitExpenses = () => {
    navigate("/split-expenses");
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/95 dark:bg-card/95 backdrop-blur-sm" data-testid="card-booking-widget">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-auto p-0 gap-0">
            <TabsTrigger 
              value="create" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm md:text-base font-medium"
              data-testid="tab-create-event"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger 
              value="find" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm md:text-base font-medium"
              data-testid="tab-find-events"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Find Events</span>
              <span className="sm:hidden">Find</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 md:px-6 py-3 text-xs sm:text-sm md:text-base font-medium"
              data-testid="tab-split-expenses"
            >
              <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Split Expenses</span>
              <span className="sm:hidden">Split</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="p-4 sm:p-6 space-y-4 sm:space-y-6 mt-0">
            <div className="flex flex-wrap gap-2 pb-4 border-b">
              {eventTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedEventType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedEventType(type.id)}
                  className="gap-2"
                  data-testid={`button-event-type-${type.id}`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-12" data-testid="select-location">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal"
                      data-testid="button-select-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Expected Guests</Label>
                <Select value={attendees} onValueChange={setAttendees}>
                  <SelectTrigger className="h-12" data-testid="select-attendees">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 guests</SelectItem>
                    <SelectItem value="10-20">10-20 guests</SelectItem>
                    <SelectItem value="20-50">20-50 guests</SelectItem>
                    <SelectItem value="50-100">50-100 guests</SelectItem>
                    <SelectItem value="100+">100+ guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground invisible">Action</Label>
                <Button 
                  className="w-full h-12" 
                  size="lg"
                  onClick={handleCreateEvent}
                  data-testid="button-create-event-submit"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="find" className="p-4 sm:p-6 space-y-4 sm:space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Search Events</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or type..." 
                    className="h-12 pl-10"
                    data-testid="input-search-events"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <Select>
                  <SelectTrigger className="h-12" data-testid="select-find-location">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any location</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground invisible">Action</Label>
                <Button 
                  className="w-full h-12" 
                  size="lg"
                  onClick={handleFindEvents}
                  data-testid="button-search-events-submit"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Events
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="p-4 sm:p-6 mt-0">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-semibold">Split Bills Easily</h3>
                <p className="text-muted-foreground">
                  Track expenses, split costs fairly among friends, and see who owes whom. 
                  No more awkward money conversations!
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Auto-split</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Settlement suggestions</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Export PDF</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white min-w-[200px]"
                onClick={handleSplitExpenses}
                data-testid="button-try-split-expenses"
              >
                <IndianRupee className="w-4 h-4 mr-2" />
                Try Split Expenses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
