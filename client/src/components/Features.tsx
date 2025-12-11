import { useLocation } from "wouter";
import { Calendar, MessageCircle, IndianRupee, Store, Bell, Users, Star, Bike, Dumbbell, Camera, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    icon: IndianRupee,
    title: "Split Expenses",
    description: "Track expenses and split bills fairly among group members. See who paid, who owes, and settle balances easily. No more awkward money conversations!",
    highlighted: true,
    badge: "Essential",
    link: "/split-expenses",
  },
  {
    icon: Calendar,
    title: "Manage Events",
    description: "Create and manage all types of events - reunions, parties, group rides, fitness activities, and more. Set dates, locations, and invite your group instantly.",
    highlighted: true,
    badge: "Most Popular",
    link: "/manage-events",
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
    highlighted: true,
    badge: "Interactive",
    link: "/attendee-management",
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
    highlighted: true,
    badge: "Interactive",
    link: "/smart-reminders",
  },
  {
    icon: Camera,
    title: "Photo Album",
    description: "Capture and share memories with your event group. Create beautiful photo albums that everyone can contribute to.",
    highlighted: true,
    badge: "Interactive",
    link: "/photo-album",
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

        {/* SPLIT EXPENSES - Hero Feature Section */}
        <div 
          className="mb-10 relative overflow-hidden rounded-3xl cursor-pointer group"
          onClick={() => navigate("/split-expenses")}
          data-testid="card-feature-split-expenses-hero"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-95" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
          
          {/* Floating Rupee Icons */}
          <div className="absolute top-6 right-6 md:top-8 md:right-12 opacity-20">
            <IndianRupee className="w-24 h-24 md:w-40 md:h-40 text-white animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10 hidden md:block">
            <IndianRupee className="w-20 h-20 text-white" />
          </div>
          
          <div className="relative z-10 p-6 md:p-10 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start lg:items-center">
              {/* Left Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Loved Feature
                  </Badge>
                  <Badge className="bg-yellow-400 text-yellow-900 border-0 text-sm px-3 py-1">
                    <Star className="w-3 h-3 mr-1 fill-yellow-900" />
                    Essential
                  </Badge>
                </div>
                
                <h3 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                  Split Expenses <span className="text-yellow-300">Easily</span>
                </h3>
                
                <p className="text-white/90 text-lg md:text-xl mb-6 max-w-xl leading-relaxed">
                  No more awkward "who owes whom" conversations! Track every expense, split bills fairly, and see exactly who needs to pay what.
                </p>
                
                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                    <span>Auto-split among members</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                    <span>Track who paid what</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                    <span>Settlement suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                    <span>UPI payment ready</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-yellow-50 font-semibold shadow-lg group-hover:scale-105 transition-transform"
                  data-testid="button-try-split-expenses"
                >
                  Try Split Expenses Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {/* Right Side - Visual */}
              <div className="hidden lg:block relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
                  <div className="text-white/80 text-sm mb-3">Example Split</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-6 bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-sm font-bold">R</div>
                        <span className="text-white font-medium">Rahul</span>
                      </div>
                      <span className="text-green-300 font-bold">+₹500</span>
                    </div>
                    <div className="flex items-center justify-between gap-6 bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-bold">P</div>
                        <span className="text-white font-medium">Priya</span>
                      </div>
                      <span className="text-red-300 font-bold">-₹250</span>
                    </div>
                    <div className="flex items-center justify-between gap-6 bg-white/10 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white text-sm font-bold">A</div>
                        <span className="text-white font-medium">Amit</span>
                      </div>
                      <span className="text-red-300 font-bold">-₹250</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/20 text-center">
                    <span className="text-white/70 text-sm">Priya & Amit owe Rahul ₹250 each</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Manage Events - Second Highlight */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {features.filter(f => f.title === "Manage Events").map((feature, index) => (
            <Card 
              key={`events-${index}`} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30 shadow-lg"
              data-testid="card-feature-highlighted-events"
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
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-orange-700 dark:text-orange-100">
                    {feature.title}
                  </h3>
                  <p className="text-orange-600/80 dark:text-orange-200/80 text-base leading-relaxed max-w-2xl">
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

        {/* Attendee Management - Green Theme - Full Width */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {features.filter(f => f.highlighted && f.title === "Attendee Management").map((feature, index) => (
            <Card 
              key={`attendee-${index}`} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-emerald-950/30 shadow-lg"
              data-testid="card-feature-highlighted-attendee"
              onClick={() => handleFeatureClick(feature)}
            >
              {feature.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {feature.badge}
                </Badge>
              )}
              {feature.link && (
                <Badge variant="outline" className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                  Try It Free
                </Badge>
              )}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-emerald-700 dark:text-emerald-100">
                    {feature.title}
                  </h3>
                  <p className="text-emerald-600/80 dark:text-emerald-200/80 text-base leading-relaxed max-w-2xl">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Smart Reminders & Photo Album - Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Smart Reminders - Blue Theme */}
          {features.filter(f => f.highlighted && f.title === "Smart Reminders").map((feature, index) => (
            <Card 
              key={`reminders-${index}`} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-sky-950/30 shadow-lg"
              data-testid="card-feature-highlighted-reminders"
              onClick={() => handleFeatureClick(feature)}
            >
              {feature.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {feature.badge}
                </Badge>
              )}
              {feature.link && (
                <Badge variant="outline" className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 text-sky-600 dark:text-sky-300 border-sky-300 dark:border-sky-700">
                  Try It Free
                </Badge>
              )}
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-sky-700 dark:text-sky-100">
                    {feature.title}
                  </h3>
                  <p className="text-sky-600/80 dark:text-sky-200/80 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Photo Album - Rose Theme */}
          {features.filter(f => f.highlighted && f.title === "Photo Album").map((feature, index) => (
            <Card 
              key={`album-${index}`} 
              className="p-6 md:p-8 hover-elevate cursor-pointer relative overflow-hidden border-2 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-rose-950/30 shadow-lg"
              data-testid="card-feature-highlighted-album"
              onClick={() => handleFeatureClick(feature)}
            >
              {feature.badge && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {feature.badge}
                </Badge>
              )}
              {feature.link && (
                <Badge variant="outline" className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-700">
                  Try It Free
                </Badge>
              )}
              <div className="flex flex-col gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-rose-700 dark:text-rose-100">
                    {feature.title}
                  </h3>
                  <p className="text-rose-600/80 dark:text-rose-200/80 text-base leading-relaxed">
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
