import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, MapPin, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import QuoteDialog from "@/components/QuoteDialog";
import heroImage from "@assets/generated_images/homepage_hero_celebration_image.png";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { Event } from "@shared/schema";

export default function Hero() {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/public-events"],
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const publicEventsWithImages = events?.filter(e => e.imageUrl) || [];
  const hasEvents = publicEventsWithImages.length > 0;

  if (!hasEvents) {
    return (
      <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
        <img 
          src={heroImage} 
          alt="Celebration" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 md:mb-8 leading-tight">
            Plan Your Perfect Gathering
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl max-w-4xl text-white/95 font-light mb-8">
            From college reunions to birthday bashes, organize unforgettable celebrations with ease
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
        </div>

        <QuoteDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden" data-testid="hero-carousel">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {publicEventsWithImages.slice(0, 5).map((event, index) => (
            <div 
              key={event.id} 
              className="flex-[0_0_100%] min-w-0 relative h-full"
              data-testid={`hero-slide-${index}`}
            >
              <img 
                src={event.imageUrl || heroImage} 
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
              
              <div className="relative h-full flex flex-col justify-end px-4 md:px-8 lg:px-16 pb-16 md:pb-24">
                <div className="max-w-4xl">
                  <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured Event
                  </Badge>
                  
                  <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl mb-4 text-white leading-tight line-clamp-2">
                    {event.title}
                  </h1>
                  
                  {event.description && (
                    <p className="text-lg md:text-xl text-white/90 mb-6 line-clamp-2 max-w-2xl">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                    <div className="flex items-center gap-2 text-white/90">
                      <Calendar className="w-5 h-5" />
                      <span className="text-base md:text-lg">
                        {format(new Date(event.date), 'PPP')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="w-5 h-5" />
                      <span className="text-base md:text-lg line-clamp-1">
                        {event.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/events/${event.id}`}>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg"
                        data-testid={`button-view-event-${event.id}`}
                      >
                        View Event
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                      onClick={() => setQuoteDialogOpen(true)}
                      data-testid="button-get-quote"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get a Free Quote
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all z-10"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all z-10"
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {publicEventsWithImages.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/70"
            }`}
            data-testid={`indicator-slide-${index}`}
          />
        ))}
      </div>

      <QuoteDialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen} />
    </div>
  );
}
