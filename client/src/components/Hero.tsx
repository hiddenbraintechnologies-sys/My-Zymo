import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, Users, Camera, Heart, Bike, Mountain, Dumbbell, Flower2, Trophy, Timer, Cake, Gift, PartyPopper, Sparkles, Star, Music, Flame, Map, Route, Wind, Zap } from "lucide-react";
import { useLocation } from "wouter";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import groupRideImage from "@assets/generated_images/group_motorcycle_ride_adventure.png";
import yogaImage from "@assets/generated_images/outdoor_yoga_fitness_session.png";
import marathonImage from "@assets/generated_images/marathon_running_community_event.png";
import reunionImage from "@assets/generated_images/college_reunion_celebration_party.png";
import birthdayImage from "@assets/generated_images/birthday_party_event_placeholder.png";

type SlideTheme = {
  gradient: string;
  badgeGradient: string;
  buttonGradient: string;
  buttonHoverGradient: string;
  icon: typeof GraduationCap;
  floatingIcons: Array<{
    icon: typeof GraduationCap;
    gradient: string;
    position: string;
    delay: string;
    duration: string;
  }>;
  badges?: Array<{ label: string; value?: string }>;
  quickStats: Array<{ icon: typeof GraduationCap; label: string; color: string }>;
  cta: string;
};

