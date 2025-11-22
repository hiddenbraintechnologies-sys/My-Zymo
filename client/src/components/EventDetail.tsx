import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Edit, Share2 } from "lucide-react";
import ChatInterface from "./ChatInterface";
import ExpenseTracker from "./ExpenseTracker";
import reunionImage from "@assets/generated_images/college_reunion_event_placeholder.png";

// TODO: Remove mock data
const attendees = [
  { name: "Rahul Kumar", initials: "RK", status: "Going" },
  { name: "Priya Sharma", initials: "PS", status: "Going" },
  { name: "Amit Patel", initials: "AP", status: "Maybe" },
  { name: "Sneha Verma", initials: "SV", status: "Going" },
  { name: "Arjun Singh", initials: "AS", status: "Going" },
];

export default function EventDetail() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full aspect-video md:aspect-[21/9] overflow-hidden">
        <img 
          src={reunionImage} 
          alt="Event" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">
              College Reunion 2025
            </h1>
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  <span>December 20, 2025 at 6:00 PM</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>IIT Campus, Delhi</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>45 attendees</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm">
                  Join us for an evening of nostalgia and celebration as we reconnect with our college friends after 10 years! Let's relive those golden days together.
                </p>
              </div>
            </Card>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              data-testid="button-share-event"
              onClick={() => console.log('Share clicked')}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              className="gap-2"
              data-testid="button-edit-event"
              onClick={() => console.log('Edit clicked')}
            >
              <Edit className="w-5 h-5" />
              Edit Event
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="chat" data-testid="tab-chat">Chat</TabsTrigger>
            <TabsTrigger value="attendees" data-testid="tab-attendees">Attendees</TabsTrigger>
            <TabsTrigger value="expenses" data-testid="tab-expenses">Expenses</TabsTrigger>
            <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <ChatInterface />
          </TabsContent>
          
          <TabsContent value="attendees">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendees.map((attendee, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{attendee.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{attendee.name}</p>
                      <p className="text-sm text-muted-foreground">{attendee.status}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="expenses">
            <ExpenseTracker />
          </TabsContent>
          
          <TabsContent value="vendors">
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                No vendors booked yet
              </p>
              <Button data-testid="button-browse-vendors">
                Browse Vendors
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
