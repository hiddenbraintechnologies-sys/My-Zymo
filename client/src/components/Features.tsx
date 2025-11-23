import { Calendar, MessageCircle, IndianRupee, Store, Bell, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Event Planning",
    description: "Create and manage events with ease. Set dates, locations, and invite your friends instantly.",
  },
  {
    icon: MessageCircle,
    title: "Group Chat",
    description: "Real-time messaging within your event group. Share updates, photos, and coordinate seamlessly.",
  },
  {
    icon: IndianRupee,
    title: "Expense Splitting",
    description: "Track expenses and split bills fairly. Know exactly who owes what, no awkward conversations.",
  },
  {
    icon: Store,
    title: "Vendor Marketplace",
    description: "Browse and book trusted vendors for venues, catering, photography, and decorations.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss important updates. Get notifications for messages, payments, and event changes.",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "See who's coming, track RSVPs, and manage your guest list all in one place.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            All the tools to make your celebration planning stress-free and enjoyable
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover-elevate cursor-pointer"
              data-testid={`card-feature-${index}`}
              onClick={() => console.log(`Feature ${feature.title} clicked`)}
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
