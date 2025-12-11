import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  IndianRupee, 
  Camera, 
  MessageCircle, 
  Bell, 
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";

const addOns = [
  {
    id: "expenses",
    icon: IndianRupee,
    title: "Split Expenses",
    subtitle: "Track & settle bills easily",
    description: "Auto-split among members, see who owes what",
    highlight: "Free to use",
    color: "bg-green-500",
    link: "/split-expenses",
  },
  {
    id: "photos",
    icon: Camera,
    title: "Photo Albums",
    subtitle: "Share memories together",
    description: "Create shared albums everyone can contribute to",
    highlight: "Unlimited storage",
    color: "bg-amber-500",
    link: "/photo-album",
  },
  {
    id: "chat",
    icon: MessageCircle,
    title: "Group Chat",
    subtitle: "Stay connected",
    description: "Real-time messaging with your event group",
    highlight: "File sharing included",
    color: "bg-blue-500",
    link: "/group-chat-demo",
  },
  {
    id: "reminders",
    icon: Bell,
    title: "Smart Reminders",
    subtitle: "Never miss updates",
    description: "Get notified for payments, RSVPs & changes",
    highlight: "Push notifications",
    color: "bg-purple-500",
    link: "/smart-reminders",
  },
  {
    id: "rsvp",
    icon: Users,
    title: "RSVP Management",
    subtitle: "Track attendees",
    description: "See who's coming and manage your guest list",
    highlight: "Export to Excel",
    color: "bg-rose-500",
    link: "/attendee-management",
  },
  {
    id: "planning",
    icon: Calendar,
    title: "Event Planning",
    subtitle: "All-in-one organizer",
    description: "Polls, itinerary builder, and task management",
    highlight: "AI-powered",
    color: "bg-cyan-500",
    link: "/events/create",
  },
];

export default function PlatformAddOnsRail() {
  const [, navigate] = useLocation();

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" data-testid="section-addons">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-semibold text-2xl md:text-3xl mb-2">
              Add more to your event
            </h2>
            <p className="text-muted-foreground">
              Powerful tools to make your celebration unforgettable
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="hidden md:flex gap-2 text-primary"
            onClick={() => navigate("/dashboard")}
            data-testid="button-view-all-features"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-4">
            {addOns.map((addon) => (
              <Card 
                key={addon.id}
                className="w-[280px] flex-shrink-0 cursor-pointer hover-elevate"
                onClick={() => navigate(addon.link)}
                data-testid={`card-addon-${addon.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`${addon.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <addon.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{addon.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 whitespace-normal">
                        {addon.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <CheckCircle className="w-3 h-3" />
                        <span>{addon.highlight}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}
