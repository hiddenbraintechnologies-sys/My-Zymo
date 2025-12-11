import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Users, Calendar, Star } from "lucide-react";
import { useLocation } from "wouter";
import EventBookingWidget from "./EventBookingWidget";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";

export default function LandingHero() {
  const [, navigate] = useLocation();

  return (
    <section className="relative min-h-[600px] md:min-h-[700px]" data-testid="section-hero">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-8 md:pt-28 md:pb-16">
        <div className="text-center text-white mb-8 md:mb-12">
          <Badge className="mb-4 bg-white/20 border-white/30 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Bringing People Together
          </Badge>
          <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl mb-4 drop-shadow-lg">
            Hi there, plan your <span className="text-primary">celebration</span> with ease!
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Events, Groups, Expenses and beyond - everything you need in one place
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10,000+ Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>50+ Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9 Rating</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <EventBookingWidget />
        </div>
      </div>
    </section>
  );
}
