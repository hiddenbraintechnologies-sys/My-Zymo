import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, Users, Camera, Heart } from "lucide-react";
import { useLocation } from "wouter";
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
    isReunion: false,
  },
  {
    image: reunionImage,
    title: "Reunite & Celebrate",
    subtitle: "Relive the memories, reconnect with old friends, and create new ones together",
    category: "Reunions",
    isReunion: true,
    reunionBadge: "Class of",
    reunionHighlight: "Batch Reunions",
  },
  {
    image: groupRideImage,
    title: "Group Rides & Adventures",
    subtitle: "Plan epic motorcycle rides, cycling trips, and adventure getaways with your crew",
    category: "Group Rides",
    isReunion: false,
  },
  {
    image: yogaImage,
    title: "Fitness & Wellness",
    subtitle: "Organize yoga sessions, fitness bootcamps, and wellness retreats with your community",
    category: "Fitness",
    isReunion: false,
  },
  {
    image: marathonImage,
    title: "Sports & Marathons",
    subtitle: "Coordinate running events, sports meetups, and athletic challenges together",
    category: "Sports",
    isReunion: false,
  },
  {
    image: birthdayImage,
    title: "Birthday Celebrations",
    subtitle: "Create magical birthday parties and milestone celebrations for your loved ones",
    category: "Birthdays",
    isReunion: false,
  },
];

export default function Hero() {
  const [, setLocation] = useLocation();
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
        {/* Reunion-specific floating decorative elements */}
        {slide.isReunion && (
          <>
            <div className={`absolute top-20 left-8 md:left-20 transition-all duration-700 ${
              isTransitioning ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}>
              <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-2xl p-3 border border-white/20 animate-bounce" style={{ animationDuration: '3s' }}>
                <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <div className={`absolute top-32 right-8 md:right-24 transition-all duration-700 delay-100 ${
              isTransitioning ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}>
              <div className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 backdrop-blur-sm rounded-2xl p-3 border border-white/20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                <Camera className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <div className={`absolute bottom-32 left-12 md:left-32 transition-all duration-700 delay-200 ${
              isTransitioning ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}>
              <div className="bg-gradient-to-br from-teal-500/30 to-cyan-500/30 backdrop-blur-sm rounded-2xl p-3 border border-white/20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '1s' }}>
                <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
            <div className={`absolute bottom-40 right-10 md:right-28 transition-all duration-700 delay-300 ${
              isTransitioning ? "opacity-0 scale-75" : "opacity-100 scale-100"
            }`}>
              <div className="bg-gradient-to-br from-rose-500/30 to-red-500/30 backdrop-blur-sm rounded-2xl p-3 border border-white/20 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.3s' }}>
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </>
        )}

        {/* Category Badge - Special styling for Reunions */}
        <div 
          className={`mb-4 px-4 py-1.5 rounded-full backdrop-blur-sm border text-sm font-medium transition-all duration-500 ${
            slide.isReunion 
              ? "bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-300/50" 
              : "bg-white/20 border-white/30"
          } ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
        >
          {slide.isReunion ? (
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {slide.category}
            </span>
          ) : (
            slide.category
          )}
        </div>

        {/* Reunion Years Badge */}
        {slide.isReunion && (
          <div className={`mb-3 flex items-center gap-3 transition-all duration-500 ${
            isTransitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}>
            <div className="flex -space-x-2">
              {["5", "10", "15", "25"].map((years, i) => (
                <div 
                  key={years}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white/50 shadow-lg"
                  style={{ zIndex: 4 - i }}
                >
                  {years}yr
                </div>
              ))}
            </div>
            <span className="text-white/80 text-sm font-medium">Anniversary Reunions</span>
          </div>
        )}
        
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

        {/* Reunion-specific quick stats */}
        {slide.isReunion && (
          <div className={`flex items-center gap-6 mb-6 transition-all duration-500 delay-150 ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Users className="w-4 h-4 text-amber-300" />
              <span className="text-sm">School Batches</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <GraduationCap className="w-4 h-4 text-purple-300" />
              <span className="text-sm">College Alumni</span>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Heart className="w-4 h-4 text-rose-300" />
              <span className="text-sm">Family Gatherings</span>
            </div>
          </div>
        )}

        <Button
          data-testid="button-get-started"
          size="lg"
          className={`text-white text-lg px-8 py-6 shadow-lg border-0 ${
            slide.isReunion 
              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
              : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          }`}
          onClick={() => setLocation("/login")}
        >
          {slide.isReunion ? "Plan Your Reunion" : "Get Started Free"}
          <ArrowRight className="ml-2 h-5 w-5" />
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
    </div>
  );
}
