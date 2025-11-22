import { Button } from "@/components/ui/button";
import { Calendar, Users, IndianRupee } from "lucide-react";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";

export default function Hero() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      <img 
        src={heroImage} 
        alt="Celebration" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl mb-4 md:mb-6">
          Plan Your Perfect Gathering
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 max-w-3xl text-white/95">
          From college reunions to birthday bashes, organize unforgettable celebrations with ease
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button 
            size="lg" 
            className="bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 text-white text-base md:text-lg px-8 py-6"
            data-testid="button-get-started"
            onClick={() => {
              console.log('[Hero] Get Started clicked, navigating to /events');
              setLocation('/events');
            }}
          >
            Get Started Free
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-lg border-white/40 text-white text-base md:text-lg px-8 py-6"
            data-testid="button-explore-vendors"
            onClick={() => {
              console.log('[Hero] Explore Vendors clicked, navigating to /vendors');
              setLocation('/vendors');
            }}
          >
            Explore Vendors
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-white/90">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm md:text-base">Easy Planning</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm md:text-base">Group Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            <span className="text-sm md:text-base">Split Expenses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
