import { useLocation } from "wouter";
import { Calendar, MessageCircle, IndianRupee, Store, Bell, Users, Star, Bike, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  icon: any;
  title: string;
  description: string;
  highlighted: boolean;
  badge?: string;
  link?: string;
}

const features: Feature[] = [
  {
    icon: Calendar,
    title: "Manage Events",
    description: "Create and manage all types of events - reunions, parties, group rides, fitness activities, and more. Set dates, locations, and invite your group instantly.",
    highlighted: true,
    badge: "Most Popular",
    link: "/manage-events",
  },
  {
    icon: IndianRupee,
    title: "Split Expenses",
    description: "Track expenses and split bills fairly among group members. See who paid, who owes, and settle balances easily. No more awkward money conversations!",
    highlighted: true,
    badge: "Essential",
    link: "/split-expenses",
  },
  {
    icon: MessageCircle,
    title: "Group Chat",
    description: "Real-time messaging within your event group. Share updates, photos, and coordinate seamlessly.",
    highlighted: true,
    badge: "Interactive",
    link: "/group-chat-demo",
  },
  {
    icon: Users,
    title: "Attendee Management",
    description: "See who's coming, track RSVPs, and manage your guest list all in one place.",
    highlighted: false,
  },
  {
    icon: Store,
    title: "Vendor Marketplace",
    description: "Browse and book trusted vendors for venues, catering, photography, and decorations. Find the perfect partners for your celebration!",
    highlighted: true,
    badge: "New",
    link: "/vendor-marketplace",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss important updates. Get notifications for messages, payments, and event changes.",
    highlighted: false,
  },
];

export default function Features() {
  const [, navigate] = useLocation();
  
  const handleFeatureClick = (feature: Feature) => {
    if (feature.link) {
      navigate(feature.link);
    }
  };
  
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
        
        {/* Highlighted Features - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {features.filter(f => f.highlighted).slice(0, 2).map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 shadow-lg"
              data-testid={`card-feature-highlighted-${index}`}
              onClick={() => handleFeatureClick(feature)}
            >
              {feature.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {feature.badge}
                </Badge>
              )}
              {feature.link && (
                <Badge variant="outline" className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 text-orange-600 dark:text-orange-300 border-orange-300 dark:border-orange-700">
                  Try It Free
                </Badge>
              )}
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center shadow-md">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-2xl mb-3 text-orange-700 dark:text-orange-100">
                    {feature.title}
                  </h3>
                  <p className="text-orange-600/80 dark:text-orange-200/80 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Group Chat & Vendor Marketplace - Full Width Highlighted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Group Chat - Purple Theme */}
          {features.filter(f => f.highlighted && f.title === "Group Chat").map((feature, index) => (
            <Card 
              key={`chat-${index}`} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-purple-950/30 dark:via-violet-950/20 dark:to-purple-950/30 shadow-lg"
              data-testid="card-feature-highlighted-2"
              onClick={() => handleFeatureClick(feature)}
            >
              {feature.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {feature.badge}
                </Badge>
              )}
              {feature.link && (
                <Badge variant="outline" className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 text-purple-600 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                  Try It Free
                </Badge>
              )}
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-purple-700 dark:text-purple-100">
                    {feature.title}
                  </h3>
                  <p className="text-purple-600/80 dark:text-purple-200/80 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Vendor Marketplace - Teal Theme */}
          {features.filter(f => f.highlighted && f.title === "Vendor Marketplace").map((feature, index) => (
            <Card 
              key={`vendor-${index}`} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-950/30 dark:via-cyan-950/20 dark:to-teal-950/30 shadow-lg"
              data-testid="card-feature-highlighted-3"
              onClick={() => handleFeatureClick(feature)}
            >
              {feature.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {feature.badge}
                </Badge>
              )}
              {feature.link && (
                <Badge variant="outline" className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 text-teal-600 dark:text-teal-300 border-teal-300 dark:border-teal-700">
                  Try It Free
                </Badge>
              )}
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-teal-700 dark:text-teal-100">
                    {feature.title}
                  </h3>
                  <p className="text-teal-600/80 dark:text-teal-200/80 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Other Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.filter(f => !f.highlighted).map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover-elevate cursor-pointer"
              data-testid={`card-feature-${index}`}
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
