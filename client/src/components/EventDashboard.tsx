import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, PartyPopper } from "lucide-react";
import EventCard from "./EventCard";
import birthdayImage from "@assets/generated_images/birthday_party_event_placeholder.png";
import reunionImage from "@assets/generated_images/college_reunion_event_placeholder.png";
import familyImage from "@assets/generated_images/family_gathering_event_placeholder.png";

// TODO: Remove mock data
const upcomingEvents = [
  {
    id: "1",
    title: "College Reunion 2025",
    date: new Date(2025, 11, 20, 18, 0),
    location: "IIT Campus, Delhi",
    attendees: 45,
    image: reunionImage,
  },
  {
    id: "2",
    title: "Priya's Birthday Party",
    date: new Date(2025, 11, 15, 19, 0),
    location: "The Garden Cafe, Mumbai",
    attendees: 24,
    image: birthdayImage,
  },
];

const pastEvents = [
  {
    id: "3",
    title: "Family Get Together",
    date: new Date(2025, 10, 5, 12, 0),
    location: "Home, Bangalore",
    attendees: 18,
    image: familyImage,
  },
];

export default function EventDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-2">
              My Events
            </h1>
            <p className="text-muted-foreground">
              Manage and track all your celebrations
            </p>
          </div>
          <Button 
            size="lg" 
            className="gap-2"
            data-testid="button-create-event"
            onClick={() => console.log('Create event clicked')}
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="tab-past">
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          
          <TabsContent value="past">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} {...event} status="past" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <PartyPopper className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-heading font-semibold text-2xl mb-2">
        No events yet
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start planning your first celebration! Create an event to invite friends and get started.
      </p>
      <Button data-testid="button-create-first-event">
        Create Your First Event
      </Button>
    </div>
  );
}