const slideThemes: Record<string, SlideTheme> = {
  Celebrations: {
    gradient: "from-orange-500/40 to-amber-500/40",
    badgeGradient: "bg-gradient-to-r from-orange-500/40 to-amber-500/40 border-orange-300/50",
    buttonGradient: "bg-gradient-to-r from-orange-500 to-amber-500",
    buttonHoverGradient: "hover:from-orange-600 hover:to-amber-600",
    icon: Sparkles,
    floatingIcons: [
      { icon: Sparkles, gradient: "from-orange-500/30 to-amber-500/30", position: "top-20 left-8 md:left-20", delay: "0s", duration: "3s" },
      { icon: PartyPopper, gradient: "from-pink-500/30 to-rose-500/30", position: "top-32 right-8 md:right-24", delay: "0.5s", duration: "2.5s" },
      { icon: Music, gradient: "from-violet-500/30 to-purple-500/30", position: "bottom-32 left-12 md:left-32", delay: "1s", duration: "2.8s" },
      { icon: Star, gradient: "from-yellow-500/30 to-orange-500/30", position: "bottom-40 right-10 md:right-28", delay: "0.3s", duration: "3.2s" },
    ],
    quickStats: [
      { icon: PartyPopper, label: "All Occasions", color: "text-orange-300" },
      { icon: Users, label: "Group Events", color: "text-amber-300" },
      { icon: Sparkles, label: "Special Moments", color: "text-yellow-300" },
    ],
    cta: "Start Planning",
  },
  Reunions: {
    gradient: "from-purple-500/40 to-pink-500/40",
    badgeGradient: "bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-300/50",
    buttonGradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    buttonHoverGradient: "hover:from-purple-600 hover:to-pink-600",
    icon: GraduationCap,
    floatingIcons: [
      { icon: GraduationCap, gradient: "from-purple-500/30 to-pink-500/30", position: "top-20 left-8 md:left-20", delay: "0s", duration: "3s" },
      { icon: Camera, gradient: "from-amber-500/30 to-orange-500/30", position: "top-32 right-8 md:right-24", delay: "0.5s", duration: "2.5s" },
      { icon: Users, gradient: "from-teal-500/30 to-cyan-500/30", position: "bottom-32 left-12 md:left-32", delay: "1s", duration: "2.8s" },
      { icon: Heart, gradient: "from-rose-500/30 to-red-500/30", position: "bottom-40 right-10 md:right-28", delay: "0.3s", duration: "3.2s" },
    ],
    badges: [
      { label: "5yr" },
      { label: "10yr" },
      { label: "15yr" },
      { label: "25yr" },
    ],
    quickStats: [
      { icon: Users, label: "School Batches", color: "text-amber-300" },
      { icon: GraduationCap, label: "College Alumni", color: "text-purple-300" },
      { icon: Heart, label: "Family Gatherings", color: "text-rose-300" },
    ],
    cta: "Plan Your Reunion",
  },
  "Group Rides": {
    gradient: "from-blue-500/40 to-cyan-500/40",
    badgeGradient: "bg-gradient-to-r from-blue-500/40 to-cyan-500/40 border-blue-300/50",
    buttonGradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    buttonHoverGradient: "hover:from-blue-600 hover:to-cyan-600",
    icon: Bike,
    floatingIcons: [
      { icon: Bike, gradient: "from-blue-500/30 to-cyan-500/30", position: "top-20 left-8 md:left-20", delay: "0s", duration: "3s" },
      { icon: Mountain, gradient: "from-emerald-500/30 to-teal-500/30", position: "top-32 right-8 md:right-24", delay: "0.5s", duration: "2.5s" },
      { icon: Route, gradient: "from-indigo-500/30 to-blue-500/30", position: "bottom-32 left-12 md:left-32", delay: "1s", duration: "2.8s" },
      { icon: Wind, gradient: "from-sky-500/30 to-cyan-500/30", position: "bottom-40 right-10 md:right-28", delay: "0.3s", duration: "3.2s" },
    ],
    badges: [
      { label: "50km" },
      { label: "100km" },
      { label: "200km" },
      { label: "500km" },
    ],
    quickStats: [
      { icon: Bike, label: "Motorcycle Tours", color: "text-blue-300" },
      { icon: Mountain, label: "Adventure Trails", color: "text-emerald-300" },
      { icon: Map, label: "Scenic Routes", color: "text-cyan-300" },
    ],
    cta: "Join a Ride",
  },
  Fitness: {
    gradient: "from-green-500/40 to-emerald-500/40",
    badgeGradient: "bg-gradient-to-r from-green-500/40 to-emerald-500/40 border-green-300/50",
    buttonGradient: "bg-gradient-to-r from-green-500 to-emerald-500",
    buttonHoverGradient: "hover:from-green-600 hover:to-emerald-600",
    icon: Flower2,
    floatingIcons: [
      { icon: Flower2, gradient: "from-green-500/30 to-emerald-500/30", position: "top-20 left-8 md:left-20", delay: "0s", duration: "3s" },
      { icon: Dumbbell, gradient: "from-violet-500/30 to-purple-500/30", position: "top-32 right-8 md:right-24", delay: "0.5s", duration: "2.5s" },
      { icon: Heart, gradient: "from-rose-500/30 to-pink-500/30", position: "bottom-32 left-12 md:left-32", delay: "1s", duration: "2.8s" },
      { icon: Zap, gradient: "from-amber-500/30 to-yellow-500/30", position: "bottom-40 right-10 md:right-28", delay: "0.3s", duration: "3.2s" },
    ],
    badges: [
      { label: "Yoga" },
      { label: "HIIT" },
      { label: "Cardio" },
      { label: "Zen" },
    ],
    quickStats: [
      { icon: Flower2, label: "Yoga Sessions", color: "text-green-300" },
      { icon: Dumbbell, label: "Fitness Classes", color: "text-violet-300" },
      { icon: Heart, label: "Wellness Retreats", color: "text-rose-300" },
    ],
    cta: "Find a Class",
  },
  Sports: {
    gradient: "from-red-500/40 to-orange-500/40",
    badgeGradient: "bg-gradient-to-r from-red-500/40 to-orange-500/40 border-red-300/50",
    buttonGradient: "bg-gradient-to-r from-red-500 to-orange-500",
    buttonHoverGradient: "hover:from-red-600 hover:to-orange-600",
    icon: Trophy,
    floatingIcons: [
      { icon: Trophy, gradient: "from-amber-500/30 to-yellow-500/30", position: "top-20 left-8 md:left-20", delay: "0s", duration: "3s" },
      { icon: Timer, gradient: "from-red-500/30 to-orange-500/30", position: "top-32 right-8 md:right-24", delay: "0.5s", duration: "2.5s" },
      { icon: Flame, gradient: "from-orange-500/30 to-red-500/30", position: "bottom-32 left-12 md:left-32", delay: "1s", duration: "2.8s" },
      { icon: Zap, gradient: "from-yellow-500/30 to-amber-500/30", position: "bottom-40 right-10 md:right-28", delay: "0.3s", duration: "3.2s" },
    ],
    badges: [
      { label: "5K" },
      { label: "10K" },
      { label: "21K" },
      { label: "42K" },
    ],
    quickStats: [
      { icon: Trophy, label: "Marathons", color: "text-amber-300" },
      { icon: Timer, label: "Timed Events", color: "text-red-300" },
      { icon: Users, label: "Team Sports", color: "text-orange-300" },
    ],
    cta: "Join an Event",
  },
  Birthdays: {
    gradient: "from-pink-500/40 to-violet-500/40",
    badgeGradient: "bg-gradient-to-r from-pink-500/40 to-violet-500/40 border-pink-300/50",
    buttonGradient: "bg-gradient-to-r from-pink-500 to-violet-500",
    buttonHoverGradient: "hover:from-pink-600 hover:to-violet-600",
    icon: Cake,
    floatingIcons: [
      { icon: Cake, gradient: "from-pink-500/30 to-rose-500/30", position: "top-20 left-8 md:left-20", delay: "0s", duration: "3s" },
      { icon: Gift, gradient: "from-violet-500/30 to-purple-500/30", position: "top-32 right-8 md:right-24", delay: "0.5s", duration: "2.5s" },
      { icon: PartyPopper, gradient: "from-amber-500/30 to-yellow-500/30", position: "bottom-32 left-12 md:left-32", delay: "1s", duration: "2.8s" },
      { icon: Star, gradient: "from-fuchsia-500/30 to-pink-500/30", position: "bottom-40 right-10 md:right-28", delay: "0.3s", duration: "3.2s" },
    ],
    badges: [
      { label: "1st" },
      { label: "18th" },
      { label: "25th" },
      { label: "50th" },
    ],
    quickStats: [
      { icon: Cake, label: "Birthday Parties", color: "text-pink-300" },
      { icon: Gift, label: "Surprise Events", color: "text-violet-300" },
      { icon: Star, label: "Milestone Celebrations", color: "text-amber-300" },
    ],
    cta: "Plan a Party",
  },
};

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
    subtitle: "Relive the memories, reconnect with old friends, and create new ones together",
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
  const theme = slideThemes[slide.category];
  const ThemeIcon = theme.icon;

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
        {/* Floating decorative elements - themed per slide */}
        {theme.floatingIcons.map((floatIcon, index) => {
          const FloatIcon = floatIcon.icon;
          return (
            <div 
              key={index}
              className={`absolute ${floatIcon.position} transition-all duration-700 ${
                isTransitioning ? "opacity-0 scale-75" : "opacity-100 scale-100"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div 
                className={`bg-gradient-to-br ${floatIcon.gradient} backdrop-blur-sm rounded-2xl p-3 border border-white/20 animate-bounce`} 
                style={{ animationDuration: floatIcon.duration, animationDelay: floatIcon.delay }}
              >
                <FloatIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
          );
        })}

        {/* Category Badge - themed gradient */}
        <div 
          className={`mb-4 px-4 py-1.5 rounded-full backdrop-blur-sm border text-sm font-medium transition-all duration-500 ${theme.badgeGradient} ${
            isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <span className="flex items-center gap-2">
            <ThemeIcon className="w-4 h-4" />
            {slide.category}
          </span>
        </div>

        {/* Feature Badges - like anniversary years */}
        {theme.badges && (
          <div className={`mb-3 flex items-center gap-3 transition-all duration-500 ${
            isTransitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}>
            <div className="flex -space-x-2">
              {theme.badges.map((badge, i) => (
                <div 
                  key={badge.label}
                  className={`w-10 h-10 rounded-full ${theme.buttonGradient} flex items-center justify-center text-xs font-bold text-white border-2 border-white/50 shadow-lg`}
                  style={{ zIndex: theme.badges!.length - i }}
                >
                  {badge.label}
                </div>
              ))}
            </div>
            <span className="text-white/80 text-sm font-medium">
              {slide.category === "Reunions" && "Anniversary Reunions"}
              {slide.category === "Group Rides" && "Distance Challenges"}
              {slide.category === "Fitness" && "Workout Types"}
              {slide.category === "Sports" && "Race Distances"}
              {slide.category === "Birthdays" && "Milestone Ages"}
            </span>
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

        {/* Quick stats pills - themed */}
        <div className={`flex items-center gap-4 md:gap-6 mb-6 flex-wrap justify-center transition-all duration-500 delay-150 ${
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}>
          {theme.quickStats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={index}
                className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 ${
                  index === 2 ? "hidden md:flex" : "flex"
                }`}
              >
                <StatIcon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm">{stat.label}</span>
              </div>
            );
          })}
        </div>

        <Button
          data-testid="button-get-started"
          size="lg"
          className={`text-white text-lg px-8 py-6 shadow-lg border-0 ${theme.buttonGradient} ${theme.buttonHoverGradient}`}
          onClick={() => setLocation("/login")}
        >
          {theme.cta}
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
