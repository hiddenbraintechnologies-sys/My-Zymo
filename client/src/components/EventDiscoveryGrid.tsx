import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Cake, 
  Bike, 
  Dumbbell, 
  Trophy, 
  Home,
  Heart,
  Music,
  Plane,
  Mountain,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

import reunionImage from "@assets/generated_images/college_reunion_celebration_party.png";
import birthdayImage from "@assets/generated_images/birthday_party_event_placeholder.png";
import groupRideImage from "@assets/generated_images/group_motorcycle_ride_adventure.png";
import yogaImage from "@assets/generated_images/outdoor_yoga_fitness_session.png";
import marathonImage from "@assets/generated_images/marathon_running_community_event.png";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";

const destinations = [
  {
    id: "reunions",
    title: "Reunions",
    subtitle: "College & School Batches",
    description: "Journey into memories with your classmates",
    image: reunionImage,
    icon: GraduationCap,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "birthdays",
    title: "Birthdays",
    subtitle: "Milestone Celebrations",
    description: "Make every birthday special and memorable",
    image: birthdayImage,
    icon: Cake,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "rides",
    title: "Group Rides",
    subtitle: "Adventure Awaits",
    description: "Explore new roads with fellow riders",
    image: groupRideImage,
    icon: Bike,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "fitness",
    title: "Fitness Events",
    subtitle: "Yoga, HIIT & More",
    description: "Transform together with group workouts",
    image: yogaImage,
    icon: Dumbbell,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "sports",
    title: "Sports Events",
    subtitle: "Marathons & Tournaments",
    description: "Compete, cheer, and celebrate victories",
    image: marathonImage,
    icon: Trophy,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "family",
    title: "Family Gatherings",
    subtitle: "Bonds That Matter",
    description: "Bring the family together for special moments",
    image: heroImage,
    icon: Heart,
    color: "from-amber-500 to-yellow-500",
  },
];

const cityAbbreviations = ["MUM", "DEL", "BLR", "HYD", "CHE", "GOA", "JAI", "PUN", "KOL", "AHM"];

export default function EventDiscoveryGrid() {
  const [, navigate] = useLocation();

  return (
    <section className="py-12 md:py-16" data-testid="section-discovery">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            {cityAbbreviations.map((city, i) => (
              <span 
                key={city} 
                className="text-xs font-medium text-muted-foreground hover:text-primary cursor-pointer transition-colors"
              >
                {city}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-lg">
            Embark on a journey of celebration with Myzymo, where memories meet magic.
          </p>
          <Button 
            variant="ghost" 
            className="text-primary gap-2 mt-2"
            onClick={() => navigate("/events")}
            data-testid="button-explore-events"
          >
            Explore All Events
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((dest) => (
            <Card 
              key={dest.id}
              className="overflow-hidden cursor-pointer group hover-elevate"
              onClick={() => navigate("/events/create")}
              data-testid={`card-discover-${dest.id}`}
            >
              <div className="relative aspect-[3/4]">
                <img 
                  src={dest.image} 
                  alt={dest.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${dest.color} opacity-40`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <div className="flex items-center gap-1 mb-1">
                    <dest.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm">{dest.title}</h3>
                  <p className="text-xs text-white/80 line-clamp-1">{dest.subtitle}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
          {destinations.map((dest) => (
            <span 
              key={dest.id} 
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate("/events/create")}
            >
              {dest.subtitle}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
