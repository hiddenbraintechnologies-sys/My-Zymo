import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import QuoteDialog from "@/components/QuoteDialog";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import groupRideImage from "@assets/generated_images/group_motorcycle_ride_adventure.png";
import yogaImage from "@assets/generated_images/outdoor_yoga_fitness_session.png";
import marathonImage from "@assets/generated_images/marathon_running_community_event.png";
import reunionImage from "@assets/generated_images/college_reunion_celebration_party.png";
import birthdayImage from "@assets/generated_images/birthday_party_event_placeholder.png";

const heroSlides = [
  {
    image: heroImage,
    title: "Plan Your Perfect Gathering",
    subtitle: "From college reunions to birthday bashes, organize unforgettable celebrations with ease",
    category: "Celebrations",
  },
  {
    image: reunionImage,
    title: "Reunite & Celebrate",
    subtitle: "Bring your college friends, school batch, or family together for memorable reunions",
    category: "Reunions",
  },
  {
    image: groupRideImage,
    title: "Group Rides & Adventures",
    subtitle: "Plan epic motorcycle rides, cycling trips, and adventure getaways with your crew",
    category: "Group Rides",
  },
  {
    image: yogaImage,
    title: "Fitness & Wellness",
    subtitle: "Organize yoga sessions, fitness bootcamps, and wellness retreats with your community",
    category: "Fitness",
  },
  {
    image: marathonImage,
    title: "Sports & Marathons",
    subtitle: "Coordinate running events, sports meetups, and athletic challenges together",
    category: "Sports",
  },
  {
    image: birthdayImage,
    title: "Birthday Celebrations",
    subtitle: "Create magical birthday parties and milestone celebrations for your loved ones",
    category: "Birthdays",
  },
];

export default function Hero() {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const slide = heroSlides[currentSlide];

  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      {/* Background Images */}
      {heroSlides.map((s, index) => (
        <img
          key={index}
          src={s.image}
          alt={s.category}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white hidden md:flex items-center justify-center"
        data-testid="button-hero-prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors text-white hidden md:flex items-center justify-center"
        data-testid="button-hero-next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
        {/* Category Badge */}
        <div 
          className={`mb-4 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium transition-all duration-500 ${
            isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {slide.category}
        </div>
        
        <h1 
          className={`font-heading font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 md:mb-6 leading-tight transition-all duration-500 ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          {slide.title}
        </h1>
        <p 
          className={`text-lg md:text-xl lg:text-2xl max-w-3xl text-white/95 font-light mb-8 transition-all duration-500 delay-100 ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          {slide.subtitle}
        </p>
        <Button
          data-testid="button-get-quote"
          size="lg"
          className="bg-primary/90 backdrop-blur-sm text-white border border-white/20 hover:bg-primary text-lg px-8 py-6 shadow-lg"
          onClick={() => setQuoteDialogOpen(true)}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Get a Free Quote
        </Button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide 
                  ? "w-8 h-2 bg-white" 
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              }`}
              data-testid={`button-hero-dot-${index}`}
            />
          ))}
        </div>
      </div>

      <QuoteDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
    </div>
  );
}
